# Knowledge 侧栏 CC Switch 风格优化：技术设计

## 1. Component Boundary

保持 `KnowledgeSidebar.astro` 的 typed props 与真实链接结构不变，仅调整其标记层级和局部样式。`KnowledgeDocsLayout.astro` 把宽屏左轨从 `20rem` 收紧到 CC Switch 源码使用的 `18rem`。路由与内容选择器不变。

## 2. Icon System

新增 `lucide-astro` 作为 `apps/web` 的生产依赖。侧栏使用固定映射：

- 总览：`BookOpenText`
- Agent 应用开发：`Rocket`
- 大模型原理与实现：`BrainCircuit`
- 微调、推理与部署：`ServerCog`
- 实践与案例：`FlaskConical`
- 知识前沿：`Telescope`
- 最近文章：`FileText`
- 搜索与行尾：`Search`、`ChevronRight`

所有图标使用 `aria-hidden="true"`，链接名称继续来自中文标题。

## 3. Markup Changes

- 搜索控件使用 `Search + input + kbd` 三列布局。
- 总览、章节和文章统一为 `.knowledge-sidebar__nav-link` 产品导航行。
- 章节编号不再渲染为可见列；计数进入 `.sr-only`。
- 最近文章类型进入 `.sr-only`，标题单行省略并带 `title`。
- 移动 `summary` 使用 `BookOpenText + label + ChevronDown`，仍为原生折叠。

## 4. Styling Contract

- 局部变量 `--knowledge-nav-radius: 0.75rem`，只作用于文档导航。
- 搜索高度 `2.75rem`，导航主行 `2.5rem`，行间距 `0.25rem`。
- 默认行为 `transparent + muted foreground`；hover 使用 `surface`；current 使用 `brand-tint + brand-strong`。
- 不使用行分隔线、左侧选中竖条、阴影或动画位移。
- Dark 主题完全通过现有语义令牌派生。

## 5. Tests

更新 E2E 锁定 288px 左轨、44px 搜索、40px 导航行、12px 圆角、图标存在、可见数字/计数消失和辅助技术计数保留。继续覆盖筛选、无 JS、320px、Light/Dark Axe、三栏几何与短高度降级。

## 6. Visual QA

在 `1280 x 720` Light 同视口捕获 CC Switch 与 Praxis；补充 Dark 和移动证据。比较搜索、侧栏宽度、行高、圆角、图标、选中态、字体和 Praxis 品牌偏差，修复所有 P0/P1/P2 后更新根目录 `design-qa.md`。
