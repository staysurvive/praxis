import { isIP } from 'node:net';

const defaultSiteUrl = 'https://praxis.example';
const localHttpHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

function stripIpv6Brackets(hostname: string): string {
  return hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
}

function parseIpv4(hostname: string): readonly [number, number, number, number] | undefined {
  const octets = hostname.split('.');
  if (octets.length !== 4 || octets.some((octet) => !/^\d{1,3}$/u.test(octet))) {
    return undefined;
  }

  const values = octets.map(Number);
  if (values.some((value) => value > 255)) {
    return undefined;
  }

  return [values[0], values[1], values[2], values[3]] as const;
}

function isNonPublicIpv4(hostname: string): boolean {
  const address = parseIpv4(hostname);
  if (!address) {
    return false;
  }

  const [first, second, third] = address;
  return (
    first === 0 ||
    first === 10 ||
    (first === 100 && second >= 64 && second <= 127) ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0 && (third === 0 || third === 2)) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19 || second === 51)) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
}

function parseIpv6(hostname: string): readonly number[] | undefined {
  const compressionIndex = hostname.indexOf('::');
  if (compressionIndex !== -1 && hostname.indexOf('::', compressionIndex + 2) !== -1) {
    return undefined;
  }

  const leftText = compressionIndex === -1 ? hostname : hostname.slice(0, compressionIndex);
  const rightText = compressionIndex === -1 ? '' : hostname.slice(compressionIndex + 2);

  const parsePart = (part: string): number[] | undefined => {
    if (!part) {
      return [];
    }

    const segments = part.split(':');
    const values: number[] = [];
    for (const [index, segment] of segments.entries()) {
      if (segment.includes('.')) {
        if (index !== segments.length - 1) {
          return undefined;
        }
        const ipv4 = parseIpv4(segment);
        if (!ipv4) {
          return undefined;
        }
        values.push((ipv4[0] << 8) | ipv4[1], (ipv4[2] << 8) | ipv4[3]);
        continue;
      }

      if (!/^[0-9a-f]{1,4}$/iu.test(segment)) {
        return undefined;
      }
      values.push(Number.parseInt(segment, 16));
    }
    return values;
  };

  const left = parsePart(leftText);
  const right = parsePart(rightText);
  if (!left || !right) {
    return undefined;
  }

  const length = left.length + right.length;
  if (compressionIndex === -1) {
    return length === 8 ? [...left, ...right] : undefined;
  }
  if (length >= 8) {
    return undefined;
  }

  return [...left, ...Array.from({ length: 8 - length }, () => 0), ...right];
}

function isNonPublicIpv6(hostname: string): boolean {
  const segments = parseIpv6(hostname);
  if (!segments) {
    return false;
  }

  if (segments.every((segment) => segment === 0)) {
    return true;
  }

  if (segments.slice(0, 7).every((segment) => segment === 0) && segments[7] === 1) {
    return true;
  }

  const first = segments[0];
  if ((first & 0xfe00) === 0xfc00 || (first & 0xffc0) === 0xfe80 || (first & 0xff00) === 0xff00) {
    return true;
  }

  if (segments[0] === 0x2001 && segments[1] === 0x0db8) {
    return true;
  }

  const isIpv4Mapped =
    segments.slice(0, 5).every((segment) => segment === 0) &&
    (segments[5] === 0xffff || segments[5] === 0);
  if (isIpv4Mapped) {
    const ipv4 = [segments[6] >> 8, segments[6] & 0xff, segments[7] >> 8, segments[7] & 0xff].join(
      '.',
    );
    return isNonPublicIpv4(ipv4);
  }

  return false;
}

function isNonPublicHostname(hostname: string): boolean {
  const normalizedHostname = stripIpv6Brackets(hostname).replace(/\.$/u, '').toLowerCase();
  if (
    normalizedHostname === 'localhost' ||
    normalizedHostname === 'localhost.localdomain' ||
    normalizedHostname.endsWith('.localhost')
  ) {
    return true;
  }

  const ipVersion = isIP(normalizedHostname);
  return ipVersion === 4
    ? isNonPublicIpv4(normalizedHostname)
    : ipVersion === 6 && isNonPublicIpv6(normalizedHostname);
}

export function resolveSiteUrl(value = defaultSiteUrl): string {
  let siteUrl: URL;

  try {
    siteUrl = new URL(value);
  } catch {
    throw new Error('SITE_URL 必须是有效的绝对 URL。');
  }

  const isHttps = siteUrl.protocol === 'https:';
  const isLocalHttp = siteUrl.protocol === 'http:' && localHttpHosts.has(siteUrl.hostname);

  if (!isHttps && !isLocalHttp) {
    throw new Error('SITE_URL 必须使用 HTTPS；仅本地开发地址允许 HTTP。');
  }

  if (siteUrl.username || siteUrl.password) {
    throw new Error('SITE_URL 不得包含用户名或密码。');
  }

  if (siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
    throw new Error('SITE_URL 只能包含站点 origin，不得包含路径、查询参数或片段。');
  }

  return siteUrl.origin;
}

export function resolveProductionSiteUrl(value?: string): string {
  if (!value) {
    throw new Error('生产构建必须显式设置 SITE_URL。');
  }

  const siteUrl = resolveSiteUrl(value);
  const normalizedUrl = new URL(siteUrl);
  const normalizedHostname = normalizedUrl.hostname.replace(/\.$/u, '');
  const normalizedPlaceholderHost = new URL(defaultSiteUrl).hostname;

  if (normalizedUrl.protocol !== 'https:') {
    throw new Error('生产构建的 SITE_URL 必须使用 HTTPS。');
  }

  if (isNonPublicHostname(normalizedHostname)) {
    throw new Error('生产构建的 SITE_URL 不得使用本地、私有或保留地址。');
  }

  if (normalizedHostname === normalizedPlaceholderHost) {
    throw new Error('生产构建不得使用 praxis.example 占位域名。');
  }

  return siteUrl;
}
