# Knowledge 文档工作台路由与 ClientRouter：技术设计

## 1. Route contract

保留 `getKnowledgeUrl(slug?)` 作为 canonical 路径生成器，再增加一个只负责导航上下文的 typed helper：

```ts
getKnowledgeContextUrl(path: string, section?: KnowledgeSectionKey): string;
```

`section` 不参与 Astro 静态路径生成、内容查询或 canonical 计算。顶栏 Knowledge 默认进入第一章 `/knowledge/agent-app-development?section=agent-app-development`；`/knowledge` 继续存在并改为文档入口索引。

## 2. Overview composition

将 `knowledge/index.astro` 从 EditorialHero + 两栏卡片改为文档工作台：搜索入口、“开始阅读”主入口、五个章节的图标化入口和真实最近更新。页面继续使用现有 Praxis token、字体、图标和内容查询，不复制 CC Switch 品牌资产。

## 3. ClientRouter lifecycle

在 `KnowledgeDocsLayout.astro` 引入 `ClientRouter`，并对内部知识链接添加 `data-astro-prefetch="hover"`。`public/scripts/knowledge-docs.js` 提供可清理、可重复调用的初始化函数，并在初次执行和 `astro:page-load` 时绑定搜索、快捷键、TOC 与 IntersectionObserver。

ClientRouter 只作为 progressive enhancement。所有导航仍是静态真实链接；脚本或预取失败时由浏览器完成正常页面导航。

## 4. Accessibility and metadata

- `aria-current` 仍由静态页面按 pathname 决定。
- canonicalPath 始终使用无查询参数的稳定路径。
- 查询参数不改变正文、schema、RSS 或 Sitemap。
- 页面切换后由 Astro 的路由生命周期管理标题与焦点，不隐藏焦点环。

## 5. Verification strategy

- Unit：上下文 URL helper 与 query 编码。
- E2E：顶栏默认入口、section query、预取属性、ClientRouter 页面切换、历史返回、No-JS、Axe、Dark、移动端和横向溢出。
- Build：所有现有 canonical 静态页面继续生成。
