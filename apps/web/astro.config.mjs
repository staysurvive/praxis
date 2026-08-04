// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { resolveSiteUrl } from './config/site-url';
import { legacyCompatibilityMappings } from './src/lib/content/domain';
import { contentMarkdownProcessor } from './src/lib/content/markdown';

const redirects = Object.fromEntries(legacyCompatibilityMappings.map(({ from, to }) => [from, to]));

/** @param {string} page */
function isIndexablePage(page) {
  const { pathname } = new URL(page);

  return (
    pathname !== '/404' &&
    !legacyCompatibilityMappings.some(({ from }) => pathname === from) &&
    !pathname.endsWith('.txt') &&
    !pathname.endsWith('.xml') &&
    !pathname.startsWith('/generated/')
  );
}

export default defineConfig({
  site: resolveSiteUrl(process.env.SITE_URL),
  output: 'static',
  redirects,
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'never',
  },
  markdown: {
    processor: contentMarkdownProcessor,
  },
  integrations: [sitemap({ filter: isIndexablePage })],
  vite: {
    plugins: [tailwindcss()],
  },
});
