// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { resolveSiteUrl } from './config/site-url';
import { contentMarkdownProcessor } from './src/lib/content/markdown';

/** @param {string} page */
function isIndexablePage(page) {
  const { pathname } = new URL(page);

  return (
    pathname !== '/404' &&
    !pathname.endsWith('.txt') &&
    !pathname.endsWith('.xml') &&
    !pathname.startsWith('/generated/')
  );
}

export default defineConfig({
  site: resolveSiteUrl(process.env.SITE_URL),
  output: 'static',
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
