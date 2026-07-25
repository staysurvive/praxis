import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { siteConfig } from '../config/site';
import { listEntries } from '../lib/content';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('生成 RSS 需要在 Astro 配置中设置 site。');
  }

  const entries = await listEntries();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site,
    trailingSlash: false,
    customData: `<language>${siteConfig.locale}</language>`,
    items: entries.map((entry) => ({
      title: entry.title,
      description: entry.summary,
      link: entry.url,
      pubDate: new Date(`${entry.publishedAt}T00:00:00.000Z`),
      categories: [entry.typeLabel, ...entry.tags],
    })),
  });
};
