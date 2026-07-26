import { mkdir } from 'node:fs/promises';

import { chromium } from '@playwright/test';
import { preview } from 'astro';

// 视觉评审辅助脚本：对 dist/ 的 preview 截取关键页面的桌面/双主题/移动端截图。
// 产物写入 apps/web/shots/（已在 .gitignore 中），仅用于人工设计评审，不参与 CI。
// 需要先完成一次 `npm run build`。

const server = await preview({ root: process.cwd() });
const base = `http://localhost:${server.port ?? 4321}`;
const browser = await chromium.launch();

const shots = [
  { path: '/', name: 'home', schemes: ['light', 'dark'] },
  { path: '/projects', name: 'list', schemes: ['light'] },
  { path: '/projects/praxis-foundation', name: 'detail', schemes: ['light', 'dark'] },
  { path: '/blog', name: 'empty', schemes: ['light'] },
  { path: '/nope', name: '404', schemes: ['light'] },
];

await mkdir('shots', { recursive: true });

for (const shot of shots) {
  for (const scheme of shot.schemes) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: scheme,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(base + shot.path, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `shots/shot-${shot.name}-${scheme}.png`, fullPage: true });
    await context.close();
  }
}

const mobile = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 1,
});
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${base}/`, { waitUntil: 'networkidle' });
await mobilePage.screenshot({ path: 'shots/shot-home-mobile.png', fullPage: true });
await mobile.close();

await browser.close();
await server.stop();
process.stdout.write('Screenshots written to apps/web/shots/\n');
