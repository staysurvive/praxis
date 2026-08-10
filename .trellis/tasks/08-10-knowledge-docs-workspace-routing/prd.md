# Knowledge 文档工作台路由与 ClientRouter 优化

## Goal

将 Knowledge 调整为 CC Switch 风格的文档工作台：顶栏“知识”进入知识总览工作台，并通过 `?section=agent-app-development` 保留默认章节上下文；下拉章节、工作台章节卡片和“开始阅读”入口仍可直接进入具体章节。

## Requirements

### R1. Entry and URL architecture

- 顶栏“知识”链接到 `/knowledge?section=agent-app-development` 总览页，而不是直接进入章节。
- 知识导航章节链接携带 `?section=<knowledge-section-key>`，用于表达当前上下文；canonical URL 仍保持无 query 的稳定内容路径。
- `/knowledge` 使用文档工作台设计，包含搜索、开始阅读、五个章节入口和最近更新，不再使用 EditorialHero 作为入口结构。
- 保留五个章节、现有文章 slug、canonical、RSS、Sitemap 和 legacy compatibility 语义。
- `section` 只表达导航上下文，不成为新的内容数据源或静态路由族。

### R2. Documentation workspace visual system

- 总览页继承文档工作台的搜索优先、章节分组、最近更新和三栏层级，使用 Praxis 纸张、铜色、字体和 Light/Dark token。
- 首屏展示开始阅读入口、五个章节入口和真实最近更新。
- 章节计数、描述、文章标题和空状态都来自真实内容；不填充虚假内容。
- 桌面、移动端、键盘焦点、Dark、Reduced Motion、forced-colors 和 320px 无横向溢出继续受支持。

### R3. Client-side navigation enhancement

- Knowledge 文档布局接入 Astro `ClientRouter`，内部 Knowledge 链接启用 `data-astro-prefetch="hover"`。
- 页面切换保留真实 URL、浏览器历史、焦点可用性和返回行为。
- `knowledge-docs.js` 在首次加载和 `astro:page-load` 时可重复初始化并清理旧监听器、observer。
- ClientRouter 替换共享 Header 后，主题按钮必须重新绑定、保持可见且仍能切换主题；返回历史页面后同样可用。
- 无 JavaScript 时所有真实链接仍可直接打开服务端渲染 HTML。

### R4. Scope and compatibility

- 不引入 React、全局客户端 store、远程内容请求或后端边界。
- 不改变 schema、contentId、五个章节 key、canonical、RSS、Sitemap 或 legacy compatibility。
- 不复制 CC Switch Logo、品牌文案或远程字体；图标继续使用 `lucide-astro`。

## Acceptance Criteria

- [x] 顶栏“知识”进入 `/knowledge?section=agent-app-development` 总览页。
- [x] 下拉五个章节、开始阅读和章节卡片仍进入对应章节并携带正确 section context。
- [x] `/knowledge` 工作台不使用 EditorialHero，首屏提供章节与最近更新入口。
- [x] Knowledge 布局存在 ClientRouter、内部预取属性和可重复的文档脚本生命周期。
- [x] 章节、总览和浏览器返回之间软导航时，Header 主题按钮始终完成重新绑定并可切换主题。
- [x] 搜索、`Ctrl/Meta + K`、Escape、TOC、history/back、No-JS、Axe、Light/Dark、移动端和 320px 回归通过。
- [x] canonical、metadata、404、RSS、Sitemap 和 legacy compatibility 继续通过。
- [x] `design-qa.md` 以 `final result: passed` 结束。

## Out of Scope

- 不把所有知识内容合并为依赖 JavaScript 的单页数据应用。
- 不新增全站全文搜索服务、持久化筛选状态或后端 API。
- 不删除 `/knowledge/:key` canonical 内容路由；`/knowledge` 是工作台总览入口。
