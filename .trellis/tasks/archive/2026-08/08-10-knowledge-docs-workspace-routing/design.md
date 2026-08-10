# Knowledge 文档工作台路由与 ClientRouter：技术设计

## 1. Public and canonical route contracts

保留 `getKnowledgeUrl(slug?)` 作为 canonical 静态路径生成器，并为 UI 导航增加独立的 query URL helper。五个注册表条目新增稳定短别名：

```text
agent-app-development            -> agents
llm-principles                   -> llm
fine-tuning-inference-deployment -> model-engineering
practice-cases                   -> practice
knowledge-frontier               -> frontier
```

公开导航形态是：

```text
/knowledge
/knowledge?section=<section-alias>
/knowledge?section=<section-alias>&item=<article-slug>
/knowledge?item=<unassigned-article-slug>
```

canonical、RSS、Sitemap 和实际构建产物继续使用 `/knowledge/:key`。query 只提供更短、可分享的导航地址，不复制内容身份，也不改变 Markdown schema、内部 section key 或文章 slug。

`section` 仅在文章存在真实 `knowledgeSections` 元数据时生成；未归类文章省略 `section`，不能默认塞入 `agents` 或其他章节。

## 2. Static query dispatch

query 请求必须在页面路由解析之前内部映射到现有静态内容路径，同时保留浏览器中的原始 URL：

```text
/knowledge?section=agents
  -> internal /knowledge/agent-app-development

/knowledge?section=agents&item=ai-code-security-review
  -> internal /knowledge/ai-code-security-review

/knowledge?item=what-green-gates-miss
  -> internal /knowledge/what-green-gates-miss
```

- Astro dev 与项目静态 preview server 使用同一份别名解析逻辑改写请求路径，确保 localhost、刷新和 E2E 与生产一致。
- Caddy 在 `/knowledge` query 请求上优先执行等价内部 rewrite，再进入现有 `try_files`/`file_server`；无 query 的 `/knowledge` 仍返回总览。
- `/knowledge/:key` 继续直接可访问，作为 canonical、旧书签和非 query 部署的兼容回退；站内 UI 不再生成它。
- `item` 是内容选择的权威参数；文章实际 section 来自内容元数据。错误的 section 上下文在客户端规范化，不能把文章显示到错误章节。
- 未知 section、未知 item 或不安全的 slug 进入 404；不能回落到看似成功的总览页。

## 3. Current-state semantics

- `/knowledge` 且无参数：顶栏 Knowledge 和侧栏总览使用 `aria-current="page"`。
- 章节 query：顶栏 Knowledge 使用 `aria-current="location"`，匹配的章节链接使用 `aria-current="page"`。
- 文章 query：顶栏 Knowledge 使用 `aria-current="location"`，文章与其真实章节状态来自渲染数据，不从未验证的 query 猜测。

## 4. Overview composition

`knowledge/index.astro` 使用共享 `KnowledgeDocsLayout`，展示搜索、开始阅读、五个章节卡片和真实最近更新。它仍是静态 Astro 页面，不在浏览器重新请求内容。

## 5. ClientRouter lifecycle

`KnowledgeDocsLayout.astro` 提供 `ClientRouter`，内部链接使用 `data-astro-prefetch="hover"`。`knowledge-docs.js` 在首次加载和 `astro:page-load` 时清理并重新绑定搜索、快捷键和 TOC observer。

共享 Header 也会被 ClientRouter 替换或从历史快照恢复，因此 `theme-toggle.js` 使用单一全局委托点击监听器和幂等 `init`：`astro:before-swap` 撤销旧按钮的 ready/动画状态，首次执行和每次 `astro:page-load` 重新查询当前按钮与 theme-color meta、重放已保存的显式主题，并在当前按钮可由委托监听器处理后设置 `data-theme-toggle-ready`。动画锁绑定真实按钮引用，缓存 DOM 上的旧属性不能阻止新点击；脚本被重复执行时只调用已有 `init`，不重复注册全局监听器。

所有链接仍是静态真实 `<a href="/knowledge?...">`。ClientRouter、预取或脚本失败时，Astro 本地请求改写或 Caddy 生产改写返回相同的预渲染 HTML；客户端不负责抓取或拼装文章正文。

## 6. Metadata and discovery

- 页面 canonical、Open Graph URL、RSS 和 Sitemap 继续使用 `/knowledge/:key`，避免把一个静态内容发布成两套索引身份。
- query 页面返回的 HTML 与 canonical path 相同；搜索引擎可通过 canonical 收敛重复入口。
- 旧 path 不强制跳转，保证没有 Caddy query rewrite 的静态托管环境仍可读取内容。

## 7. Verification strategy

- Unit：别名注册表、query URL helper、query 到 canonical path 的解析、编码和无效值。
- E2E：总览、五个章节、文章 query、直接粘贴、刷新、ClientRouter、history/back、Header 主题按钮重新绑定、No-JS、Axe、Dark、移动端和无溢出。
- Infra：验证 Caddy 配置，检查 query rewrite 保留地址且未知参数返回真实 404。
- Build：现有 canonical 静态页面、RSS、Sitemap 和 compatibility 页面继续生成，UI HTML 不再产生重复长链接。
