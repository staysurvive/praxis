import type { APIRoute } from 'astro';

import { siteConfig } from '../config/site';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  if (!site) {
    throw new Error('生成 robots.txt 需要在 Astro 配置中设置 site。');
  }

  const sitemapUrl = new URL(siteConfig.discovery.sitemapPath, site);
  const body = ['User-agent: *', 'Allow: /', `Sitemap: ${sitemapUrl}`, ''].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
