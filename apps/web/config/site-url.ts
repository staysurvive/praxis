const defaultSiteUrl = 'https://praxis.example';
const localHttpHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

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
