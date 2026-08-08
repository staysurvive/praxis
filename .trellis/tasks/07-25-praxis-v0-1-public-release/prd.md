# Praxis v0.1 public release

## Goal

把已经可运行的 Praxis 静态站点推进到“可以公开分享、但尚未擅自部署”的 v0.1 发布候选状态。首页、内容阅读、
Practice Heatmap、主题与移动端体验必须经过审计并保持完整；补齐基础 SEO、RSS、Sitemap、robots、真实项目进展
和一份可追踪的上线 Checklist。只有 Checklist 的部署前项目全部通过后，才允许接入用户现有服务器。

在已完成的发布候选基础上，v0.1 还要建立长期可扩展的网站结构：冻结现有首页主体，将公开信息架构收敛为“知识、
项目、旅程、关于”，以五个固定入口组织知识，并为作者以后自行添加 Markdown 内容提供稳定容器。此次范围补充只定义
站点结构、内容归属和验收边界，不授权代写文章、生成示例内容、实现 AI，或在本轮擅自部署生产环境。

## Background and confirmed facts

- `apps/web` 已实现 Astro 7 + TypeScript + Markdown 静态站点，生产内容只来自根目录 `content/`。
- 首页主体由 Hero、Philosophy、Praxis Practice Heatmap 与 Latest Content 组成；热力图只读取本地构建数据，
  Latest Content 和项目入口继续从真实 Markdown 自动读取（`apps/web/src/pages/index.astro:12`）。
- 当前已有三项真实公开内容：Praxis 项目、安全审查笔记和质量门禁复盘日志；站点不使用虚构文章填充栏目。
- 自定义 404、Light/Dark、移动端 Playwright 项目、无 JavaScript 阅读和 Axe 检查已经存在，应审计和扩展而非重写。
- `BaseLayout.astro` 已集中提供 title、description、canonical、Open Graph、Twitter card、文章级时间/标签元数据、
  RSS discovery 与 noindex 能力。
- `/rss.xml`、Sitemap、`robots.txt` 和长期保存的 v0.1 上线 Checklist 已落地并通过本地发布候选验证。
- `SITE_URL` 是构建期站点来源；缺省值仍为 `https://praxis.example`，正式部署必须显式传入真实域名。
- `content/projects/praxis.md` 与 `homeContent.now` 配置已准确记录发布候选完成、正式域名和生产接入仍待确认的真实进展。
- 当前全站导航由 `blog`、`note`、`journal`、`project` 四种内容类型自动生成，而不是独立的信息架构
  （`apps/web/src/config/site.ts:20`、`apps/web/src/lib/content/domain.ts:1`）。
- 当前公开列表和详情使用 type-first 路由；内容详情已经支持 Markdown 正文、稳定 `contentId`、Journey 与
  Practice Log（`apps/web/src/pages/[type]/[slug].astro:21`、`apps/web/src/lib/content/schema.ts:48`）。
- 当前项目体验由 `/projects` 列表和 `/projects/praxis-foundation` 详情组成；首页项目入口、RSS、Sitemap 与 canonical
  均引用现有详情 URL，结构调整必须显式处理兼容性。
- 当前 `journey` 是每项内容可选的结构化字段并显示在内容详情内，不是独立页面；新的“旅程”单页也不是现有
  `/journal` 栏目的改名。
- 用户确认网站只提供结构和内容容器；正式文章、项目叙事与成长记录均由用户本人后续编写和维护。

## Requirements

R1–R7 记录已经完成或持续生效的 v0.1 发布基线；R8–R14 是当前信息架构扩展。若两组要求对类型列表、canonical 或
Sitemap 路由清单的描述不同，以 R8–R14 的迁移后目标为准，同时不得降低 R1–R7 的元数据、静态构建与回归质量。

### R1 — Existing public experience audit

- 保留原创编辑型首页及其信息架构，不把三个理念阶段改成导航栏目。
- Practice Heatmap 继续只统计 `publishedAt` 与显式 `practiceLog`，不得增加 GitHub 或外部 API 依赖。
- 首页、历史类型列表、项目详情、404 在原发布基线中具备完整 Light/Dark、桌面与移动体验；迁移后 legacy 类型列表按 R13
  变为兼容跳转页，新主页面继续满足同等质量要求。
- 核心正文和导航在关闭 JavaScript 后仍可使用。

### R2 — Share and search metadata

- 所有公开页面输出稳定的 title、description、canonical、Open Graph 和 Twitter card 元数据。
- 内容详情页输出文章级 `og:type`、发布时间、更新时间和标签；其他页面保持网站级语义。
- 布局输出 RSS autodiscovery 链接。
- 404 页面输出 `noindex, nofollow`，不得进入搜索结果或 Sitemap。
- 元数据通过类型化布局契约和集中配置提供，不在各页面复制原始 `<meta>` 逻辑。

### R3 — RSS

- 提供构建期生成的 `/rss.xml`，只收录非 draft 的真实内容。
- 每项至少包含标题、摘要、首次发布日期、规范 URL 和内容类型/标签分类。
- v0.1 使用摘要型 feed，不在 feed 层重复渲染完整 Markdown；正文仍以站内规范 URL 为事实来源。
- Feed 不依赖 FastAPI、数据库、外部 API 或客户端 JavaScript。

### R4 — Sitemap and robots

- 使用与 Astro 7 兼容的官方 Sitemap 集成生成站点地图。
- 历史发布基线的 Sitemap 包含首页、四个类型列表和公开内容详情；信息架构迁移后的最终清单由 R13 取代，仍排除 404
  与生成的 Practice JSON 端点。
- 提供 `/robots.txt`，允许公开抓取并指向由 `Astro.site` 计算出的 Sitemap URL。
- 构建必须在显式 `SITE_URL` 下生成正确的绝对 URL；占位域名只允许用于本地开发和测试。

### R5 — First real project content

- 保持 `contentId: praxis-project-0001` 和永久 URL 不变。
- 更新 `homeContent.now` 与 Praxis 项目正文，使其准确反映 foundation 已完成、v0.1 正在进入公开发布准备。
- 在 `journey` 中补充已经发生的 `outcome`、`reflection` 与下一步，并仅为真实完成的工作增加显式
  `practiceLog` 事件。
- 正式部署成功前不把“已公开上线”写成既成事实；部署里程碑在实际发生后再记录。

### R6 — Versioned release checklist

- 新增仓库内长期保存的 `docs/releases/v0.1-checklist.md`。
- Checklist 分为产品与内容、SEO/发现性、质量与兼容性、构建产物、生产部署、上线后检查。
- 每一项必须能由命令、浏览器检查或实际生产结果证明，不得用模糊的“看起来没问题”作为完成标准。
- 生产域名、服务器 Caddy/Compose 集成、HTTPS 和线上 smoke 在实际部署前保持未勾选。

### R7 — Verification and regression coverage

- 自动化验证 RSS XML、Sitemap、robots、canonical、文章元数据、RSS discovery 和 404 noindex。
- 保留并通过现有 schema、实践事件、路由、主题、移动端、Axe 与 no-JS 测试。
- 根级 `check`、静态 `build` 和 Playwright E2E 全部通过；构建产物中存在预期 XML/TXT/HTML 页面。
- Docker 静态构建边界继续可用，不引入第二代理层或运行时 Web 后端。

### R8 — Public information architecture

- 品牌标识继续返回首页；一级公开导航收敛为“知识、项目、旅程、关于”，不再把“博客、笔记、日志”作为并列的
  一级栏目。
- 站点导航必须与底层内容类型注册表解耦；新增“知识、旅程、关于”等站点入口不得被误建模为新的文章类型。
- 不设置独立的“学习路径”一级栏目。推荐学习顺序以后作为知识领域内部的编排能力出现，不成为新的内容仓库。
- 五个知识入口除在“知识”页面内展示外，也由共享页眉提供：可见的“知识”文字必须直接链接知识总览；其右侧相邻的独立箭头
  使用原生披露控件呈现五个 section，不重复提供“知识总览”菜单项。桌面端支持悬浮展开，键盘与触屏支持显式展开，不增加
  三级技术目录。JavaScript 只允许增强桌面悬浮、外部关闭与 Escape 行为；关闭 JavaScript 后，文字链接与原生披露控件
  仍分别可用。
- 首页主体保持冻结。全站共用页眉可以同步新的栏目名称和链接，但不得借此改动首页 Hero、Philosophy、
  Practice Heatmap、Latest Content、视觉资产、文案或动效。现有内容卡片只允许跟随同一内容的新 canonical 目的地，
  不改变首页的可见内容、版式与交互层级。
- 搜索与未来的 Ask Praxis 只保留为长期结构方向；v0.1 不要求提供可用的全文搜索、语义搜索或 AI 问答入口。

### R9 — Knowledge structure

- 提供统一的“知识”总览，固定展示以下五个入口，名称与顺序保持一致：
  1. Agent 应用开发
  2. 大模型原理与实现
  3. 微调、推理与部署
  4. 实践与案例
  5. 知识前沿
- 五个入口由一个集中、固定顺序的 section 注册表提供。本轮不预设“主领域 / 视图”等额外 taxonomy 语义；
  同一篇知识可以由作者显式加入一个或多个入口，但正文与 canonical 始终只有一份。
- 为后续作者 Markdown 归类只增加一个最小、可选、去重的 `knowledgeSections` 多选字段。现有内容无需迁移；
  项目内容不能使用该字段。本轮不增加历史 ID allowlist、不因内容未分类而让构建失败，也不建立内容形式或成熟度模型。
- section 归属只读取作者显式填写的字段，不根据标题、标签、目录、legacy 内容类型、正文关键词或项目关系推断。
- 五个入口是结构容器，不要求本轮预填子主题、学习路径、文章目录或演示数据。没有作者内容时展示真实、克制的空状态。
- “知识”总览除五个入口外，必须提供“最近更新”视图，收录现有非项目公开内容，保证尚未分类的历史内容仍可发现；
  该视图不是第六个知识入口，也不替作者自动分类。
- 每个入口卡片至少说明名称、结构性定位、真实内容数量或空状态，并提供唯一、清晰的进入操作；空页面必须提供返回
  “知识”总览或继续浏览真实内容的出口。
- Note、Guide、Thinking、Review、Case 等不成为一级导航、独立内容仓库或永久 URL 前提；只有在真实写作形成稳定需求后，
  才评估是否需要新的正交字段。

### R10 — Author-owned content and reading shell

- 网站负责提供可持续添加内容的结构、Markdown 阅读能力和必要元数据；文章选题、标题、摘要、正文、观点、项目案例与
  Journey 叙事均由用户本人创建和确认。
- 不得为了填满页面而生成虚构文章、项目、Journey 节点、技术结论、学习路线或看似真实的示例数据。
- 允许新增必要的界面标签、栏目说明和空状态文案，但这些文案不得替用户表达技术观点或伪造学习经历。
- 已有真实内容保持作者原意；结构调整不自动改写、扩写、合并或重新解释现有 Markdown 正文。
- 当前信息架构实现对 `content/**/*.md` 保持零改动；现有三项真实内容是唯一生产内容事实源。
- 内容展示结构必须允许作者以后仅通过新增或更新 Markdown 内容完成发布，而无需重新设计站点导航和页面骨架。
- 本轮不重构现有 `type`、`stage`、`status` 或发布工作流；作者体验的进一步简化应在第一批新知识内容形成后，
  依据真实写作负担单独设计。

### R11 — Single-page projects experience

- `/projects` 是本阶段唯一的项目主体验，不增加项目子导航。每个项目在该页拥有稳定 slug 锚点，并使用现有字段展示标题、
  状态、摘要与标签；以后新增项目的 Markdown 正文默认直接在此单页呈现，不自动生成新的详情页。
- 现有 `/projects/praxis-foundation` 作为历史兼容详情原样保留；对应项目区块继续链接到它。本轮不修改详情的 breadcrumb、
  返回行为、canonical 或正文，也不让其他项目继承该兼容例外。
- 本轮不新增问题、角色、结果、证据、仓库、Demo、Star 或 `detailPage` schema。未来只有在作者提供真实信息后才增加可选字段与操作；
  不显示空壳模块，也不伪装成已授权的站内 GitHub Star 操作。
- “项目”长期回答“做了什么、解决了什么、结果是什么”；“实践与案例”长期回答“项目验证了什么、哪些经验可以迁移”。
  本轮只记录这项产品边界，不实现跨内容关系系统或复制正文。
- 已有稳定项目 `contentId`、公开 URL、首页入口和外部链接不得被删除或静默破坏。

### R12 — Single-page journey and about experiences

- “旅程”在本阶段只提供一个主要单页体验，不增加年份、里程碑或主题子页面。
- 新的“旅程”是跨知识与项目的站点级视图，不是把现有“日志”栏目改名，也不要求删除内容详情中已有的 Journey 信息。
- 当前没有作者明确选入 Journey 的独立成长节点，因此首版只提供真实空状态与“浏览知识”“查看项目”两个退出路径；
  不从提交、Practice Log、发布时间、更新时间或现有正文自动生成时间线。
- 本轮不设计 Journey 事件 schema、飞轮阶段、排序规则或时间轴投影。出现第一条由作者确认的真实成长节点后，
  再根据真实叙事方式设计数据契约，避免现在为不存在的数据冻结模型。
- `/about` 同样只提供一个静态单页，并只使用已经确认的站点名称与作者简介；不新增内容类型，也不补写个人经历、身份、
  联系方式或未来计划。

### R13 — Long-term compatibility boundaries

- 知识领域、内容形式、发布状态和成熟度是不同维度；当前结构不得再次把它们压缩为同一个栏目或 URL 类型。
- 所有非项目知识正文统一以 `/knowledge/:slug` 作为 canonical；type-first 详情模式不再继续生成新的正文。当前三个旧聚合地址
  `/blog`、`/notes`、`/journal` 与两个真实旧详情地址
  `/notes/ai-code-security-review`、`/journal/what-green-gates-miss` 必须精确到达新地址；本轮不建设通用 alias 平台。
- 当前无 adapter 的静态发布候选使用带 `noindex`、canonical 与即时跳转的 HTML compatibility page；正式生产接入时再由
  用户现有 Caddy 提供 HTTP 301。真正的 origin-level 永久状态属于既有外部部署门禁，不能在本地验证后提前标记完成。
- 现有项目身份与 `/projects/praxis-foundation` 详情保持现状；`/projects` 只按 R11 调整为单页项目容器。知识 section slug 与
  知识文章 slug 共享命名空间时必须在构建期阻止冲突。
- 内容继续保持稳定 `contentId`；公开后的 slug 视为稳定外部身份。通用改名/alias 工作流在真实改名需求出现后再设计。
- 新 canonical 进入 RSS、Sitemap 和站内链接；兼容重定向不进入 Sitemap。RSS 使用稳定 `contentId` 作为条目标识，
  避免路径迁移被误识别为新文章。
- 公开内容继续遵守静态优先、无 JavaScript 可阅读、Light/Dark、移动端和可访问性要求。

### R14 — Deferred evolution contract

- “知识 → 理解 → 实践 → 反思 → 新知识”仍是 Praxis 的长期产品飞轮，但本轮只通过稳定内容身份、知识 section、
  项目单页与 Journey 页面边界为它预留位置，不实现关系字段、反向投影或可视化图谱。
- 学习路径以后属于知识 section 内的作者编排能力；AI 以后消费同一内容、身份与关系事实源，不新建与知识库平行的 AI 内容仓库。
- 类型化关系、Journey 节点、项目证据模型、搜索、RAG、Learning Companion 与作者工作流重构，都必须由真实内容或真实使用需求
  触发独立设计和验收，不能作为本轮页面骨架的隐藏前置工程。

### R15 — Root-page exhibition visual layer (2026-08-05)

- 仅为 `/knowledge`、`/projects`、`/journey`、`/about` 四个一级根页面建立沉浸式首屏；首页与五个知识 section、
  知识正文、项目详情及其内容区保持原样。
- 四页各使用一张本地、无文字、无 Logo 的原创艺术背景，以“认知、创造、成长、Praxis 精神”形成不同叙事；图像只作装饰，
  不承载文字或页面语义。
- 新首屏保持唯一 H1、真实副标题与静态 HTML 可读性，桌面采用页眉以下完整视窗高度；移动端将文字和图像自然分层，不能压缩
  标题可读性或制造横向溢出。
- 视觉只能复用现有语义色彩、排版和动效 token；可使用克制的 CSS 入场动效，但不新增运行时依赖、浏览器脚本、外部资源、
  内联样式或必须依赖 JavaScript 的效果。`prefers-reduced-motion`、`prefers-reduced-transparency` 与强制颜色模式必须保留清晰降级。
- 共用 `PageHero` 是知识内部 section 的阅读壳，不得改造为图像首屏；一级页专用 Hero 必须与它隔离。

## Acceptance criteria

- [x] AC1：首页、Practice Heatmap、项目详情和 404 在桌面/移动端及 Light/Dark 下通过现有与新增 E2E 审计。
- [x] AC2：所有公开页面具有 canonical、Open Graph、Twitter card 与 RSS discovery；项目详情具有文章级时间和标签元数据。
- [x] AC3：404 返回品牌页面、HTTP 404，并输出 `noindex, nofollow`，且不进入 Sitemap。
- [x] AC4：`/rss.xml` 构建成功，只包含真实非草稿内容并使用规范绝对 URL。
- [x] AC5：历史 Sitemap 覆盖首页、类型列表和真实内容，排除 404 与生成 JSON；`/robots.txt` 指向 Sitemap。迁移后的
      Sitemap 验收转由 AC15–AC16 管理。
- [x] AC6：Praxis 项目和 `homeContent.now` 准确记录真实进展，`contentId`/URL 不变，没有虚构内容或虚假部署事件。
- [x] AC7：`docs/releases/v0.1-checklist.md` 存在，部署前条目以验证证据勾选，生产部署条目保持待办直至真实完成。
- [ ] AC8：`npm run check`、`npm run build`、`npm run test:e2e` 已通过；Docker build 待 Docker daemon 可用时补验。
- [x] AC9：站点仍为静态优先；无需 FastAPI、数据库、登录、评论、统计或 AI 服务即可构建和阅读。
- [x] AC10：首页 Hero、Philosophy、Practice Heatmap、Latest Content、现有文案、视觉资产和交互层级没有因结构调整而改变；
      只有全站共用页眉和指向同一内容的新 canonical href 允许同步更新。
- [x] AC11：一级导航提供“知识、项目、旅程、关于”，不提供独立“学习路径”，也不再把“博客、笔记、日志”作为
      一级栏目；品牌标识仍可返回首页。可见的“知识”文字直接链接知识总览，右侧独立箭头提供仅含五个固定 section 的披露菜单；
      其余三个一级入口仍是无子导航的直接链接。
- [x] AC12：“知识”总览按既定顺序展示五个入口：Agent 应用开发、大模型原理与实现、微调、推理与部署、实践与案例、
      知识前沿；入口卡显示真实数量/空状态，另有不构成第六入口的“最近更新”，且不含虚构文章或示例技术内容。
- [x] AC13：作者后续可以通过可选 `knowledgeSections` 多选字段把真实 Markdown 放入一个或多个知识入口；本轮
      `content/**/*.md` 零改动，也没有代写、扩写或自动生成文章、项目案例和成长记录。
- [x] AC14：“项目”和“旅程”均只有一个一级主入口且不新增子导航；项目单页具有稳定项目锚点，未来项目 Markdown 默认在
      单页内呈现，现有唯一详情的行为、稳定链接和 `contentId` 未被破坏；Journey 真实显示空状态，About 只使用已确认信息。
- [x] AC15：现有三项真实内容、首页项目入口、RSS 与 Sitemap 在新信息架构下仍可解析；旧知识详情与旧聚合地址在静态
      候选中提供 noindex/canonical HTML 跳转且不进入 Sitemap，生产 Caddy HTTP 301 继续留在外部部署门禁。
- [x] AC16：非项目知识 canonical 统一为 `/knowledge/:slug`；当前五个精确 legacy 地址均到达正确目标，RSS 使用新 canonical
      和稳定 `contentId`，知识 section slug 与文章 slug 冲突会在构建期失败。
- [x] AC17：任一公开非项目内容至少能从 `/knowledge` 的“最近更新”抵达；作者显式填写 `knowledgeSections` 后还能从所有对应 section 抵达。
      详情页提供清晰的知识上下文，页眉正确表达当前处于“知识”。
- [x] AC18：本轮没有新增类型化关系、Journey 事件、项目证据模型、通用 alias 系统、AI/Search/CMS，且没有任何生产 fixture
      或示例内容进入 `content/`、RSS、Sitemap 或构建产物。
- [x] AC19：新增结构在桌面/移动端、Light/Dark、键盘导航、Axe 与无 JavaScript 阅读下可用，并继续保持纯静态构建边界；
      知识菜单在桌面悬浮、键盘展开、触屏点击和无 JavaScript 点击四种路径下都可进入真实 section。
- [x] AC20：320px 与无 JavaScript 环境均可完成当前真实数据支持的“知识 → 空 section → 知识”、
      “知识 → 最近更新 → 详情 → 知识”和“项目 → 项目锚点 → 现有详情 → 项目”往返；sticky 页眉不遮挡 H1、breadcrumb 或项目锚点。
- [x] AC21：四个一级根页面各有独立的本地艺术首屏，且在桌面/移动端、Light/Dark、减少动态偏好、Axe 与无 JavaScript 下保持可读；
      首页与知识内部页面未被该视觉层改动。

## Out of scope

- FastAPI、PostgreSQL、评论、登录、阅读统计、AI 助手和任何动态 API。
- 完整 i18n、多语言路由、翻译工作流或双语 SEO。
- 全文搜索、Newsletter、Web Analytics、CMS、GitHub Contributions 或外部活动数据。
- 独立“学习路径”栏目、新增项目详情页、Journey 子页面、全局知识图谱可视化和 AI Chat 页面；现有项目详情仅作为兼容例外。
- 项目、旅程或关于的子菜单，以及在页眉中继续展开到 OpenAI SDK、RAG、LangChain 等三级技术目录。
- 为五个知识入口预填完整子主题树、学习路径、文章目录或技术教程；这些内容随用户真实写作逐步生长。
- Note/Guide/Thinking/Review/Case 筛选 UI，以及尚未被真实内容验证的内容形式或成熟度 taxonomy。
- 代写、改写、扩写或发布新的文章正文、项目案例、Journey 叙事，以及任何虚构的 blog、note、journal 或 project 内容。
- 首页主体内容、视觉资产、区块顺序、文案或动效重设计；仅全站共用页眉可以同步信息架构。
- 把一级页专用展厅 Hero 泛化到首页、知识 section、知识正文或项目详情；这些页面继续使用原有阅读/首页壳。
- 类型化内容关系、反向关系投影、Journey 事件 schema、项目证据/角色/成果/仓库/Demo/Star schema、通用 alias 管理平台。
- 对现有 `type`、`stage`、`status`、draft 发布规则或作者写作工作流做系统性重构。
- 自动关系建议、猜你喜欢、关系图可视化、AI 生成分类或将私人草稿自动加入公开知识投影。
- Kubernetes、Swarm、Turborepo、Nx、第二套反向代理或 HTTPS 方案。
- 未获得生产域名和服务器配置边界前，擅自修改或部署用户服务器。

## External release gate

本任务先完成可公开分享的代码与内容发布候选。正式部署仍需要真实域名以及用户现有 Docker Compose/Caddy
集成位置；缺少这些外部信息不阻止本地实现与部署前验收，但生产 HTTP 301 mapping、部署和上线后检查不得被提前标记完成。
