// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

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
  site: process.env.SITE_URL ?? 'https://praxis.example',
  output: 'static',
  trailingSlash: 'never',
  integrations: [mdx(), sitemap({ filter: isIndexablePage })],
  vite: {
    plugins: [tailwindcss()],
  },
});
