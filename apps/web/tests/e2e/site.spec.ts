import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('editorial homepage exposes the real Praxis project and local practice data', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: '知行合一' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /实践不是提交次数/ })).toBeVisible();
  await expect(
    page.getByRole('link', { name: '构建 Praxis：从知到行的第一项长期实践' }).first(),
  ).toBeVisible();
  await expect(page.locator('a[href="/projects/praxis-foundation"]').first()).toBeVisible();
  await expect(page.getByText('GitHub Contributions')).toHaveCount(0);
});

test('type-first navigation reaches the project detail', async ({ page }) => {
  await page.goto('/projects');

  await expect(page.getByRole('heading', { level: 1, name: '项目' })).toBeVisible();
  await page.getByRole('link', { name: '构建 Praxis：从知到行的第一项长期实践' }).click();

  await expect(page).toHaveURL(/\/projects\/praxis-foundation$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('构建 Praxis');
  await expect(page.getByRole('heading', { name: '长期沉淀' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '真实实践时间轴' })).toBeVisible();
});

test('empty content types render an intentional state', async ({ page }) => {
  await page.goto('/blog');

  await expect(page.getByRole('heading', { level: 1, name: '博客' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '这里还没有正式内容' })).toBeVisible();
});

test('the notes list reaches the security review note', async ({ page }) => {
  await page.goto('/notes');

  await expect(page.getByRole('heading', { level: 1, name: '笔记' })).toBeVisible();
  await page.getByRole('link', { name: /先审后信/ }).click();

  await expect(page).toHaveURL(/\/notes\/ai-code-security-review$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('先审后信');
  await expect(page.getByRole('heading', { name: /相互否证/ })).toBeVisible();
});

test('missing routes use the branded 404', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '这一页尚未抵达' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('public pages expose canonical and social discovery metadata', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://praxis.example/',
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
    'href',
    'https://praxis.example/rss.xml',
  );
  await expect(page.locator('script:not([src])')).toHaveCount(0);
  await expect(page.locator('style')).toHaveCount(0);
  await expect(page.locator('meta[name="generator"]')).toHaveCount(0);
  await expect(page.locator('script[src="/scripts/theme-init.js"]')).toHaveCount(1);
  await expect(page.locator('script[src="/scripts/theme-toggle.js"]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'RSS', exact: true })).toHaveAttribute(
    'href',
    '/rss.xml',
  );

  await page.goto('/projects/praxis-foundation');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://praxis.example/projects/praxis-foundation',
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
    'content',
    '2026-07-24',
  );
  await expect(page.locator('meta[property="article:modified_time"]')).toHaveAttribute(
    'content',
    '2026-07-26',
  );
  await expect(page.locator('meta[property="article:tag"]')).toHaveCount(4);
  await expect(page.locator('script:not([src])')).toHaveCount(0);
  await expect(page.locator('style')).toHaveCount(0);
});

test('RSS, Sitemap, and robots expose only public canonical routes', async ({ request }) => {
  const rssResponse = await request.get('/rss.xml');
  expect(rssResponse.ok()).toBe(true);
  const rss = await rssResponse.text();
  expect(rss).toContain('<language>zh-CN</language>');
  expect(rss).toContain('<link>https://praxis.example/projects/praxis-foundation</link>');
  expect(rss).toContain('<link>https://praxis.example/notes/ai-code-security-review</link>');
  expect(rss.match(/<item>/g)).toHaveLength(2);

  const sitemapIndexResponse = await request.get('/sitemap-index.xml');
  expect(sitemapIndexResponse.ok()).toBe(true);
  const sitemapIndex = await sitemapIndexResponse.text();
  expect(sitemapIndex).toContain('https://praxis.example/sitemap-0.xml');

  const sitemapResponse = await request.get('/sitemap-0.xml');
  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();
  for (const path of [
    '',
    '/blog',
    '/notes',
    '/journal',
    '/projects',
    '/projects/praxis-foundation',
    '/notes/ai-code-security-review',
  ]) {
    expect(sitemap).toContain(`<loc>https://praxis.example${path}</loc>`);
  }
  for (const excludedPath of ['/404', '/rss.xml', '/robots.txt', '/generated/']) {
    expect(sitemap).not.toContain(excludedPath);
  }

  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toBe(
    'User-agent: *\nAllow: /\nSitemap: https://praxis.example/sitemap-index.xml\n',
  );
});

test('theme control persists an explicit dark theme', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /切换到/ });

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
  const storedTheme = await page.evaluate(() => localStorage.getItem('praxis-theme'));
  expect(storedTheme === 'light' || storedTheme === 'dark').toBe(true);
});

test('theme control tracks system theme changes without an explicit preference', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');

  const toggle = page.getByRole('button', { name: '切换到深色主题' });
  await expect(toggle).toHaveAttribute('title', '切换到深色主题');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.getByRole('button', { name: '切换到浅色主题' })).toHaveAttribute(
    'title',
    '切换到浅色主题',
  );
});

test('a 320px viewport has no page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('keyboard focus and reduced-motion preferences remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const skipLink = page.getByRole('link', { name: '跳到主要内容' });
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);

  const transitionDuration = await page
    .locator('a[href="/blog"]')
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionDuration).toBeLessThanOrEqual(0.00001);
});

test('home and detail pages pass a basic automated accessibility scan', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });

    for (const path of ['/', '/projects/praxis-foundation']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    }
  }
});

test('core content remains readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/projects/praxis-foundation');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('构建 Praxis');
  await expect(page.getByText('为什么开始 Praxis')).toBeVisible();

  await context.close();
});

function collectHtmlFiles(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...collectHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      found.push(full);
    }
  }
  return found;
}

test('no built HTML page ships inline script or style (CSP contract)', () => {
  const distDir = path.resolve(process.cwd(), 'dist');
  const htmlFiles = collectHtmlFiles(distDir);
  expect(htmlFiles.length).toBeGreaterThan(0);

  const offenders: string[] = [];
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const relative = path.relative(distDir, file);
    // A <script> tag with no src= is inline JavaScript.
    if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) {
      offenders.push(`${relative}: inline <script>`);
    }
    if (/<style[\s>]/i.test(html)) {
      offenders.push(`${relative}: inline <style>`);
    }
  }

  expect(offenders).toEqual([]);
});
