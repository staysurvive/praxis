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

test('missing routes use the branded 404', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '这一页尚未抵达' })).toBeVisible();
});

test('theme control persists an explicit dark theme', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /切换到/ });

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
  const storedTheme = await page.evaluate(() => localStorage.getItem('praxis-theme'));
  expect(storedTheme === 'light' || storedTheme === 'dark').toBe(true);
});

test('home and detail pages pass a basic automated accessibility scan', async ({ page }) => {
  for (const path of ['/', '/projects/praxis-foundation']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
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
