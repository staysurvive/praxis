import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { resolveSiteUrl } from '../../config/site-url';
import { uiCopy } from '../../src/config/copy';
import { editorialHeroArt } from '../../src/config/editorial-heroes';
import { getKnowledgeUrl, knowledgeSections } from '../../src/lib/content/domain';

const siteOrigin = resolveSiteUrl(process.env.SITE_URL);
const absoluteUrl = (pathname: string) => new URL(pathname, siteOrigin).toString();
const sitemapUrl = (pathname: string) => (pathname ? absoluteUrl(pathname) : siteOrigin);
const firstKnowledgeSection = knowledgeSections[0];
const firstKnowledgeSectionUrl = getKnowledgeUrl(firstKnowledgeSection.slug);
const knowledgeMenuItems = knowledgeSections.map(({ label, slug }) => ({
  label,
  href: getKnowledgeUrl(slug),
}));

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
  const knowledgeOverviewLink = primaryItems.nth(0).locator('a[data-knowledge-overview-link]');
  await expect(knowledgeOverviewLink).toHaveText('知识');
  await expect(knowledgeOverviewLink).toHaveAttribute('href', '/knowledge');
  await expect(
    primaryItems
      .nth(0)
      .locator(':scope > a[data-knowledge-overview-link] + details[data-knowledge-menu]'),
  ).toHaveCount(1);
  await expect(knowledgeTrigger).toHaveAccessibleName(uiCopy.accessibility.knowledgeMenuTrigger);
  await expect(knowledgeTrigger).toHaveAttribute(
    'aria-label',
    uiCopy.accessibility.knowledgeMenuTrigger,
  );
  const knowledgeTriggerIcon = knowledgeTrigger.locator('[data-knowledge-menu-trigger-icon]');
  await expect(knowledgeTriggerIcon).toHaveAttribute('aria-hidden', 'true');
  await expect(knowledgeTriggerIcon).toHaveAttribute('viewBox', '0 0 10 6');
  await expect(knowledgeTriggerIcon.locator('path')).toHaveAttribute('d', 'M1 1.25 5 4.75 9 1.25');

  const directPrimaryLinks = navigation.locator(':scope > ul.nav-list > li.nav-item > a.nav-link');
  await expect(directPrimaryLinks).toHaveCount(4);
  await expect(directPrimaryLinks).toHaveText(['知识', '项目', '旅程', '关于']);
  await expect(directPrimaryLinks.nth(0)).toHaveAttribute('href', '/knowledge');
  await expect(directPrimaryLinks.nth(1)).toHaveAttribute('href', '/projects');
  await expect(directPrimaryLinks.nth(2)).toHaveAttribute('href', '/journey');
  await expect(directPrimaryLinks.nth(3)).toHaveAttribute('href', '/about');

  const primaryLabelMetrics = await directPrimaryLinks.evaluateAll((elements) =>
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

  const knowledgeControlAlignment = await primaryItems.nth(0).evaluate((item) => {
    const overviewLink = item.querySelector<HTMLElement>('[data-knowledge-overview-link]');
    const trigger = item.querySelector<HTMLElement>('[data-knowledge-menu-trigger]');
    const icon = item.querySelector<HTMLElement>('[data-knowledge-menu-trigger-icon]');

    if (!overviewLink || !trigger || !icon)
      throw new Error('Missing knowledge navigation controls.');

    const overviewRect = overviewLink.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();

    return {
      controlCenterOffset: Math.abs(
        overviewRect.top + overviewRect.height / 2 - (triggerRect.top + triggerRect.height / 2),
      ),
      iconCenterOffset:
        iconRect.top + iconRect.height / 2 - (overviewRect.top + overviewRect.height / 2),
      controlGap: triggerRect.left - overviewRect.right,
      visualGap: iconRect.left - overviewRect.right,
    };
  });
  expect(knowledgeControlAlignment.controlCenterOffset).toBeLessThanOrEqual(0.5);
  // The historical chevron uses a subtle optical downshift instead of mathematical centering.
  expect(knowledgeControlAlignment.iconCenterOffset).toBeGreaterThanOrEqual(0.5);
  expect(knowledgeControlAlignment.iconCenterOffset).toBeLessThanOrEqual(1.5);
  expect(knowledgeControlAlignment.controlGap).toBeGreaterThanOrEqual(0.5);
  expect(knowledgeControlAlignment.controlGap).toBeLessThanOrEqual(1.5);
  expect(knowledgeControlAlignment.visualGap).toBeGreaterThanOrEqual(4);
  expect(knowledgeControlAlignment.visualGap).toBeLessThanOrEqual(6);

  const knowledgeLinks = knowledgeMenu.locator('[data-knowledge-menu-link]');
  await expect(knowledgeLinks).toHaveCount(knowledgeMenuItems.length);
  await expect(knowledgeMenu.locator('a')).toHaveCount(knowledgeMenuItems.length);
  await expect(knowledgeMenu.locator('[data-knowledge-menu-link][href="/knowledge"]')).toHaveCount(
    0,
  );
  await expect(knowledgeLinks.locator('.knowledge-menu-label')).toHaveText(
    knowledgeMenuItems.map(({ label }) => label),
  );
  expect(
    await knowledgeLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
  ).toEqual(knowledgeMenuItems.map(({ href }) => href));
  await expect(page.locator('.brand')).toHaveAttribute('href', '/');

  await page.goto('/knowledge');
  await expect(knowledgeOverviewLink).toHaveClass(/nav-link--active/);
  await expect(knowledgeOverviewLink).toHaveAttribute('aria-current', 'page');
  expect(await knowledgeTrigger.getAttribute('aria-current')).toBeNull();
  await expect(knowledgeLinks.locator('[aria-current]')).toHaveCount(0);

  await page.goto(firstKnowledgeSectionUrl);
  await expect(knowledgeOverviewLink).toHaveAttribute('aria-current', 'location');
  await expect(knowledgeOverviewLink).toHaveClass(/nav-link--active/);
  expect(await knowledgeTrigger.getAttribute('aria-current')).toBeNull();
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
  await expect(knowledgeOverviewLink).toHaveAttribute('aria-current', 'location');
  await expect(knowledgeOverviewLink).toHaveClass(/nav-link--active/);
  expect(await knowledgeTrigger.getAttribute('aria-current')).toBeNull();

  await page.goto('/projects/praxis-foundation');
  await expect(navigation.getByRole('link', { name: '项目' })).toHaveAttribute(
    'aria-current',
    'location',
  );
});

test('the visible Knowledge link navigates directly to its overview independently of the disclosure', async ({
  page,
}) => {
  await page.goto('/journey');

  const knowledgeOverviewLink = page.locator('[data-knowledge-overview-link]');
  const knowledgeMenu = page.locator('details[data-knowledge-menu]');
  await expect(knowledgeOverviewLink).toHaveAttribute('href', '/knowledge');
  await expect(knowledgeMenu).toHaveJSProperty('open', false);

  await knowledgeOverviewLink.click();
  await expect(page).toHaveURL(/\/knowledge$/);
  await expect(page.getByRole('heading', { level: 1, name: '知识' })).toBeVisible();
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
  const overviewLink = page.locator('[data-knowledge-overview-link]');
  const panel = menu.locator('[data-knowledge-menu-panel]');

  await overviewLink.hover();
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

  await overviewLink.hover();
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

test('knowledge interiors share the documentation shell and keep truthful return paths', async ({
  page,
}) => {
  for (const section of knowledgeSections) {
    await page.goto(getKnowledgeUrl(section.slug));
    await expect(page.locator('[data-knowledge-docs]')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: section.label })).toBeVisible();
    await expect(page.getByText(`Chapter ${section.number}`)).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '本章定位' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '主题范围' })).toBeVisible();
    await expect(page.locator('[data-knowledge-sidebar] [aria-current="page"]')).toHaveAttribute(
      'href',
      getKnowledgeUrl(section.slug),
    );
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
  await expect(page.locator('[data-knowledge-docs]')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('先审后信');
  await expect(page.getByRole('heading', { name: /相互否证/ })).toBeVisible();
  await expect(page.locator('.meta-line')).toContainText('笔记');
  await expect(page.locator('.meta-line')).toContainText('行而成');
  await expect(page.locator('.meta-line')).toContainText('已复盘');
  await expect(page.locator('.knowledge-article-facts')).toContainText('praxis-note-0001');
  await expect(page.locator('.knowledge-article-facts')).toContainText('安全');
  await expect(page.getByRole('heading', { level: 2, name: '长期沉淀' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '真实实践时间轴' })).toBeVisible();
  await expect(page.locator('.content-back')).toHaveAttribute('href', '/knowledge');
  await expect(page.locator('[data-knowledge-toc-link]')).toHaveCount(6);
  await expect(
    page.locator('[data-knowledge-toc-link="方法不是看一遍而是相互否证"]'),
  ).toHaveAttribute('href', '#方法不是看一遍而是相互否证');
  await expect(page.locator('[data-knowledge-sidebar] [aria-current="page"]')).toHaveAttribute(
    'href',
    '/knowledge/ai-code-security-review',
  );

  await page.goto('/knowledge/what-green-gates-miss');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('[data-knowledge-docs]')).toHaveAttribute(
    'data-knowledge-docs-ready',
    'true',
  );
  await expect(page.locator('[data-knowledge-sidebar] [aria-current="page"]')).toHaveAttribute(
    'href',
    '/knowledge/what-green-gates-miss',
  );
  await expect(page.locator('[data-knowledge-toc-link]')).toHaveCount(0);
  const emptyTocMessage = page.getByText('本页暂无可跳转的小节。');
  if (!(await emptyTocMessage.isVisible())) {
    await page.locator('[data-knowledge-toc] summary').click();
  }
  await expect(emptyTocMessage).toBeVisible();
  const authoredLegacyLink = page.getByRole('link', { name: '关于对抗式安全审查的笔记' });
  await expect(authoredLegacyLink).toHaveAttribute('href', '/notes/ai-code-security-review');
  await authoredLegacyLink.click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/knowledge/ai-code-security-review');
});

test('knowledge filter and shortcut progressively enhance the rendered navigation', async ({
  page,
}) => {
  await page.goto('/knowledge/ai-code-security-review');

  const sidebarDisclosure = page.locator('[data-knowledge-sidebar] details');
  const sidebarSummary = sidebarDisclosure.locator('summary');
  const input = page.locator('[data-knowledge-filter-input]');
  if (!(await input.isVisible()) && (await sidebarSummary.isVisible())) {
    await sidebarSummary.click();
  }

  await expect(input).toBeVisible();
  await page.keyboard.press('Control+k');
  await expect(input).toBeFocused();

  await input.fill('安全');
  await expect(page.locator('[data-knowledge-filter-item]:not([hidden])')).toHaveCount(1);
  await expect(page.locator('[data-knowledge-filter-status]')).toHaveText('已显示 1 个知识入口');

  await input.fill('不存在的入口');
  await expect(page.locator('[data-knowledge-filter-item]:not([hidden])')).toHaveCount(0);
  await expect(page.locator('[data-knowledge-filter-status]')).toHaveText('没有匹配的知识入口');

  await page.keyboard.press('Escape');
  await expect(page.locator('[data-knowledge-filter-item]:not([hidden])')).toHaveCount(
    knowledgeSections.length + 2,
  );
});

test('wide knowledge pages expose three non-overlapping document columns', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Desktop document geometry only.');

  for (const viewport of [
    { width: 1536, height: 900 },
    { width: 1920, height: 1021 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/knowledge/ai-code-security-review');

    const geometry = await page.locator('[data-knowledge-docs]').evaluate((root) => {
      const sidebar = root.querySelector('[data-knowledge-sidebar]');
      const content = root.querySelector('[data-knowledge-article-view]');
      const toc = root.querySelector('[data-knowledge-toc]');
      const filter = root.querySelector('.knowledge-filter__control');
      const heading = content?.querySelector('h1');
      const tocTitle = toc?.querySelector('.knowledge-toc__body h2');
      if (
        !(root instanceof HTMLElement) ||
        !(sidebar instanceof HTMLElement) ||
        !(content instanceof HTMLElement) ||
        !(toc instanceof HTMLElement) ||
        !(filter instanceof HTMLElement) ||
        !(heading instanceof HTMLElement) ||
        !(tocTitle instanceof HTMLElement)
      ) {
        throw new Error('Knowledge document columns are missing.');
      }

      const rootRect = root.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const tocRect = toc.getBoundingClientRect();
      const chapterRows = [...sidebar.querySelectorAll('.knowledge-sidebar__group ol a')];
      const chapterCounts = [...sidebar.querySelectorAll('.knowledge-sidebar__count')];
      return {
        rootLeft: rootRect.left,
        rootWidth: rootRect.width,
        sidebarRight: sidebarRect.right,
        sidebarWidth: sidebarRect.width,
        contentLeft: contentRect.left,
        contentRight: contentRect.right,
        tocLeft: tocRect.left,
        tocWidth: tocRect.width,
        firstViewportTops: [
          filter.getBoundingClientRect().top,
          heading.getBoundingClientRect().top,
          tocTitle.getBoundingClientRect().top,
        ],
        sidebarPosition: getComputedStyle(sidebar).position,
        tocPosition: getComputedStyle(toc).position,
        sidebarOverflowY: getComputedStyle(sidebar).overflowY,
        tocOverflowY: getComputedStyle(toc).overflowY,
        countTexts: chapterCounts.map((count) => count.textContent?.trim() ?? ''),
        countPaddingInline: chapterCounts.map((count) => {
          const styles = getComputedStyle(count);
          return [styles.paddingInlineStart, styles.paddingInlineEnd];
        }),
        chapterRowsAreSingleLine: chapterRows.every((row) => {
          const title = row.querySelector('strong');
          return (
            title instanceof HTMLElement &&
            getComputedStyle(title).whiteSpace === 'nowrap' &&
            row.scrollHeight <= row.clientHeight
          );
        }),
        descriptionsAreHidden: [
          ...sidebar.querySelectorAll('.knowledge-sidebar__description'),
        ].every((description) => getComputedStyle(description).display === 'none'),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });

    expect(geometry.rootWidth, `${viewport.width}px shell width`).toBeCloseTo(
      Math.min(viewport.width - 48, 1728),
      0,
    );
    expect(geometry.rootLeft, `${viewport.width}px shell centering`).toBeCloseTo(
      (viewport.width - geometry.rootWidth) / 2,
      0,
    );
    expect(geometry.sidebarWidth).toBeGreaterThanOrEqual(288);
    expect(geometry.tocWidth).toBeGreaterThanOrEqual(240);
    expect(geometry.sidebarRight).toBeLessThanOrEqual(geometry.contentLeft);
    expect(geometry.contentRight).toBeLessThanOrEqual(geometry.tocLeft);
    expect(
      Math.max(...geometry.firstViewportTops) - Math.min(...geometry.firstViewportTops),
      `${viewport.width}px first viewport alignment`,
    ).toBeLessThanOrEqual(96);
    expect(geometry.sidebarPosition).toBe('sticky');
    expect(geometry.tocPosition).toBe('sticky');
    expect(geometry.sidebarOverflowY).toBe('visible');
    expect(geometry.tocOverflowY).toBe('visible');
    expect(geometry.countTexts).toHaveLength(knowledgeSections.length);
    expect(
      geometry.countTexts.every((count) => count !== '' && String(Number(count)) === count),
    ).toBe(true);
    expect(geometry.countPaddingInline).toEqual(
      Array.from({ length: knowledgeSections.length }, () => ['0px', '0px']),
    );
    expect(geometry.chapterRowsAreSingleLine).toBe(true);
    expect(geometry.descriptionsAreHidden).toBe(true);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
  }

  await page.setViewportSize({ width: 1536, height: 700 });
  await page.goto('/knowledge/ai-code-security-review');
  await expect(page.locator('[data-knowledge-sidebar]')).toHaveCSS('position', 'static');
  await expect(page.locator('[data-knowledge-toc]')).toHaveCSS('position', 'static');
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

test('primary pages use their own editorial art while knowledge interiors keep the docs shell', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1536, height: 791 });

  await page.goto('/');
  const homepageDesktopOverlay = await page
    .locator('.hero-overlay')
    .evaluate((element) => getComputedStyle(element).backgroundImage);

  for (const [pathname, variant, heading] of [
    ['/knowledge', 'knowledge', '知识'],
    ['/projects', 'projects', '项目'],
    ['/journey', 'journey', '旅程'],
    ['/about', 'about', '关于 Praxis'],
  ] as const) {
    await page.goto(pathname);

    const hero = page.locator(`[data-page-hero="${variant}"]`);
    await expect(hero).toHaveCount(1);
    await expect(hero.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(hero.locator('img')).toHaveAttribute('src', editorialHeroArt[variant].src);
    await expect(hero.locator('img')).toHaveAttribute('srcset', editorialHeroArt[variant].srcset);
    await expect(hero.locator('img')).toHaveAttribute('alt', '');

    const geometry = await hero.evaluate((element) => {
      const headingElement = element.querySelector('h1');
      const image = element.querySelector('img');
      const header = document.querySelector('.site-header');
      if (!(headingElement instanceof HTMLElement) || !(image instanceof HTMLImageElement)) {
        throw new Error('Editorial hero is missing its semantic heading or decorative image');
      }

      return {
        heroBottom: element.getBoundingClientRect().bottom,
        headerBottom: header?.getBoundingClientRect().bottom ?? 0,
        headingTop: headingElement.getBoundingClientRect().top,
        imageObjectFit: getComputedStyle(image).objectFit,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });

    expect(geometry.headingTop, pathname).toBeGreaterThanOrEqual(geometry.headerBottom);
    expect(Math.abs(geometry.heroBottom - 791), pathname).toBeLessThanOrEqual(1);
    expect(geometry.imageObjectFit, pathname).toBe('cover');
    expect(geometry.scrollWidth, pathname).toBeLessThanOrEqual(geometry.clientWidth);

    const desktopVeil = await hero
      .locator('.editorial-hero__veil')
      .evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(desktopVeil, pathname).toBe(homepageDesktopOverlay);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/knowledge');
  const knowledgeMobileVeil = await page
    .locator('[data-page-hero="knowledge"] .editorial-hero__veil')
    .evaluate((element) => getComputedStyle(element).backgroundImage);
  expect(knowledgeMobileVeil).toContain('linear-gradient(0deg');
  expect(knowledgeMobileVeil).not.toContain('90deg');
  expect(knowledgeMobileVeil).not.toBe(homepageDesktopOverlay);

  await page.goto(firstKnowledgeSectionUrl);
  await expect(page.locator('[data-page-hero]')).toHaveCount(0);
  await expect(page.locator('.page-hero')).toHaveCount(0);
  await expect(page.locator('[data-knowledge-docs]')).toHaveCount(1);
  await expect(page.locator('[data-knowledge-section-view]')).toHaveCount(1);
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

test('theme control remains hidden when its enhancement script cannot load', async ({ page }) => {
  await page.route('**/scripts/theme-toggle.js', (route) => route.abort());
  await page.goto('/');

  await expect(page.locator('html')).toHaveClass(/\bjs\b/);
  await expect(page.locator('[data-theme-toggle]')).toBeHidden();
});

test('theme control mirrors the CC Switch control geometry and desktop icon handoff', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-chromium',
    'CC Switch swaps the icon directly on touch devices.',
  );

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');

  const toggle = page.locator('[data-theme-toggle]');
  const control = await toggle.evaluate((element) => {
    const styles = getComputedStyle(element);
    const icons = Array.from(element.querySelectorAll<SVGElement>('[data-theme-icon]')).map(
      (icon) => {
        const iconStyles = getComputedStyle(icon);
        return {
          name: icon.dataset.themeIcon,
          width: iconStyles.width,
          height: iconStyles.height,
          strokeWidth: icon.getAttribute('stroke-width'),
          opacity: iconStyles.opacity,
        };
      },
    );

    return {
      width: styles.width,
      height: styles.height,
      borderRadius: styles.borderRadius,
      icons,
    };
  });

  expect(control).toEqual({
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    icons: [
      { name: 'sun', width: '20px', height: '20px', strokeWidth: '2', opacity: '0' },
      { name: 'moon', width: '20px', height: '20px', strokeWidth: '2', opacity: '1' },
    ],
  });

  await toggle.click();
  await expect(toggle).toHaveAttribute('data-theme-transition', 'to-dark');
  const handoff = await toggle.evaluate((element) => {
    const animation = (iconName: string) => {
      const icon = element.querySelector(`[data-theme-icon="${iconName}"]`);
      if (!icon) throw new Error(`Missing ${iconName} theme icon`);

      const styles = getComputedStyle(icon);
      return {
        name: styles.animationName,
        duration: styles.animationDuration,
        delay: styles.animationDelay,
      };
    };

    return {
      exiting: animation('moon'),
      entering: animation('sun'),
    };
  });

  expect(handoff).toEqual({
    exiting: { name: 'theme-toggle-icon-exit', duration: '0.15s', delay: '0s' },
    entering: { name: 'theme-toggle-icon-enter', duration: '0.15s', delay: '0.15s' },
  });
  await expect.poll(() => toggle.getAttribute('data-theme-transition')).toBeNull();
  await expect(page.locator('[data-theme-icon="sun"]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-theme-icon="moon"]')).toHaveCSS('opacity', '0');
});

test('touch theme control swaps icons directly', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile-chromium',
    'The direct-swap contract applies to touch devices only.',
  );

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');

  const toggle = page.locator('[data-theme-toggle]');
  await toggle.click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).not.toHaveAttribute('data-theme-transition', /.+/);
  await expect(page.locator('[data-theme-icon="sun"]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-theme-icon="moon"]')).toHaveCSS('opacity', '0');
});

test('theme icon handoff respects reduced-motion preferences', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/');

  const toggle = page.locator('[data-theme-toggle]');
  await toggle.click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).not.toHaveAttribute('data-theme-transition', /.+/);
  await expect(page.locator('[data-theme-icon="sun"]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-theme-icon="moon"]')).toHaveCSS('opacity', '0');
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
  const themeColor = page.locator('[data-theme-color-override]');
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

  await expect(page.locator('[data-theme-color-override]')).toHaveAttribute('content', '#f4f1ea');

  const toggle = page.getByRole('button', { name: '切换到深色主题' });
  await expect(toggle).toHaveAttribute('title', '切换到深色主题');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('[data-theme-color-override]')).toHaveAttribute('content', '#171512');
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

  await page.goto(firstKnowledgeSectionUrl);
  const docsDisclosure = page.locator('[data-knowledge-sidebar] details');
  if (
    !(await docsDisclosure.evaluate(
      (details) => details instanceof HTMLDetailsElement && details.open,
    ))
  ) {
    await docsDisclosure.locator('summary').click();
  }
  const chapterDescriptions = docsDisclosure.locator('.knowledge-sidebar__description');
  await expect(chapterDescriptions).toHaveCount(knowledgeSections.length);
  expect(
    await chapterDescriptions.evaluateAll((descriptions) =>
      descriptions.every(
        (description) =>
          getComputedStyle(description).display !== 'none' &&
          description.getBoundingClientRect().height > 0,
      ),
    ),
  ).toBe(true);

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
    .locator('.brand, .nav-link, [data-knowledge-menu-trigger], [data-theme-toggle]')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        const hasExtendedHitArea = element.matches('.nav-link, [data-knowledge-menu-trigger]');
        const hitArea = hasExtendedHitArea ? getComputedStyle(element, '::before') : undefined;
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

  await page.goto('/knowledge');
  const editorialArtAnimation = await page
    .locator('[data-page-hero="knowledge"] img')
    .evaluate((image) => getComputedStyle(image).animationName);
  expect(editorialArtAnimation).toBe('none');
});

test('editorial hero artwork is excluded in forced-colors mode', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/knowledge');

  await expect(page.locator('[data-page-hero="knowledge"] img')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: '知识' })).toBeVisible();
});

test('keyboard order remains brand-first across the explicit navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/knowledge');

  const navigation = page.getByRole('navigation', { name: '主要导航' });
  const knowledgeMenu = navigation.locator('details[data-knowledge-menu]');
  const knowledgeOverviewLink = navigation.locator('[data-knowledge-overview-link]');
  const knowledgeTrigger = knowledgeMenu.locator('summary[data-knowledge-menu-trigger]');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳到主要内容' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.brand')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(knowledgeOverviewLink).toBeFocused();
  const knowledgeOverviewStyle = await knowledgeOverviewLink.evaluate((element) => {
    const indicator = getComputedStyle(element, '::after');
    return {
      opacity: indicator.opacity,
      height: indicator.height,
    };
  });
  expect(knowledgeOverviewStyle.opacity).toBe('1');
  expect(Number.parseFloat(knowledgeOverviewStyle.height)).toBeGreaterThan(0);

  await page.keyboard.press('Tab');
  await expect(knowledgeTrigger).toBeFocused();
  await expect
    .poll(() =>
      knowledgeTrigger.evaluate((element) => getComputedStyle(element, '::after').opacity),
    )
    .toBe('1');
  const knowledgeTriggerStyle = await knowledgeTrigger.evaluate((element) => {
    const indicator = getComputedStyle(element, '::after');
    const trigger = getComputedStyle(element);
    return {
      boxShadow: trigger.boxShadow,
      outlineStyle: trigger.outlineStyle,
      opacity: indicator.opacity,
      height: indicator.height,
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
        return {
          outlineStyle: styles.outlineStyle,
          outlineWidth: styles.outlineWidth,
          background: styles.backgroundColor,
          edge: styles.boxShadow,
        };
      });
      expect(firstKnowledgeLinkStyle.outlineStyle).not.toBe('none');
      expect(Number.parseFloat(firstKnowledgeLinkStyle.outlineWidth)).toBeGreaterThan(0);
      expect(firstKnowledgeLinkStyle.background).not.toBe('rgba(0, 0, 0, 0)');
      expect(firstKnowledgeLinkStyle.edge).not.toBe('none');
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
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
  const page = await context.newPage();

  await page.goto('/');
  await expect(page.locator('[data-theme-color-fallback="light"]')).toHaveAttribute(
    'media',
    '(prefers-color-scheme: light)',
  );
  await expect(page.locator('[data-theme-color-fallback="dark"]')).toHaveAttribute(
    'media',
    '(prefers-color-scheme: dark)',
  );
  await expect(page.locator('[data-theme-color-override]')).toHaveAttribute('media', 'not all');
  await expect(page.locator('[data-theme-toggle]')).toBeHidden();
  const knowledgeOverviewLink = page.locator('[data-knowledge-overview-link]');
  await expect(knowledgeOverviewLink).toHaveAttribute('href', '/knowledge');
  await knowledgeOverviewLink.click();
  await expect(page).toHaveURL(/\/knowledge$/);

  const knowledgeMenu = page.locator('details[data-knowledge-menu]');
  await knowledgeMenu.locator('summary[data-knowledge-menu-trigger]').click();
  await expect(knowledgeMenu).toHaveJSProperty('open', true);
  await knowledgeMenu
    .locator(`[data-knowledge-menu-link][href="${firstKnowledgeSectionUrl}"]`)
    .click();
  await expect(page).toHaveURL(new RegExp(`${firstKnowledgeSectionUrl}$`));
  await expect(page.locator('[data-knowledge-sidebar] [data-knowledge-filter-item]')).toHaveCount(
    knowledgeSections.length + 2,
  );
  await expect(page.getByRole('heading', { name: '此入口尚无作者内容' })).toBeVisible();
  await page.getByRole('link', { name: '返回知识总览' }).click();
  await expect(page).toHaveURL(/\/knowledge$/);

  await page
    .locator('.recent-list h3')
    .getByRole('link', { name: /先审后信/ })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('先审后信');
  const firstTocLink = page.locator('[data-knowledge-toc-link]').first();
  const firstTocHref = await firstTocLink.getAttribute('href');
  expect(firstTocHref).toMatch(/^#.+/);
  await firstTocLink.click();
  await expect.poll(() => decodeURIComponent(new URL(page.url()).hash)).toBe(firstTocHref);
  await page.locator('.content-back').focus();
  await page.keyboard.press('Enter');
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
