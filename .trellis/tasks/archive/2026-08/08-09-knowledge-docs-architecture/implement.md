# 知识中心文档架构重构：实施计划

## Completion Status

两轮实现、独立复核、自动化验证与视觉 QA 已完成。仓库级 `format:check` 仍受 73 个既有 CRLF 文件影响；本任务全部文件的定向 Prettier 检查通过。

## 1. Pre-development

- [x] 读取 `trellis-before-dev` 与 Phase 2.1 上下文，确认 frontend 规范和当前 task 状态。
- [x] 复核工作区差异，确保不覆盖其他任务或用户改动。
- [x] 搜索 `PageHero`、`ContentLayout`、`knowledgeSections`、知识 E2E 断言与所有 `/knowledge/[key]` 消费点。

## 2. Typed information architecture

- [x] 扩展 `knowledgeSections`，加入 chapter number、introduction、topics，并保持 key/slug/label/order 不变。
- [x] 添加/复用知识 TOC 与侧栏 view model 类型，保证路由只向组件传递最小类型化数据。
- [x] 补充集中式中文 copy 与 accessibility 文案，避免在多个组件重复常量。
- [x] 更新 unit tests，锁定注册表稳定性与新增文档元数据完整性。

## 3. Shared document shell

- [x] 新建 `KnowledgeDocsLayout.astro`，实现 SEO 透传、三栏 grid、responsive order 与 sticky rail 边界。
- [x] 新建 `KnowledgeSidebar.astro`，实现总览/五章/真实最近文章、数量、current state、移动折叠和筛选语义。
- [x] 新建 `KnowledgeTableOfContents.astro`，实现 depth 2/3 目录、空目录状态、桌面 rail 与移动折叠。
- [x] 新建 `KnowledgeSectionView.astro`，实现章节 header、定位、topics、真实内容/空状态与相邻章节导航。
- [x] 新建 `KnowledgeArticleView.astro`，迁移知识文章展示并复用现有内容组件。

## 4. Route integration

- [x] 重构 `knowledge/[key].astro`，在单一数据装配层生成 section counts、recent entries、rendered headings 与 SEO props。
- [x] 让 section 与 article 分支都进入共享文档壳层。
- [x] 保持 `/knowledge` 总览、URL resolver、canonical、Sitemap、legacy compatibility 与 Markdown schema 不变。
- [x] 验证无内容章节仍为真实空状态，两篇现有文章不被自动分类。

## 5. Progressive behavior

- [x] 新建外部 `knowledge-docs.js`，实现 Ctrl/⌘+K、导航筛选、aria-live 结果与 TOC active state。
- [x] 确保脚本重复加载安全、无网络请求、无内联代码依赖；脚本失败时静态体验完整。
- [x] 覆盖键盘、触控、Escape/折叠与 reduced-motion 相邻行为，不破坏现有顶部知识菜单脚本。

## 6. Automated verification

- [x] 更新 E2E：五个 section、两篇 article、三栏结构、current state、TOC、筛选快捷键、hash 导航。
- [x] 更新 E2E：no-JS、Light/Dark Axe、reduced motion、项目移动视口与 320px 无横向溢出。
- [x] 运行 `npm run format:check`（仓库既有 CRLF 基线失败；任务文件定向检查通过）。
- [x] 运行 `npm run lint`。
- [x] 运行 `npm run typecheck`。
- [x] 运行 `npm run test:unit`。
- [x] 运行 `npm run build`。
- [x] 运行知识相关 E2E；通过后运行 `npm run test:e2e` 全量回归。

## 7. Visual QA gate

- [x] 启动本地 Astro 预览并在浏览器打开目标知识 section 与 article。
- [x] 捕获与参考同宽的 1920px Light 桌面状态，另捕获 Dark 与移动关键状态。
- [x] 将参考与实现放入同一比较图，按 typography、spacing、color、assets、copy 五个面检查。
- [x] 修复所有 P0/P1/P2，重复捕获和比较，直至 `design-qa.md` 的 `final result: passed`。
- [x] 测试主导航、侧栏链接、筛选、折叠、TOC/hash、主题切换并检查浏览器 console error。

## 8. Spec sync and handoff

- [x] 更新 `.trellis/spec/frontend/component-guidelines.md`，把知识子页面从旧 `PageHero` 约定迁移到共享文档壳层约定。
- [x] 运行最终 lint、typecheck、unit、build 与全量 E2E 质量门禁。
- [x] 检查 `git diff --check` 与完整 diff，确认没有假内容、URL 漂移或意外修改。
- [x] 记录质量结果与剩余 P3（无），保留本地预览供用户验收。

## 9. CC Switch detail refinement

- [x] 保存并测量最新参考截图，记录宽屏三栏、首屏对齐、导航行高与目录节奏。
- [x] 扩展文档宽屏容器并重设三栏比例，保证 1536px 和 1920px 均无重叠或横向溢出。
- [x] 精简桌面章节行与搜索呈现，保留真实计数、筛选数据、current state 和移动描述。
- [x] 收紧章节/文章 header 与正文区块垂直节奏，移除可避免的桌面内嵌滚动条。
- [x] 更新几何与视觉回归断言，运行 lint、typecheck、unit、build 和全量 E2E。
- [x] 重拍 Light/Dark、章节/文章与移动状态，生成同图比较并更新 `design-qa.md` 至 `passed`。

## Risky Files and Rollback Points

- `apps/web/src/pages/knowledge/[key].astro`：唯一知识动态路由；每次分支改造后先做 typecheck/build。
- `apps/web/src/lib/content/domain.ts`：公开注册表与 schema 类型来源；只增加向后兼容字段，不改 key/slug/order。
- `apps/web/tests/e2e/site.spec.ts`：避免删除现有 canonical、导航、no-JS 与 accessibility 合同，只替换旧 PageHero/空页结构假设。
- `design-qa.md`：更新前先读取现有内容，只用本轮报告有意替换，不把旧报告误当实现证据。
- 回滚点：恢复旧 `[key].astro` 与知识文章的 `ContentLayout` 分支，删除新知识组件/脚本；无需内容或 URL 迁移回滚。
