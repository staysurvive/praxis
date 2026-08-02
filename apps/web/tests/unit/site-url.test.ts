import { describe, expect, it } from 'vitest';

import { resolveProductionSiteUrl, resolveSiteUrl } from '../../config/site-url';

describe('SITE_URL validation', () => {
  it('normalizes a secure root origin', () => {
    expect(resolveSiteUrl('https://example.com/')).toBe('https://example.com');
    expect(resolveSiteUrl('https://example.com:8443')).toBe('https://example.com:8443');
  });

  it.each(['http://localhost:4321', 'http://127.0.0.1:4321', 'http://[::1]:4321'])(
    'allows local HTTP for development: %s',
    (url) => {
      expect(resolveSiteUrl(url)).toBe(url);
    },
  );

  it.each([
    'not-a-url',
    'http://example.com',
    'ftp://example.com',
    'https://user:password@example.com',
    'https://example.com/blog',
    'https://example.com?source=test',
    'https://example.com#section',
  ])('rejects an unsafe or ambiguous origin: %s', (url) => {
    expect(() => resolveSiteUrl(url)).toThrow(/SITE_URL/);
  });

  it.each([
    undefined,
    'https://praxis.example',
    'https://praxis.example/',
    'https://PRAXIS.EXAMPLE',
    'https://praxis.example:443',
    'https://praxis.example./',
    'http://localhost:4321',
    'https://localhost:4321',
    'https://localhost./',
    'https://preview.localhost',
    'https://localhost.localdomain',
    'https://127.0.0.1',
    'https://127.0.0.2',
    'https://0.0.0.0',
    'https://192.168.1.10',
    'https://169.254.1.10',
    'https://[::1]',
    'https://[::ffff:127.0.0.1]',
    'https://[::ffff:7f00:1]',
    'https://[fc00::1]',
  ])('rejects the production placeholder origin: %s', (url) => {
    expect(() => resolveProductionSiteUrl(url)).toThrow(/生产构建/);
  });

  it.each(['https://www.example.com/', 'https://8.8.8.8', 'https://[2606:4700:4700::1111]'])(
    'accepts a normalized public production origin: %s',
    (url) => {
      expect(resolveProductionSiteUrl(url)).toBe(new URL(url).origin);
    },
  );
});
