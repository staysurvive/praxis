import { describe, expect, it } from 'vitest';

import { resolveSiteUrl } from '../../config/site-url';

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
});
