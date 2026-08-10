# Knowledge 文档工作台路由与 ClientRouter：实施计划

## 1. Planning and source capture

- [x] 读取用户截图、当前 `/knowledge` 与章节页面。
- [x] 读取 CC Switch 文档 URL 与前端 bundle 的 query/state 结构。
- [x] 读取 Astro ClientRouter 生命周期与预取约定。
- [x] 读取 frontend routing/component/state/hook/quality specs。

## 2. Route and content boundaries

- [x] 增加 typed knowledge context URL helper。
- [x] 顶栏 Knowledge 默认进入第一章节并携带 `section` 查询参数。
- [x] 章节、文章、继续阅读与返回入口补齐 section context。
- [x] 保持 canonical metadata、legacy compatibility、RSS 与 sitemap 语义不变。

## 3. Overview redesign

- [x] 新建文档工作台入口组件并替换 `/knowledge` 的旧 EditorialHero 组合。
- [x] 复用侧栏图标、搜索、章节计数、最近更新和 Praxis token。
- [x] 覆盖真实空状态、Dark、移动端折叠、键盘焦点和 320px 无溢出。

## 4. ClientRouter enhancement

- [x] 在 `KnowledgeDocsLayout` 加入 `ClientRouter` 与 `data-astro-prefetch="hover"`。
- [x] 重构 `knowledge-docs.js`，支持 `astro:page-load` 重复初始化与监听器清理。
- [x] 覆盖搜索、快捷键、Escape、TOC、浏览器历史、No-JS 回退与无障碍行为。

## 5. Verification

- [x] 更新 unit/E2E assertions，并把主题动画断言改为同一浏览器任务内采样，避免并行压力下的 300ms 竞态。
- [x] 运行 Prettier、lint、typecheck、unit、build、E2E、Axe 与 No-JS 回归。
- [x] 完成桌面、移动、Light、Dark、forced-colors、reduced-motion 与截图对比 QA。
- [x] 更新根目录 `design-qa.md`，以 `final result: passed` 结束。
