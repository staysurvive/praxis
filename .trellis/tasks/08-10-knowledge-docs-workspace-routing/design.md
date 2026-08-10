# Knowledge 文档工作台路由与 ClientRouter：技术设计

## 1. Route contract

保留 `getKnowledgeUrl(slug?)` 作为 canonical 路径生成器，使用：

```ts
getKnowledgeContextUrl(path: string, section?: KnowledgeSectionKey): string;
```

为内部导航追加上下文 query。`section` 不参与 Astro 静态路径生成、内容查询、RSS、Sitemap 或 canonical 计算。

顶栏 Knowledge 的入口是：

```text
/knowledge?section=agent-app-development
```

下拉章节和工作台“开始阅读”入口仍指向：

```text
/knowledge/agent-app-development?section=agent-app-development
```

## 2. Current-state semantics

- `/knowledge`：顶栏 Knowledge 使用 `aria-current="page"`。
- `/knowledge/:key`：顶栏 Knowledge 使用 `aria-current="location"`；匹配的章节链接使用 `aria-current="page"`。
- query 不参与 current-state 判断，避免 canonical 和导航状态分叉。

## 3. Overview composition

`knowledge/index.astro` 使用共享 `KnowledgeDocsLayout`，展示搜索、开始阅读、五个章节卡片和真实最近更新。它仍是静态 Astro 页面，不在浏览器重新请求内容。

## 4. ClientRouter lifecycle

`KnowledgeDocsLayout.astro` 提供 `ClientRouter`，内部链接使用 `data-astro-prefetch="hover"`。`knowledge-docs.js` 在首次加载和 `astro:page-load` 时清理并重新绑定搜索、快捷键和 TOC observer。

共享 Header 也会被 ClientRouter 替换或从历史快照恢复，因此 `theme-toggle.js` 使用单一全局委托点击监听器和幂等 `init`：`astro:before-swap` 撤销旧按钮的 ready/动画状态，首次执行和每次 `astro:page-load` 重新查询当前按钮与 theme-color meta、重放已保存的显式主题，并在当前按钮可由委托监听器处理后设置 `data-theme-toggle-ready`。动画锁绑定真实按钮引用，缓存 DOM 上的旧属性不能阻止新点击；脚本被重复执行时只调用已有 `init`，不重复注册全局监听器。

所有链接仍是静态真实 `<a>`；ClientRouter、预取或脚本失败时由浏览器正常导航。

## 5. Verification strategy

- Unit：context URL helper 与 query 编码。
- E2E：顶栏总览入口、章节下拉、current state、ClientRouter、history/back、Header 主题按钮重新绑定、No-JS、Axe、Dark、移动端和无溢出。
- Build：现有 canonical 静态页面、RSS、Sitemap 和 compatibility 页面继续生成。
