# Knowledge 文档工作台路由与 ClientRouter 优化

## Goal

将 Knowledge 调整为 CC Switch 风格的单入口文档工作台：`/knowledge` 展示知识总览，`section` 选择章节，`item` 选择章节中的文章。浏览器公开地址不再重复章节长路径与同名 query，同时继续保留可分享、可返回、可预加载和无 JavaScript 的真实内容访问能力。

## Confirmed Evidence

- 当前 `apps/web/astro.config.mjs` 使用 `output: 'static'`，生产部署由 Caddy 直接提供 `apps/web/dist/` 静态文件。
- 当前 `/knowledge/[key]` 在构建期生成五个章节和所有公开文章 HTML；`section` 只保存导航上下文，不能决定静态服务器返回哪一份 HTML。
- 用户已确认期望的公开地址形态：章节为 `/knowledge?section=agents`，已归类文章为 `/knowledge?section=agents&item=<article-slug>`。
- 当前两篇非项目文章都没有 `knowledgeSections` 元数据；不能为了 URL 形态伪造章节归属。
- 纯静态服务器默认忽略 query；Astro dev、项目静态 preview server 和生产 Caddy 边界可以在不改变浏览器地址的前提下，把 query 请求内部映射到已构建的 `/knowledge/:key` HTML。

## Requirements

### R1. Entry and URL architecture

- 顶栏“知识”链接到 `/knowledge` 知识总览；不再用默认章节 query 表示总览。
- 章节公开地址使用 `/knowledge?section=<short-section-alias>`，已归类文章使用 `/knowledge?section=<short-section-alias>&item=<article-slug>`，未归类文章使用 `/knowledge?item=<article-slug>`。
- `section` 使用独立于内部 `KnowledgeSectionKey` 的短别名；内部 key、内容 schema 和 Markdown 元数据保持不变。
- `item` 使用现有公开文章 slug，并以文章真实章节作为渲染和导航状态来源；`section` 是可规范化的导航上下文，不能覆盖文章元数据。
- `/knowledge` 使用文档工作台设计，包含搜索、开始阅读、五个章节入口和最近更新，不再使用 EditorialHero 作为入口结构。
- 旧 `/knowledge/:key` 地址继续作为 canonical、RSS、Sitemap、静态渲染目标和无 JavaScript 回退，不能让现有书签或搜索索引失效；界面不再主动生成这类长地址。
- query URL 是短导航地址，不创建第二份内容或第二套索引身份；canonical、RSS 和 Sitemap 继续指向稳定的静态 path。

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
- 无 JavaScript 时总览、章节、文章链接仍必须打开对应的服务端 HTML；不能把 query 深链接降级成只显示总览的客户端壳。

### R4. Scope and compatibility

- 不引入 React、全局客户端 store 或远程内容请求。
- 不改变 schema、contentId、五个章节内部 key 或现有文章 slug。
- 保持 Astro `output: 'static'` 和现有 Caddy 静态部署边界，不引入 SSR adapter、常驻 Node 服务或后端 API。
- 不复制 CC Switch Logo、品牌文案或远程字体；图标继续使用 `lucide-astro`。

## Acceptance Criteria

- [x] 顶栏“知识”进入 `/knowledge` 总览，章节进入 `/knowledge?section=<alias>`，已归类文章进入 `/knowledge?section=<alias>&item=<slug>`，未归类文章进入 `/knowledge?item=<slug>`。
- [x] 地址栏不再生成 `/knowledge/<long-key>?section=<long-key>` 这类重复 URL。
- [x] 刷新、直接粘贴、前进/后退和 ClientRouter 软导航都渲染相同的章节或文章，并保持 Header 主题按钮可用。
- [x] 禁用 JavaScript 后，总览、五个章节和所有文章仍能通过真实链接访问正确 HTML。
- [x] 旧章节/文章 path 地址继续直达相同内容；无效 `section`、无效 `item` 和 section/item 不匹配均有确定行为与测试覆盖。
- [x] canonical、Open Graph、RSS、Sitemap、legacy compatibility 和 404 保持现有静态内容身份。
- [x] 搜索、`Ctrl/Meta + K`、Escape、TOC、Axe、Light/Dark、移动端、320px 和主题生命周期回归继续通过。

## Out of Scope

- 不把所有知识内容合并为只能依赖 JavaScript 才能读取的单页数据应用。
- 不新增全站全文搜索服务、持久化筛选状态或后端 API。
- 不修改文章正文、章节信息架构或知识工作台视觉系统。
- 不把 query 导航地址加入 Sitemap，也不把旧 path 强制重定向到 query。

## Key Decisions

- 短章节别名采用 `agents`、`llm`、`model-engineering`、`practice`、`frontier`；内部章节 key 保持不变。
- UI、ClientRouter 和复制后的浏览器地址使用 query；canonical、RSS、Sitemap 与静态 HTML 继续使用 path。
- Astro dev、项目静态 preview server 与生产 Caddy 都负责 query 到静态 path 的内部映射，浏览器不发生可见重定向。
