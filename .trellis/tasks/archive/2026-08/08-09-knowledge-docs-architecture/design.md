# 知识中心文档架构重构：技术设计

## 1. Architecture

保留 `apps/web/src/pages/knowledge/[key].astro` 作为唯一数据装配与路由分派层，在它之下增加共享知识文档壳层。路由负责查询内容、解析 section/content 分支、生成 TOC 数据与 SEO 属性；组件只接收类型化数据并负责展示。

```text
knowledge/[key].astro
  ├─ section slug → section metadata + section entries
  └─ content slug → rendered Content + headings + summary
          │
          ▼
KnowledgeDocsLayout.astro
  ├─ KnowledgeSidebar.astro
  ├─ center slot
  │    ├─ KnowledgeSectionView.astro
  │    └─ KnowledgeArticleView.astro
  └─ KnowledgeTableOfContents.astro
```

`/knowledge` 总览继续使用 `EditorialHero`、`KnowledgeSectionCard` 与最近更新列表，不进入文档壳层。

## 2. Data Ownership and Contracts

### 2.1 Section registry

扩展 `knowledgeSections` 的单一注册表，为每章增加用于信息架构的稳定字段：

- `number`：两位章节编号，仅用于显示。
- `description`：当前导航短描述，继续给顶部下拉与侧栏使用。
- `introduction`：章节页“本章定位”的一段说明。
- `topics`：只描述该章节覆盖范围的短列表，不代表已发布文章。

名称、slug、key 与顺序保持不变。schema 的 `KnowledgeSectionKey` 仍由注册表推导，内容归类合同不变。

### 2.2 Route view model

`knowledge/[key].astro` 一次性装配：

- 五章真实内容数量 `sectionCounts`；
- `recentEntries`，供侧栏最近更新与筛选使用；
- 当前 section 或 content；
- 文章 render 结果中的 `headings`，过滤到 depth 2/3 后转换为 `KnowledgeTocItem[]`；
- section 页的固定锚点 TOC；
- 文章 SEO 元数据或 section website 元数据。

组件不调用 `getCollection()`，也不解析 frontmatter。

### 2.3 Shared types

`KnowledgeTocItem` 与侧栏需要的最小 view model 放在知识组件相邻的类型模块或由组件导出；避免把 Astro render 对象直接穿透到展示组件。所有 URL 都继续消费 `ContentSummary.url` 与 `getKnowledgeUrl()`。

## 3. Component Boundaries

### `KnowledgeDocsLayout.astro`

- 包装 `BaseLayout` 并透传 title、description、canonical、article dates/tags 等 SEO 属性。
- 渲染三栏 CSS Grid、跳转锚点与中心 slot。
- 在桌面设置侧栏粘滞边界；在窄屏调整顺序与折叠呈现。
- 不查询内容，不判断路由种类。

### `KnowledgeSidebar.astro`

- 渲染总览、五章、数量和最近更新。
- 使用真实链接与原生 `details/summary` 作为移动折叠基线。
- 当前 route 用 `aria-current="page"`；文章关联多章时不伪造唯一父级。
- 搜索输入通过 data attributes 交给外部脚本增强，静态 HTML 默认完整可见。

### `KnowledgeTableOfContents.astro`

- 输入已规范化的 `KnowledgeTocItem[]`。
- 渲染二级/三级缩进与真实 hash 链接。
- 桌面是 sticky rail，窄屏是原生折叠目录。
- 无标题文章显示简洁说明，不生成空锚点。

### `KnowledgeSectionView.astro`

- 渲染章节 folio、H1、描述、本章定位、主题范围、真实内容列表/空状态、上一章/下一章。
- 复用 `ContentCard` 与 `EmptyState`，不新增假内容卡片。

### `KnowledgeArticleView.astro`

- 复用 `ContentMeta`、`JourneyPanel`、`PracticeTimeline`、`.article-prose` 和日期格式化逻辑。
- 将旧 `ContentLayout` 的知识文章展示职责迁入文档壳层，但不修改 `ContentLayout`，避免项目详情回归。
- 页面级 H1、摘要与正文锚点在中心列内形成连续阅读流。

## 4. Progressive Enhancement

新增 CSP 兼容的 `apps/web/public/scripts/knowledge-docs.js`：

1. 监听 `Ctrl/⌘ + K`，聚焦并全选知识筛选输入。
2. 规范化查询文本，按章节/文章标签与描述过滤侧栏项目。
3. 更新 `aria-live` 结果文本；空查询恢复全部项目。
4. 使用 `IntersectionObserver` 对存在于页面中的 TOC 锚点做滚动位置增强，只更新视觉状态，不改变链接或内容可达性。
5. reduced-motion 不影响行为；脚本加载失败时保留完整静态导航。

不增加 hydrated framework island、全局 store 或网络请求。

## 5. Styling and Responsive Rules

- 使用现有 `--color-*`、`--font-*`、`--text-*`、`--radius-*`、`--header-height` 与 `--page-max` 语义令牌。
- 桌面文档容器允许比文章正文更宽，但正文 measure 仍保持中文长文舒适宽度。
- 侧栏视觉以细线、暖色 surface tint、衬线章节标题和品牌强调色为主；不复制 CC Switch 的 Logo、品牌橙或大圆角卡片。
- 建议断点：
  - `>= 80rem`：三栏；
  - `64rem–79.99rem`：左栏 + 主内容，页内目录移动到主内容顶部；
  - `< 64rem`：单栏，章节导航与页内目录使用折叠结构，取消 sticky。
- Grid 所有内容轨道使用 `minmax(0, …)`，可滚动内容只在局部容器处理，禁止页面级 `overflow-x: hidden` 掩盖缺陷。
- 使用细微颜色/下划线状态，不增加不必要动效；所有 focus-visible 状态在两主题都清晰。

## 6. Compatibility

- 五个 section slug、所有 article slug、canonical、RSS GUID、Sitemap 和五个 legacy mapping 不变。
- `ContentLayout.astro` 继续服务项目详情；知识文章改用新的知识专用布局。
- `PageHero.astro` 继续服务其他安静页面，但不再用于知识 section 子路由；同步更新 Trellis 前端规范与相关回归测试。
- 无 JavaScript、静态导出与 CSP 无内联脚本/样式合同保持不变。

## 7. Testing Strategy

- Unit：注册表稳定 key/slug/order；新增 section 文档元数据完整、编号唯一、topics 非空。
- E2E desktop：所有知识子路由共享壳层；三栏几何、sticky offset、TOC/hash、current state、搜索快捷键与筛选状态。
- E2E mobile/320px：折叠导航、键盘操作、无文档级横向滚动。
- E2E no-JS：五章链接、文章链接、正文、空状态与 hash 目录可用。
- E2E accessibility：Light/Dark Axe、单 H1、landmark、焦点顺序、reduced motion。
- Regression：`/knowledge` 总览与顶部知识菜单保持原有公开合同；项目详情仍使用通用 ContentLayout。
- Visual QA：用 1920×1021 的 CC Switch 参考截图对照同视口 Praxis 实现，并补充桌面 Dark 与移动截图；迭代修复 P0/P1/P2 后将根 `design-qa.md` 标记为 passed。

## 8. Rollback

改造集中在新的知识组件、一个外部脚本与 `[key].astro` 分派。若验证失败，可恢复旧 `[key].astro` 分支并删除新组件/脚本；`knowledgeSections` 新字段对旧消费者是向后兼容的。不会迁移内容或修改 URL，因此不需要数据回滚。

## 9. Visual Refinement Pass

- 将宽屏文档容器上限从偏居中的阅读壳层扩展到约 `108rem`，以 20rem 左栏、可收缩的约 60rem 主栏和约 18rem 目录栏建立接近参考图的比例；中等断点继续允许主栏收缩。
- 桌面左栏把章节描述从默认视觉层级移入筛选数据和窄屏展开态，章节行只保留编号、标题和真实计数，避免 `00` 被误读为符号。
- 搜索输入保留真实 label，但桌面视觉只呈现输入本身；当前项使用暖色 surface 与细品牌色导轨，不引入参考站图标或大圆角。
- 章节页与文章页减少 header 顶部空白和 block 间距，使标题、搜索与目录更早进入首屏；长文 measure 和 Praxis 衬线显示字体保持不变。
- 当导航内容能在目标视口内完整容纳时，取消桌面侧栏和目录的内部滚动容器，统一由文档滚动承担阅读进度。
- 视觉 QA 使用最新用户截图 `research/ccswitch-docs-refinement-reference.png`，重新捕获 Light/Dark、章节/文章和 390px 移动状态。
