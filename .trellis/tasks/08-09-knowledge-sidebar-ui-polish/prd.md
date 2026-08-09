# Knowledge 侧栏 CC Switch 风格优化

## Goal

把所有 `/knowledge/*` 子页面的左侧导航从“带编号与计数的目录表格”调整为更接近 CC Switch 的产品文档导航：使用搜索图标与快捷键提示、轻量章节图标、固定行高、圆角选中态和清晰分组节奏，同时继续使用 Praxis 的暖纸色、铜色强调、真实内容、静态渲染与无障碍契约。

## Source Evidence

- 用户截图：`research/praxis-sidebar-current.png` 与 `research/ccswitch-sidebar-reference.png`。
- CC Switch 实页：`https://ccswitch.io/zh/docs?section=getting-started`。
- CC Switch 源码测量：左栏 `18rem / 288px`；搜索框约 `43px` 高；一级导航行 `40px` 高；`12px` 圆角；行间距 `4px`；选中背景为主色约 10% 透明度。
- CC Switch 实现使用 React、Tailwind 和 Lucide 图标。本任务只迁移可验证的导航设计规则，不复制其 Logo、品牌名、内容或运行时。

## Requirements

### R1. Scope

- 仅优化共享 `KnowledgeSidebar.astro` 及为其服务的布局、文案、测试和前端规范。
- 影响全部五个知识章节页与两篇现有知识文章页。
- 不改变 URL、canonical、内容 schema、章节顺序、文章归类或正文结构。

### R2. Source-derived Geometry

- 宽屏侧栏目标宽度为 `18rem`，搜索控件保持约 `44px` 高。
- 搜索控件、总览行、章节行和最近文章行使用作用域内 `12px` 圆角，不修改全局编辑型卡片圆角。
- 导航主行目标高度为 `40px`，相邻行使用 `4px` 节奏；选中态使用 Praxis 铜色语义令牌的浅色混合。

### R3. Product-navigation Hierarchy

- 搜索框显示真实搜索图标和 `Ctrl K` 快捷键提示，继续直接筛选当前页面已渲染的章节与文章。
- 知识总览、五个章节和最近文章使用 Lucide 图标；直接链接在右侧显示 Chevron，选中项不依赖颜色以外的唯一信号。
- 桌面不再视觉显示重复的章节编号和全为零的计数；章节编号继续出现在章节页标题区，计数保留为辅助技术可读文本。
- 最近文章使用单行标题与省略显示，完整标题仍保留在真实文本和 `title` 属性中。

### R4. Praxis Adaptation

- 保留 Praxis 的字体、暖纸背景、铜色品牌强调、Light/Dark 主题和顶部导航。
- 不复制 CC Switch Logo、品牌文案、远程字体、内容数据或 React/Tailwind 运行时。
- 图标来源必须是现成图标库，不手绘 SVG、CSS 图形或文本符号。

### R5. Progressive Enhancement and Accessibility

- 所有导航保持真实 `<a>` 链接；无 JavaScript 时仍可见、可键盘操作。
- `Ctrl/Meta + K`、Escape 清空、`aria-live` 筛选结果、原生移动端 `details/summary` 行为保持有效。
- 图标为装饰性；链接可访问名称由真实中文标题和必要的隐藏计数构成。

### R6. Responsive and Theme Quality

- 1536px 与 1920px 宽屏维持三栏且无横向溢出；320px 与项目移动视口维持原生折叠和可读标题。
- Light、Dark、键盘焦点、无 JavaScript、短高度非 sticky 降级继续通过。

## Acceptance Criteria

- [ ] AC1：宽屏侧栏计算宽度约为 `288px`，搜索控件高度 `42-46px`，章节行高度 `38-44px`。
- [ ] AC2：搜索、总览、五章和最近文章都使用图标库图标；源码中没有新增手绘 SVG/CSS 图标。
- [ ] AC3：选中章节使用 `12px` 圆角、浅铜色背景和清晰文字/图标状态；普通行无表格分隔线。
- [ ] AC4：章节编号与可见 `0` 计数从侧栏视觉层消失，真实计数仍可被辅助技术读取。
- [ ] AC5：`Ctrl/Meta + K`、筛选、Escape、当前页 `aria-current`、TOC 和全部真实链接继续工作。
- [ ] AC6：桌面、320px、项目移动视口无页面级横向溢出；移动折叠可由键盘操作。
- [ ] AC7：Light/Dark Axe、Lint、TypeCheck、77 个单元测试、Build 和全量 E2E 通过。
- [ ] AC8：根目录 `design-qa.md` 记录 CC Switch 实页/源码测量、同视口前后对比并以 `final result: passed` 结束。

## Out of Scope

- 不实现 CC Switch 的全局搜索模态框、子章节展开树、React 动画或移动抽屉。
- 不修改 Knowledge 中栏、右侧 TOC、顶部站点导航、正文内容或数据归类。
- 不发布、部署或复制 CC Switch 品牌资产。
