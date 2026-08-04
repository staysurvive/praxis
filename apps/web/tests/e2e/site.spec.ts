import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { resolveSiteUrl } from '../../config/site-url';
import { uiCopy } from '../../src/config/copy';
import { getKnowledgeUrl, knowledgeSections } from '../../src/lib/content/domain';

const siteOrigin = resolveSiteUrl(process.env.SITE_URL);
const absoluteUrl = (pathname: string) => new URL(pathname, siteOrigin).toString();
const sitemapUrl = (pathname: string) => (pathname ? absoluteUrl(pathname) : siteOrigin);
const firstKnowledgeSection = knowledgeSections[0];
const firstKnowledgeSectionUrl = getKnowledgeUrl(firstKnowledgeSection.slug);
const knowledgeMenuItems = [
  { label: uiCopy.navigation.knowledgeOverview, href: getKnowledgeUrl() },
  ...knowledgeSections.map(({ label, slug }) => ({ label, href: getKnowledgeUrl(slug) })),
];

test('editorial homepage exposes the real Praxis project and local practice data', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('.hero-art img')).toHaveAttribute(
    'src',
    '/art/praxis-hero-field-1536.webp',
  );
  await expect(page.locator('.hero-art source')).toHaveCount(0);
  await expect(page.locator('.philosophy-background img')).toHaveAttribute(
    'src',
    '/art/praxis-philosophy-field-2048.webp',
  );
  await expect(page.locator('.philosophy-background img')).toHaveAttribute('loading', 'lazy');
  await expect(page.locator('.philosophy-section .philosophy-background')).toHaveCount(1);
  await expect(page.locator('.philosophy-section .philosophy-background-wash')).toHaveCount(1);
  await expect(page.locator('.philosophy-art')).toHaveCount(0);

  const renderedHeroArt = await page.locator('.hero-art img').evaluate((image) => {
    if (!(image instanceof HTMLImageElement)) {
      throw new Error('Homepage hero artwork is missing');
    }

    return image.currentSrc;
  });
  expect(renderedHeroArt).toContain('/art/praxis-hero-field-1536.webp');

  await expect(page.getByRole('heading', { level: 1, name: '知行合一' })).toBeVisible();
  const sectionHeadingOrder = await page
    .locator('#main-content > section')
    .evaluateAll((sections) =>
      sections.map((section) => section.querySelector('h1, h2')?.textContent?.trim()),
    );
  expect(sectionHeadingOrder).toEqual([
    '知行合一',
    '知不是终点，行动也不是。',
    '实践不是提交次数，而是重要行动留下的痕迹。',
    '最近的真实记录',
  ]);
  await expect(page.locator('.brand-mark')).toHaveAttribute('src', '/brand/favicon-mini-32x32.png');
  await expect(page.locator('.brand-mark')).toHaveAttribute('width', '32');
  await expect(page.locator('.brand-mark')).toHaveAttribute('height', '32');
  await expect(page.getByRole('heading', { name: /实践不是提交次数/ })).toBeVisible();
  await expect(
    page.getByRole('link', { name: '构建 Praxis：从知到行的第一项长期实践' }).first(),
  ).toBeVisible();
  await expect(page.locator('a[href="/projects/praxis-foundation"]').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /先审后信/ }).first()).toHaveAttribute(
    'href',
    '/knowledge/ai-code-security-review',
  );
  await expect(page.getByRole('link', { name: /门禁全绿之后/ }).first()).toHaveAttribute(
    'href',
    '/knowledge/what-green-gates-miss',
  );
  await expect(page.getByText('GitHub Contributions')).toHaveCount(0);
  await expect(page.locator('.latest-list .content-card')).toHaveCount(3);
  await expect(page.locator('.heatmap-months span')).toHaveCount(53);
  await expect(page.locator('.heatmap-months span:not(:empty)')).not.toHaveCount(0);
  await expect(page.locator('.heatmap-total')).toHaveText(/过去一年共 \d+ 次实践/);
  await expect(page.locator('.heatmap-legend i')).toHaveCount(5);

  const activeDays = page.locator('.heatmap-cell:not([data-level="0"])');
  expect(await activeDays.count()).toBeGreaterThan(0);
  const activeDay = activeDays.first();
  await expect(activeDay).toHaveAttribute('data-tooltip', /2026年7月.*次实践/);
  await expect(activeDay.locator('.heatmap-tooltip strong')).toHaveText(/\d+ 次实践/);
  await activeDay.hover();
  await expect(activeDay).toHaveCSS('transform', /matrix/);

  const firstTopRowCell = page.locator('.heatmap-cell').first();
  await firstTopRowCell.hover();
  const firstTopRowTooltip = firstTopRowCell.locator('.heatmap-tooltip');
  await expect(firstTopRowTooltip).toHaveCSS('opacity', '1');
  const tooltipGeometry = await firstTopRowTooltip.evaluate((tooltip) => {
    const cell = tooltip.parentElement;
    const scroll = tooltip.closest('.heatmap-scroll');
    if (!(cell instanceof HTMLElement) || !(scroll instanceof HTMLElement)) {
      throw new Error('Missing heatmap tooltip container');
    }

    const tooltipRect = tooltip.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const scrollRect = scroll.getBoundingClientRect();
    return {
      tooltipTop: tooltipRect.top,
      tooltipBottom: tooltipRect.bottom,
      cellBottom: cellRect.bottom,
      scrollTop: scrollRect.top,
      scrollBottom: scrollRect.bottom,
    };
  });
  expect(tooltipGeometry.tooltipBottom).toBeLessThanOrEqual(tooltipGeometry.cellBottom);
  expect(tooltipGeometry.tooltipTop - tooltipGeometry.scrollTop).toBeGreaterThanOrEqual(4);
  expect(tooltipGeometry.tooltipBottom).toBeLessThanOrEqual(tooltipGeometry.scrollBottom);
});

test('primary navigation is explicit and section-aware', async ({ page }) => {
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: '主要导航' });
  const primaryItems = navigation.locator(':scope > ul.nav-list > li.nav-item');
  await expect(primaryItems).toHaveCount(4);

  const knowledgeMenu = primaryItems.nth(0).locator('details[data-knowledge-menu]');
  const knowledgeTrigger = knowledgeMenu.locator('summary[data-knowledge-menu-trigger]');
  await expect(knowledgeTrigger).toHaveText('知识');
  const knowledgeTriggerIcon = knowledgeTrigger.locator('[data-knowledge-menu-trigger-icon]');
  await expect(knowledgeTriggerIcon).toHaveAttribute('aria-hidden', 'true');
  await expect(knowledgeTriggerIcon).toHaveAttribute('viewBox', '0 0 10 6');
  await expect(knowledgeTriggerIcon.locator('path')).toHaveAttribute('d', 'M1 1.25 5 4.75 9 1.25');

  const directPrimaryLinks = navigation.locator(':scope > ul.nav-list > li.nav-item > a.nav-link');
  await expect(directPrimaryLinks).toHaveCount(3);
  await expect(directPrimaryLinks).toHaveText(['项目', '旅程', '关于']);
  await expect(directPrimaryLinks.nth(0)).toHaveAttribute('href', '/projects');
  await expect(directPrimaryLinks.nth(1)).toHaveAttribute('href', '/journey');
  await expect(directPrimaryLinks.nth(2)).toHaveAttribute('href', '/about');

  const primaryLabelMetrics = await navigation
    .locator('[data-knowledge-menu-trigger], .nav-item > a.nav-link')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const styles = getComputedStyle(element);

        return {
          display: styles.display,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          lineHeight: styles.lineHeight,
          letterSpacing: styles.letterSpacing,
          height: element.getBoundingClientRect().height,
        };
      }),
    );
  expect(primaryLabelMetrics).toHaveLength(4);
  for (const metrics of primaryLabelMetrics) {
    expect(metrics).toEqual(primaryLabelMetrics[0]);
  }

  const knowledgeLinks = knowledgeMenu.locator('[data-knowledge-menu-link]');
  await expect(knowledgeLinks).toHaveCount(knowledgeMenuItems.length);
  await expect(knowledgeLinks.locator('.knowledge-menu-label')).toHaveText(
    knowledgeMenuItems.map(({ label }) => label),
  );
  expect(
    await knowledgeLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
  ).toEqual(knowledgeMenuItems.map(({ href }) => href));
  await expect(page.locator('.brand')).toHaveAttribute('href', '/');

  await page.goto('/knowledge');
  await expect(knowledgeTrigger).toHaveClass(/nav-link--active/);
  await expect(knowledgeTrigger).toHaveAttribute('aria-current', 'page');
  await expect(knowledgeLinks.nth(0)).toHaveAttribute('aria-current', 'page');

  await page.goto(firstKnowledgeSectionUrl);
  await expect(knowledgeTrigger).toHaveAttribute('aria-current', 'location');
  await expect(
    knowledgeMenu.locator(`[data-knowledge-menu-link][href="${firstKnowledgeSectionUrl}"]`),
  ).toHaveAttribute('aria-current', 'page');

  for (const [pathname, label] of [
    ['/projects', '项目'],
    ['/journey', '旅程'],
    ['/about', '关于'],
  ] as const) {
    await page.goto(pathname);
    await expect(navigation.getByRole('link', { name: label })).toHaveAttribute(
      'aria-current',
      'page',
    );
  }

  await page.goto('/knowledge/ai-code-security-review');
  await expect(knowledgeTrigger).toHaveAttribute('aria-current', 'location');
  await expect(knowledgeTrigger).toHaveClass(/nav-link--active/);

  await page.goto('/projects/praxis-foundation');
  await expect(navigation.getByRole('link', { name: '项目' })).toHaveAttribute(
    'aria-current',
    'location',
  );
});

test('knowledge menu opens on desktop hover and dismisses without moving focus', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-chromium',
    'Desktop fine-pointer behavior is covered by the desktop project.',
  );
  await page.goto('/');

  const menu = page.locator('details[data-knowledge-menu]');
  const trigger = menu.locator('summary[data-knowledge-menu-trigger]');
  const panel = menu.locator('[data-knowledge-menu-panel]');

  await trigger.hover();
  await expect(menu).toHaveJSProperty('open', true);
  await expect(panel).toBeVisible();

  const firstSectionLink = menu.locator(
    `[data-knowledge-menu-link][href="${firstKnowledgeSectionUrl}"]`,
  );
  await expect(firstSectionLink).toHaveCount(1);
  await firstSectionLink.hover();
  const hoverFeedback = await firstSectionLink.evaluate((link) => {
    const linkStyles = getComputedStyle(link);
    const label = link.querySelector('.knowledge-menu-label');
    return {
      background: linkStyles.backgroundColor,
      edge: linkStyles.boxShadow,
      labelWeight: label ? getComputedStyle(label).fontWeight : null,
    };
  });
  expect(hoverFeedback.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(hoverFeedback.edge).not.toBe('none');
  expect(Number.parseInt(hoverFeedback.labelWeight ?? '0', 10)).toBeGreaterThanOrEqual(600);

  await page.keyboard.press('Escape');
  await expect(menu).toHaveJSProperty('open', false);
  await expect(panel).toBeHidden();

  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Missing desktop viewport');
  await page.mouse.move(viewport.width - 2, viewport.height - 2);

  await trigger.hover();
  await expect(menu).toHaveJSProperty('open', true);
  await page.mouse.move(viewport.width - 2, viewport.height - 2);

  await expect(menu).toHaveJSProperty('open', false);
  await expect(panel).toBeHidden();
});

test('an expanded knowledge menu child link navigates with JavaScript enabled', async ({
  page,
}) => {
  await page.goto('/');

  const menu = page.locator('details[data-knowledge-menu]');
  await menu.locator('summary[data-knowledge-menu-trigger]').click();
  await expect(menu).toHaveJSProperty('open', true);

  const childLink = menu.locator(`[data-knowledge-menu-link][href="${firstKnowledgeSectionUrl}"]`);
  await expect(childLink).toBeVisible();
  await childLink.click();
  await expect(page).toHaveURL(new RegExp(`${firstKnowledgeSectionUrl}$`));
  await expect(
    page.getByRole('heading', { level: 1, name: firstKnowledgeSection.label }),
  ).toBeVisible();
});

test('knowledge menu opens by touch and closes on an outside tap', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile-chromium',
    'Touch behavior is covered by the mobile project.',
  );
  await page.goto('/');

  const menu = page.locator('details[data-knowledge-menu]');
  const trigger = menu.locator('summary[data-knowledge-menu-trigger]');
  const panel = menu.locator('[data-knowledge-menu-panel]');

  await trigger.tap();
  await expect(menu).toHaveJSProperty('open', true);
  await expect(panel).toBeVisible();

  await page.getByRole('button', { name: /切换到/ }).tap();
  await expect(menu).toHaveJSProperty('open', false);
  await expect(panel).toBeHidden();

  await trigger.tap();
  await menu.locator(`[data-knowledge-menu-link][href="${firstKnowledgeSectionUrl}"]`).tap();
  await expect(page).toHaveURL(new RegExp(`${firstKnowledgeSectionUrl}$`));
});

test('Escape closes the knowledge menu and restores focus to its trigger', async ({ page }) => {
  await page.goto('/');

  const menu = page.locator('details[data-knowledge-menu]');
  const trigger = menu.locator('summary[data-knowledge-menu-trigger]');

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveJSProperty('open', true);

  await page.keyboard.press('Tab');
  await expect(menu.locator('[data-knowledge-menu-link]').first()).toBeFocused();
  await page.keyboard.press('Escape');

  await expect(menu).toHaveJSProperty('open', false);
  await expect(trigger).toBeFocused();
});

test('outside dismissal preserves keyboard focus at the knowledge trigger', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-chromium',
    'Mobile outside-tap dismissal is covered through the reachable theme control.',
  );
  await page.goto('/journey');

  const menu = page.locator('details[data-knowledge-menu]');
  const trigger = menu.locator('summary[data-knowledge-menu-trigger]');

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveJSProperty('open', true);

  await page.keyboard.press('Tab');
  await expect(menu.locator('[data-knowledge-menu-link]').first()).toBeFocused();
  await page.getByRole('heading', { level: 1, name: '旅程' }).click();

  await expect(menu).toHaveJSProperty('open', false);
  await expect(trigger).toBeFocused();
});

test('Space toggles the native knowledge disclosure from the keyboard', async ({ page }) => {
  await page.goto('/');

  const menu = page.locator('details[data-knowledge-menu]');
  const trigger = menu.locator('summary[data-knowledge-menu-trigger]');
  await trigger.focus();

  await page.keyboard.press('Space');
  await expect(menu).toHaveJSProperty('open', true);
  await page.keyboard.press('Space');
  await expect(menu).toHaveJSProperty('open', false);
  await expect(trigger).toBeFocused();
});

test('knowledge exposes five truthful sections and all recent knowledge', async ({ page }) => {
  await page.goto('/knowledge');

  await expect(page.getByRole('heading', { level: 1, name: '知识' })).toBeVisible();
  const sectionCards = page.locator('.knowledge-section-card');
  await expect(sectionCards).toHaveCount(knowledgeSections.length);
  await expect(sectionCards.getByRole('link')).toHaveCount(knowledgeSections.length);
  await expect(sectionCards.getByRole('heading', { level: 2 })).toHaveText(
    knowledgeSections.map(({ label }) => label),
  );
  await expect(sectionCards.getByText('暂无作者内容', { exact: true })).toHaveCount(
    knowledgeSections.length,
  );

  const recent = page.locator('.recent-list');
  await expect(recent.locator('.content-card')).toHaveCount(2);
  await expect(recent.getByRole('link', { name: /先审后信/ }).first()).toHaveAttribute(
    'href',
    '/knowledge/ai-code-security-review',
  );
  await expect(recent.getByRole('link', { name: /门禁全绿之后/ }).first()).toHaveAttribute(
    'href',
    '/knowledge/what-green-gates-miss',
  );
});

test('knowledge section empty state and detail keep a knowledge return path', async ({ page }) => {
  for (const section of knowledgeSections) {
    await page.goto(getKnowledgeUrl(section.slug));
    await expect(page.getByRole('heading', { level: 1, name: section.label })).toBeVisible();
    await expect(page.getByRole('heading', { name: '此入口尚无作者内容' })).toBeVisible();
    await expect(page.getByRole('link', { name: '返回知识总览' })).toHaveAttribute(
      'href',
      '/knowledge',
    );
  }

  await page.getByRole('link', { name: '返回知识总览' }).click();
  await expect(page).toHaveURL(/\/knowledge$/);

  await page
    .locator('.recent-list h3')
    .getByRole('link', { name: /先审后信/ })
    .click();
  await expect(page).toHaveURL(/\/knowledge\/ai-code-security-review$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('先审后信');
  await expect(page.getByRole('heading', { name: /相互否证/ })).toBeVisible();
  await expect(page.locator('.content-back')).toHaveAttribute('href', '/knowledge');

  await page.goto('/knowledge/what-green-gates-miss');
  const authoredLegacyLink = page.getByRole('link', { name: '关于对抗式安全审查的笔记' });
  await expect(authoredLegacyLink).toHaveAttribute('href', '/notes/ai-code-security-review');
  await authoredLegacyLink.click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/knowledge/ai-code-security-review');
});

test('projects remain a single page with the one stable detail exception', async ({ page }) => {
  await page.goto('/projects#praxis-foundation');

  await expect(page.getByRole('heading', { level: 1, name: '项目' })).toBeVisible();
  const project = page.locator('#praxis-foundation');
  await expect(project.getByRole('heading', { name: /构建 Praxis/ })).toBeVisible();
  await expect(project.locator('.project-status')).toHaveText('进行中');
  await project.getByRole('link', { name: '查看项目' }).click();

  await expect(page).toHaveURL(/\/projects\/praxis-foundation$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('构建 Praxis');
  await expect(page.getByRole('heading', { name: '长期沉淀' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '真实实践时间轴' })).toBeVisible();
  await expect(page.locator('.content-back')).toHaveAttribute('href', '/projects');
});

test('journey stays empty and about uses only confirmed site identity', async ({ page }) => {
  await page.goto('/journey');
  await expect(page.getByRole('heading', { level: 1, name: '旅程' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '旅程尚未开始记录' })).toBeVisible();
  await expect(page.getByRole('link', { name: '浏览知识' })).toHaveAttribute('href', '/knowledge');
  await expect(page.getByRole('link', { name: '查看项目' })).toHaveAttribute('href', '/projects');
  await expect(page.locator('.practice-timeline')).toHaveCount(0);

  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1, name: '关于 Praxis' })).toBeVisible();
  await expect(page.getByText('一个关于长期思考、真实行动与持续复盘的个人实践站。')).toHaveCount(2);
});

test('missing routes use the branded 404', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '这一页尚未抵达' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('public pages expose canonical and social discovery metadata', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', absoluteUrl('/'));
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
    'href',
    absoluteUrl('/rss.xml'),
  );
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"][sizes="any"]')).toHaveAttribute(
    'href',
    '/favicon.svg',
  );
  await expect(page.locator('link[rel="icon"][type="image/png"][sizes="16x16"]')).toHaveAttribute(
    'href',
    '/favicon-16x16.png',
  );
  await expect(page.locator('link[rel="icon"][type="image/png"][sizes="32x32"]')).toHaveAttribute(
    'href',
    '/favicon-32x32.png',
  );
  await expect(page.locator('link[rel="icon"][type="image/png"][sizes="48x48"]')).toHaveAttribute(
    'href',
    '/favicon-48x48.png',
  );
  await expect(page.locator('link[rel="icon"][type="image/x-icon"]')).toHaveAttribute(
    'href',
    '/favicon.ico',
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

  await page.goto('/knowledge/ai-code-security-review');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    absoluteUrl('/knowledge/ai-code-security-review'),
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    absoluteUrl('/knowledge/ai-code-security-review'),
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
    'content',
    '2026-07-26',
  );

  await page.goto('/projects/praxis-foundation');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    absoluteUrl('/projects/praxis-foundation'),
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

test('every new indexable shell shares the centralized metadata contract', async ({ page }) => {
  for (const pathname of [
    '/knowledge',
    firstKnowledgeSectionUrl,
    '/projects',
    '/journey',
    '/about',
  ]) {
    await page.goto(pathname);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      absoluteUrl(pathname),
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      absoluteUrl(pathname),
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
    await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
      'href',
      absoluteUrl('/rss.xml'),
    );
  }
});

test('RSS, Sitemap, and robots expose only public canonical routes', async ({ request }) => {
  const rssResponse = await request.get('/rss.xml');
  expect(rssResponse.ok()).toBe(true);
  const rss = await rssResponse.text();
  expect(rss).toContain('<language>zh-CN</language>');
  expect(rss).toContain(`<link>${absoluteUrl('/projects/praxis-foundation')}</link>`);
  expect(rss).toContain(`<link>${absoluteUrl('/knowledge/ai-code-security-review')}</link>`);
  expect(rss).toContain(`<link>${absoluteUrl('/knowledge/what-green-gates-miss')}</link>`);
  expect(rss).toContain('<guid isPermaLink="false">praxis-project-0001</guid>');
  expect(rss).toContain('<guid isPermaLink="false">praxis-note-0001</guid>');
  expect(rss).toContain('<guid isPermaLink="false">praxis-journal-0001</guid>');
  expect(rss.match(/<guid /g)).toHaveLength(3);
  expect(rss.match(/<item>/g)).toHaveLength(3);

  const sitemapIndexResponse = await request.get('/sitemap-index.xml');
  expect(sitemapIndexResponse.ok()).toBe(true);
  const sitemapIndex = await sitemapIndexResponse.text();
  expect(sitemapIndex).toContain(absoluteUrl('/sitemap-0.xml'));

  const sitemapResponse = await request.get('/sitemap-0.xml');
  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();
  for (const path of [
    '',
    '/about',
    '/journey',
    '/knowledge',
    ...knowledgeSections.map(({ slug }) => getKnowledgeUrl(slug)),
    '/knowledge/ai-code-security-review',
    '/knowledge/what-green-gates-miss',
    '/projects',
    '/projects/praxis-foundation',
  ]) {
    expect(sitemap).toContain(`<loc>${sitemapUrl(path)}</loc>`);
  }
  for (const excludedPath of [
    '/404',
    '/rss.xml',
    '/robots.txt',
    '/generated/',
    '/blog',
    '/notes',
    '/journal',
    '/notes/ai-code-security-review',
    '/journal/what-green-gates-miss',
  ]) {
    expect(sitemap).not.toContain(excludedPath);
  }

  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toBe(
    `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl('/sitemap-index.xml')}\n`,
  );
});

test('the five legacy paths are noindex compatibility pages with one final target', async ({
  page,
  request,
}) => {
  const mappings = [
    ['/blog', '/knowledge'],
    ['/notes', '/knowledge'],
    ['/journal', '/knowledge'],
    ['/notes/ai-code-security-review', '/knowledge/ai-code-security-review'],
    ['/journal/what-green-gates-miss', '/knowledge/what-green-gates-miss'],
  ] as const;

  for (const [from, to] of mappings) {
    const response = await request.get(from);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(`<meta http-equiv="refresh" content="0;url=${to}">`);
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain(`<link rel="canonical" href="${absoluteUrl(to)}">`);
    expect(html).not.toContain('article-prose');

    await page.goto(from);
    await expect.poll(() => new URL(page.url()).pathname).toBe(to);
  }
});

test('theme control persists an explicit dark theme', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /切换到/ });

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
  const storedTheme = await page.evaluate(() => localStorage.getItem('praxis-theme'));
  expect(storedTheme === 'light' || storedTheme === 'dark').toBe(true);
});

test('theme changes keep color hierarchy and browser chrome in sync', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');

  const resolvedColors = () =>
    page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.background = 'var(--color-bg)';
      probe.style.color = 'var(--color-fg)';
      probe.style.borderTop = '1px solid var(--color-brand)';
      document.body.append(probe);

      const styles = getComputedStyle(probe);
      const colors = {
        background: styles.backgroundColor,
        foreground: styles.color,
        brand: styles.borderTopColor,
      };
      probe.remove();
      return colors;
    });

  const lightColors = await resolvedColors();
  const themeColor = page.locator('meta[name="theme-color"]');
  await expect(themeColor).toHaveAttribute('content', '#f4f1ea');

  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(themeColor).toHaveAttribute('content', '#171512');

  const darkColors = await resolvedColors();
  expect(darkColors).not.toEqual(lightColors);
  expect(new Set(Object.values(lightColors)).size).toBe(3);
  expect(new Set(Object.values(darkColors)).size).toBe(3);
});

test('theme control tracks system theme changes without an explicit preference', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');

  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f4f1ea');

  const toggle = page.getByRole('button', { name: '切换到深色主题' });
  await expect(toggle).toHaveAttribute('title', '切换到深色主题');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#171512');
  await expect(page.getByRole('button', { name: '切换到浅色主题' })).toHaveAttribute(
    'title',
    '切换到浅色主题',
  );
});

test('interactive styles avoid scroll handlers and layout-affecting transitions', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const nativeAddEventListener = EventTarget.prototype.addEventListener;
    const scrollListenerTargets: string[] = [];

    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (type === 'scroll') {
        scrollListenerTargets.push(this === window ? 'window' : this.constructor.name);
      }

      return nativeAddEventListener.call(this, type, listener, options);
    };

    Object.defineProperty(window, '__praxisScrollListenerTargets', {
      value: scrollListenerTargets,
    });
  });

  await page.goto('/');

  const scrollListenerTargets = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __praxisScrollListenerTargets: string[];
        }
      ).__praxisScrollListenerTargets,
  );
  expect(scrollListenerTargets).toEqual([]);

  const transitions = await page.evaluate(() => {
    const transitionProperty = (selector: string, pseudoElement?: string) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) {
        throw new Error(`Missing interactive element: ${selector}`);
      }

      return getComputedStyle(element, pseudoElement).transitionProperty;
    };

    return {
      navigation: transitionProperty('.nav-link', '::after'),
      theme: transitionProperty('[data-theme-toggle]'),
      textLink: transitionProperty('.text-link', '::after'),
      heatmapCell: transitionProperty('.heatmap-cell'),
      heatmapTooltip: transitionProperty('.heatmap-tooltip'),
    };
  });

  expect(transitions.navigation).toContain('opacity');
  expect(transitions.navigation).toContain('transform');
  expect(transitions.theme).toContain('background-color');
  expect(transitions.textLink).toContain('transform');
  expect(transitions.heatmapCell).toContain('opacity');
  expect(transitions.heatmapCell).toContain('transform');
  expect(transitions.heatmapTooltip).toContain('opacity');
  expect(transitions.heatmapTooltip).toContain('transform');
  expect(Object.values(transitions).join(',')).not.toContain('all');

  const tooltipEffects = await page.evaluate(() => {
    const tooltip = document.querySelector('.heatmap-tooltip');
    if (!(tooltip instanceof HTMLElement)) {
      throw new Error('Missing heatmap tooltip');
    }

    const styles = getComputedStyle(tooltip);
    return { backdropFilter: styles.backdropFilter, boxShadow: styles.boxShadow };
  });
  expect(tooltipEffects.backdropFilter).toBe('none');
  expect(tooltipEffects.boxShadow).toBe('none');

  const geometry = async () =>
    page.evaluate(() => {
      const header = document.querySelector('.site-header');
      if (!(header instanceof HTMLElement)) {
        throw new Error('Missing site header');
      }

      const { height, width } = header.getBoundingClientRect();
      return {
        documentWidth: document.documentElement.clientWidth,
        headerHeight: height,
        headerWidth: width,
      };
    });

  const beforeThemeChange = await geometry();
  await page.locator('[data-theme-toggle]').click();
  expect(await geometry()).toEqual(beforeThemeChange);
});

test('a 320px viewport has no page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const path of [
    '/',
    '/knowledge',
    firstKnowledgeSectionUrl,
    '/knowledge/ai-code-security-review',
    '/projects#praxis-foundation',
    '/projects/praxis-foundation',
    '/journey',
    '/about',
  ]) {
    await page.goto(path);

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth, path).toBeLessThanOrEqual(dimensions.clientWidth);
  }

  await page.goto('/knowledge');
  const knowledgeMenu = page.locator('details[data-knowledge-menu]');
  await knowledgeMenu.locator('summary[data-knowledge-menu-trigger]').click();
  await expect(knowledgeMenu).toHaveJSProperty('open', true);

  const openedMenuGeometry = await knowledgeMenu
    .locator('[data-knowledge-menu-panel]')
    .evaluate((panel) => {
      const rect = panel.getBoundingClientRect();
      return {
        clientWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        panelLeft: rect.left,
        panelRight: rect.right,
        panelWidth: rect.width,
      };
    });
  expect(openedMenuGeometry.documentScrollWidth).toBeLessThanOrEqual(
    openedMenuGeometry.clientWidth,
  );
  expect(openedMenuGeometry.panelLeft).toBeGreaterThanOrEqual(0);
  expect(openedMenuGeometry.panelRight).toBeLessThanOrEqual(openedMenuGeometry.clientWidth);
  expect(openedMenuGeometry.panelWidth).toBeGreaterThanOrEqual(openedMenuGeometry.clientWidth - 48);

  await page.keyboard.press('Escape');
  await expect(knowledgeMenu).toHaveJSProperty('open', false);

  const headerTargets = await page
    .locator('.brand, .nav-link, [data-theme-toggle]')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        const hitArea = element.classList.contains('nav-link')
          ? getComputedStyle(element, '::before')
          : undefined;
        const leftInset = hitArea ? Number.parseFloat(hitArea.left) || 0 : 0;
        const rightInset = hitArea ? Number.parseFloat(hitArea.right) || 0 : 0;

        return {
          label: element.textContent?.trim() || element.getAttribute('aria-label') || 'control',
          left: rect.left + leftInset,
          right: rect.right - rightInset,
          top: rect.top,
          bottom: rect.bottom,
        };
      }),
    );

  for (let leftIndex = 0; leftIndex < headerTargets.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < headerTargets.length; rightIndex += 1) {
      const left = headerTargets[leftIndex];
      const right = headerTargets[rightIndex];
      const overlaps =
        left.left < right.right &&
        left.right > right.left &&
        left.top < right.bottom &&
        left.bottom > right.top;
      expect(overlaps, `${left.label} overlaps ${right.label}`).toBe(false);
    }
  }
});

test('sticky header leaves headings, breadcrumbs, and project anchors visible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [path, selector] of [
    ['/knowledge', 'h1'],
    ['/knowledge/ai-code-security-review', '.content-back'],
    ['/projects#praxis-foundation', '#praxis-foundation'],
  ] as const) {
    await page.goto(path);
    const geometry = await page.locator(selector).evaluate((element) => {
      const header = document.querySelector('.site-header');
      if (!(header instanceof HTMLElement)) {
        throw new Error('Missing site header');
      }

      return {
        elementTop: element.getBoundingClientRect().top,
        headerBottom: header.getBoundingClientRect().bottom,
      };
    });

    expect(geometry.elementTop, path).toBeGreaterThanOrEqual(geometry.headerBottom);
  }
});

test('the mobile hero preserves the full field artwork above its copy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const dimensions = await page.locator('.hero-art img').evaluate((image) => {
    if (!(image instanceof HTMLImageElement)) {
      throw new Error('Homepage hero artwork is missing');
    }

    const rect = image.getBoundingClientRect();
    return {
      renderedSrc: image.currentSrc,
      renderedWidth: rect.width,
      renderedHeight: rect.height,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      objectFit: getComputedStyle(image).objectFit,
    };
  });

  expect(dimensions.renderedSrc).toContain('/art/praxis-hero-field-1536.webp');
  expect(dimensions.objectFit).toBe('contain');
  expect(dimensions.renderedHeight / dimensions.renderedWidth).toBeCloseTo(9 / 16, 2);
  expect(dimensions.naturalWidth / dimensions.naturalHeight).toBeCloseTo(16 / 9, 2);
});

test('the homepage hero completes the first desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 791 });
  await page.goto('/');

  const dimensions = await page.locator('.hero-section').evaluate((hero) => {
    const nextSection = hero.nextElementSibling;
    if (!(nextSection instanceof HTMLElement)) {
      throw new Error('Homepage section following the hero is missing');
    }

    const heroRect = hero.getBoundingClientRect();
    const heroImage = hero.querySelector('.hero-art img');
    if (!(heroImage instanceof HTMLImageElement)) {
      throw new Error('Homepage hero artwork is missing');
    }

    return {
      viewportHeight: window.innerHeight,
      heroBottom: heroRect.bottom,
      nextSectionTop: nextSection.getBoundingClientRect().top,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      heroImageObjectFit: getComputedStyle(heroImage).objectFit,
    };
  });

  expect(Math.abs(dimensions.heroBottom - dimensions.viewportHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(dimensions.nextSectionTop - dimensions.viewportHeight)).toBeLessThanOrEqual(1);
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(dimensions.heroImageObjectFit).toBe('cover');
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
    .locator('[data-knowledge-menu-trigger]')
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionDuration).toBeLessThanOrEqual(0.00001);
});

test('keyboard order remains brand-first across the explicit navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/knowledge');

  const navigation = page.getByRole('navigation', { name: '主要导航' });
  const knowledgeMenu = navigation.locator('details[data-knowledge-menu]');
  const knowledgeTrigger = knowledgeMenu.locator('summary[data-knowledge-menu-trigger]');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳到主要内容' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.brand')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(knowledgeTrigger).toBeFocused();
  const knowledgeTriggerStyle = await knowledgeTrigger.evaluate((element) => {
    const indicator = getComputedStyle(element, '::after');
    const trigger = getComputedStyle(element);
    return {
      boxShadow: trigger.boxShadow,
      opacity: indicator.opacity,
      height: indicator.height,
      outlineStyle: trigger.outlineStyle,
    };
  });
  expect(knowledgeTriggerStyle.outlineStyle).toBe('none');
  expect(knowledgeTriggerStyle.boxShadow).toBe('none');
  expect(knowledgeTriggerStyle.opacity).toBe('1');
  expect(Number.parseFloat(knowledgeTriggerStyle.height)).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('Enter');
  await expect(knowledgeMenu).toHaveJSProperty('open', true);

  const knowledgeLinks = knowledgeMenu.locator('[data-knowledge-menu-link]');
  for (let index = 0; index < knowledgeMenuItems.length; index += 1) {
    await page.keyboard.press('Tab');
    await expect(knowledgeLinks.nth(index)).toBeFocused();
    if (index === 0) {
      const firstKnowledgeLinkStyle = await knowledgeLinks.nth(index).evaluate((element) => {
        const styles = getComputedStyle(element);
        const label = element.querySelector('.knowledge-menu-label');
        return {
          outlineStyle: styles.outlineStyle,
          outlineWidth: styles.outlineWidth,
          background: styles.backgroundColor,
          edge: styles.boxShadow,
          labelWeight: label ? getComputedStyle(label).fontWeight : null,
        };
      });
      expect(firstKnowledgeLinkStyle.outlineStyle).not.toBe('none');
      expect(Number.parseFloat(firstKnowledgeLinkStyle.outlineWidth)).toBeGreaterThan(0);
      expect(firstKnowledgeLinkStyle.background).not.toBe('rgba(0, 0, 0, 0)');
      expect(firstKnowledgeLinkStyle.edge).not.toBe('none');
      expect(
        Number.parseInt(firstKnowledgeLinkStyle.labelWeight ?? '0', 10),
      ).toBeGreaterThanOrEqual(600);
    }
  }

  for (const label of ['项目', '旅程', '关于']) {
    await page.keyboard.press('Tab');
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeFocused();
  }

  const aboutLink = navigation.getByRole('link', { name: '关于', exact: true });
  await expect(aboutLink).toBeFocused();

  const focusedNavigationStyle = await aboutLink.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { outlineStyle: styles.outlineStyle, outlineWidth: styles.outlineWidth };
  });
  expect(focusedNavigationStyle.outlineStyle).not.toBe('none');
  expect(Number.parseFloat(focusedNavigationStyle.outlineWidth)).toBeGreaterThan(0);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /切换到/ })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.knowledge-section-card').first().getByRole('link')).toBeFocused();
});

test('new primary, empty, and detail pages pass a basic automated accessibility scan', async ({
  page,
}) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });

    for (const path of [
      '/',
      '/knowledge',
      firstKnowledgeSectionUrl,
      '/knowledge/ai-code-security-review',
      '/projects',
      '/projects/praxis-foundation',
      '/journey',
      '/about',
    ]) {
      await page.goto(path);
      if (path === '/knowledge') {
        const knowledgeMenu = page.locator('details[data-knowledge-menu]');
        await knowledgeMenu.locator('summary[data-knowledge-menu-trigger]').click();
        await expect(knowledgeMenu).toHaveJSProperty('open', true);
      }
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    }
  }
});

test('core content remains readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/');
  const knowledgeMenu = page.locator('details[data-knowledge-menu]');
  await knowledgeMenu.locator('summary[data-knowledge-menu-trigger]').click();
  await expect(knowledgeMenu).toHaveJSProperty('open', true);
  await knowledgeMenu
    .locator(`[data-knowledge-menu-link][href="${firstKnowledgeSectionUrl}"]`)
    .click();
  await expect(page).toHaveURL(new RegExp(`${firstKnowledgeSectionUrl}$`));
  await expect(page.getByRole('heading', { name: '此入口尚无作者内容' })).toBeVisible();
  await page.getByRole('link', { name: '返回知识总览' }).click();
  await expect(page).toHaveURL(/\/knowledge$/);

  await page
    .locator('.recent-list h3')
    .getByRole('link', { name: /先审后信/ })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('先审后信');
  await page.locator('.content-back').click();
  await expect(page).toHaveURL(/\/knowledge$/);

  await page.goto('/projects#praxis-foundation');
  await expect(page.locator('#praxis-foundation')).toBeVisible();
  const projectDetailLink = page
    .locator('#praxis-foundation')
    .getByRole('link', { name: '查看项目' });
  await projectDetailLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('构建 Praxis');
  await expect(page.getByText('为什么开始 Praxis')).toBeVisible();
  await page.locator('.content-back').click();
  await expect(page).toHaveURL(/\/projects$/);

  await page.goto('/journey');
  await expect(page.getByRole('heading', { name: '旅程尚未开始记录' })).toBeVisible();
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1, name: '关于 Praxis' })).toBeVisible();

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

function collectSourceFiles(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...collectSourceFiles(full));
    } else if (/\.(astro|css|js|ts)$/.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

test('source uses the semantic color system without legacy color aliases', () => {
  const legacyTokens = [
    'page',
    'surface',
    'surface-raised',
    'text',
    'text-muted',
    'text-faint',
    'border',
    'border-strong',
    'accent',
    'accent-strong',
    'accent-soft',
    'focus',
    'glass',
    'hero-veil',
    'hero-veil-strong',
    'heat-0',
    'heat-1',
    'heat-2',
    'heat-3',
    'heat-4',
  ];
  const legacyTokenPattern = new RegExp(`--color-(?:${legacyTokens.join('|')})(?=$|[\\s:;,)])`);
  const sourceDir = path.resolve(process.cwd(), 'src');

  const offenders = collectSourceFiles(sourceDir).flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    return legacyTokenPattern.test(source) ? [path.relative(sourceDir, file)] : [];
  });

  expect(offenders).toEqual([]);
});

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
    if (/\sstyle=/i.test(html)) {
      offenders.push(`${relative}: inline style attribute`);
    }
    if (/\son[a-z]+=/i.test(html)) {
      offenders.push(`${relative}: inline event handler`);
    }
  }

  expect(offenders).toEqual([]);
});
