# Knowledge 文档工作台路由与 ClientRouter 优化

## Goal

把 Knowledge 从“先进入一个独立总览页，再进入章节”调整为 CC Switch 式文档工作台：顶栏的“知识”直接进入默认章节，章节导航通过可分享的 `section` 查询参数表达当前上下文；`/knowledge` 保留为重新设计后的文档入口页，但不再承担主导航的必经步骤。

## Requirements

### R1. Entry and URL architecture

- 顶栏“知识”直接链接到默认章节，而不是 `/knowledge` 空总览页。
- 知识导航链接携带 `?section=<knowledge-section-key>` 上下文后缀，路径仍使用现有稳定 canonical URL，保证无 JavaScript 时可以直接打开。
- `/knowledge` 重新设计为 CC Switch 风格的文档入口/索引，不复制外部品牌资产，不改变既有内容 slug、canonical 内容 URL、RSS 或 Sitemap 语义。
- 保留五个章节与现有文章路由；章节查询参数只表达导航上下文，不成为新的内容数据源。

### R2. Documentation workspace visual system

- 总览页继承文档工作台的搜索优先、章节分组、最近更新和简洁三栏层级，使用 Praxis 的纸张、铜色、字体和明暗主题。
- 默认首屏优先呈现“开始阅读”入口、五个章节入口和最近更新，不再使用与文档内页割裂的 EditorialHero。
- 章节入口保留真实计数、描述和可访问名称；空章节必须保持真实空状态，不填充伪内容。
- 桌面、移动、键盘焦点、Dark、Reduced Motion 和 320px 无横向溢出继续受支持。

### R3. Client-side navigation enhancement

- 在 Knowledge 文档布局加入 Astro `ClientRouter`，并为内部知识链接启用 `data-astro-prefetch`。
- 页面切换必须保留真实 URL、浏览器历史、焦点可用性和返回行为。
- `knowledge-docs.js` 改为可在初次加载和 `astro:page-load` 生命周期重复初始化，避免 ClientRouter 切换后搜索、TOC、快捷键失效或重复绑定。
- 无 JavaScript 时，所有链接仍使用服务器可直接渲染的 HTML 页面；不得依赖浏览器 fetch、全局 store 或 SSR。

### R4. Scope and compatibility

- 不引入 React、全局客户端状态、远程内容请求或新的后端边界。
- 不改变内容 schema、`contentId`、五个固定章节 key、legacy compatibility 页面或生产部署契约。
- 不复制 CC Switch Logo、品牌文案或远程字体；图标继续使用现有 `lucide-astro`。

## Acceptance Criteria

- [ ] 顶栏“知识”直接进入默认章节，且链接带 `section` 查询参数。
- [ ] `/knowledge` 是新的文档入口索引，不再使用 EditorialHero；首屏可进入五个章节和最近更新。
- [ ] 章节、文章、继续阅读和返回知识入口链接保留稳定路径，并携带正确的 `section` 上下文。
- [ ] Knowledge 布局存在 `ClientRouter`，内部导航具备预取属性；点击章节时保持 URL、历史和可访问焦点。
- [ ] 搜索筛选、`Ctrl/Meta + K`、Escape、TOC 激活态在首次加载和 ClientRouter 切换后均正常。
- [ ] No-JS 页面可打开所有知识链接，canonical/metadata/404 既有测试继续通过。
- [ ] Light、Dark、移动端、320px、Reduced Motion 和 Axe 回归通过；`design-qa.md` 以 `final result: passed` 结束。
- [ ] `npm run lint`、`npm run typecheck`、`npm run test:unit`、`npm run build`、`npm run test:e2e` 通过。

## Out of Scope

- 不把所有知识内容合并为一个依赖 JavaScript 的单页数据应用。
- 不新增全文搜索服务、持久化筛选状态或后端 API。
- 不删除 canonical `/knowledge/:key` 内容路由；`/knowledge` 只是不再作为主导航必经页。
