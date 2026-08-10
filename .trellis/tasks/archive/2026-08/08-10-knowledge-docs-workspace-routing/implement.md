# Knowledge 文档工作台路由与 ClientRouter：实施计划

## 1. Planning and source capture

- [x] 读取用户截图、当前 `/knowledge` 与章节页面。
- [x] 读取 CC Switch 的 query/state 结构和 Astro ClientRouter 约定。
- [x] 读取 frontend routing/component/state/hook/quality specs。

## 2. Route and content boundaries

- [x] 增加 typed knowledge context URL helper。
- [x] 顶栏 Knowledge 进入带默认 section context 的总览工作台。
- [x] 下拉章节、文章、继续阅读与返回入口保留 section context。
- [x] 保持 canonical metadata、legacy compatibility、RSS 与 Sitemap 不变。

## 3. Overview redesign

- [x] 使用共享文档壳层替换 `/knowledge` 旧 EditorialHero 组合。
- [x] 提供搜索、开始阅读、章节计数、最近更新和真实空状态。
- [x] 覆盖 Dark、移动折叠、键盘焦点、forced-colors 和 320px 无溢出。

## 4. ClientRouter enhancement

- [x] 在 `KnowledgeDocsLayout` 加入 `ClientRouter` 与 hover 预取。
- [x] 重构 `knowledge-docs.js`，支持 `astro:page-load` 重复初始化与清理。
- [x] 覆盖搜索、快捷键、Escape、TOC、history/back 与 No-JS 回退。

## 5. Verification

- [x] 更新顶栏总览入口、current state、Journey CTA 和 No-JS E2E assertions。
- [x] 运行变更文件 Prettier、lint、typecheck、unit、build 与完整 E2E。
- [x] 更新路由规范、source findings 和 `design-qa.md`。

## 6. ClientRouter theme-toggle regression

- [x] 修复共享 Header 被替换后主题按钮仍引用首屏 DOM 的生命周期缺陷。
- [x] 增加章节到总览、切换主题、浏览器返回后的 E2E 回归覆盖。
- [x] 运行变更文件 Prettier、lint、typecheck、unit、build 与完整 E2E。
- [x] 更新 hook/quality 规范与 `design-qa.md` 验证记录。

## 7. Query-first Knowledge navigation

- [x] 在知识章节注册表中增加短别名，并集中实现 query 导航 URL 与 query-to-canonical 解析 helper；未归类文章必须省略 section。
- [x] 将顶栏、侧栏、总览章节卡片、最近文章、章节前后导航、文章返回入口和 Journey CTA 全部切换到 `/knowledge?section=...&item=...`。
- [x] 保留 `/knowledge/:key` 静态构建与 canonical 语义，并让渲染状态由真实 section/article 数据驱动。
- [x] 为 Astro dev 与项目静态 preview server 增加 query 请求内部映射，为生产 `Caddyfile.example` 增加等价静态 rewrite 与安全的未知参数处理。
- [x] 覆盖总览、五个章节、文章、刷新、直达、无效参数、ClientRouter history、No-JS 和主题按钮生命周期。
- [x] 更新 routing/state/hook/quality specs 与部署说明。

## 8. Validation and rollback gates

- [x] 运行变更文件 Prettier、`npm run lint`、`npm run typecheck`、`npm run test:unit`、`npm run build` 与完整 Playwright E2E。
- [x] 验证 Caddy 配置和 query 路由 smoke；确认 canonical、RSS、Sitemap、legacy compatibility 与 404 未漂移。
- [x] 检查构建 HTML 不再生成重复的长章节导航 URL，并在 Light/Dark、桌面、移动端和 320px 完成视觉回归。
- [x] 确认 query rewrite 在 dev、项目 preview server 和 production 三个边界保持一致，无需触发 canonical path 回滚方案。
