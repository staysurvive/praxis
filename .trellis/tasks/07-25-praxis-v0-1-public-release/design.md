# Praxis v0.1 public release — technical design

## Scope and invariants

本任务先在既有静态架构上完成“可发现、可分享、可验证”的发布层；2026-08-04 信息架构扩展继续保留统一 collection、
Markdown 单一事实源与 Practice Heatmap 事件语义，但会把非项目正文从 type-first canonical 收敛到 `/knowledge/:slug`，
为旧地址生成静态 compatibility page，并在未来生产 Caddy 接入时提供 HTTP 永久重定向。所有新增页面继续由 Astro
在构建期生成，FastAPI 与 PostgreSQL 保持不存在。

## Existing experience audit boundary

首页、热力图、详情页、404、主题和响应式组件已经实现。本轮以自动化与浏览器验证为主，只在发现明确缺陷时修改。
这避免为了里程碑重写已经满足产品要求的视觉结构。

## SEO layout contract

`BaseLayout.astro` 继续作为普通渲染页面唯一的文档级 metadata owner，并复用现有类型化 props；Astro 生成的静态
compatibility page 是受控例外，不为其复制一套 BaseLayout 页面：

```typescript
interface Props {
  title: string;
  description?: string;
  canonicalPath?: string;
  seoType?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  tags?: readonly string[];
  noindex?: boolean;
}
```

- `canonicalPath` 与 `Astro.site` 组合为绝对 URL。
- 所有页面共享 Open Graph、Twitter summary card 和 RSS autodiscovery。
- 仅 `seoType === 'article'` 时输出 `article:published_time`、`article:modified_time` 与重复的 `article:tag`。
- 知识 section 沿用默认可索引行为；404 与静态 compatibility page 使用既有 `noindex` 能力。本轮不把布尔契约升级为 robots 状态机。
- 详情路由从已有 `ContentSummary` 传入字段，不重新解析 frontmatter。

v0.1 不引入动态 OG 图片生成服务。社交元数据先保证标题、摘要、规范 URL 和类型正确；品牌图片可在取得最终个人
视觉资产后作为独立增强任务加入，避免发布占位图。

## RSS data flow

```text
content/**/*.md
    -> Astro content collection validation
    -> listEntries() (filters drafts, shared ordering)
    -> src/pages/rss.xml.ts
    -> @astrojs/rss
    -> dist/rss.xml
```

RSS 只使用共享内容摘要，输出 canonical link、summary、publishedAt、type/tag categories。它不渲染完整 Markdown，避免引入
feed 专用内容管线或重复正文事实源。Feed URL 和每项 URL 都从 `Astro.site` 计算。

## Sitemap and robots

- `@astrojs/sitemap` 注册在 `astro.config.mjs`，使用 filter 排除 `/404` 与 `/generated/`。
- 静态路由与动态内容路由由构建 manifest 自动进入 Sitemap。
- `src/pages/robots.txt.ts` 返回纯文本；Sitemap 行通过 `new URL('sitemap-index.xml', Astro.site)` 生成。
- 测试构建默认使用 `https://praxis.example`；也可通过 `$env:SITE_URL` 覆盖，生产构建必须使用真实非本地 HTTPS origin。

## Historical content and practice record update (completed baseline)

以下内容记录早期 v0.1 发布基线已经完成的工作，不是 2026-08-04 信息架构扩展的待执行指令。`content/projects/praxis.md` 保持现有 stable ID、slug 与 `type`；当时更新内容遵守了以下规则：

- `updatedAt` 改为实际编辑日期，但不因此生成实践事件。
- 新增的 `practiceLog` 只描述已完成的 foundation 实现/验证与 v0.1 发布准备启动。
- `journey.outcome` 记录已通过验证的静态基础，`reflection` 记录架构先行与真实使用之间的认识，`nextStep` 指向发布清单和部署。
- 正式部署成功前保持 `status: ongoing`，不写入上线 milestone。

## Release checklist ownership

`docs/releases/v0.1-checklist.md` 是人类可读的发布门禁。Trellis `implement.md` 管理本次开发执行步骤；二者职责不同：

- `implement.md`：开发顺序、命令、风险和回滚点。
- release checklist：产品、内容、SEO、产物、生产部署和上线后验证的长期证据。

部署前可自动验证的条目在本轮通过后勾选；需要生产域名/服务器的条目保持未勾选。

## Test strategy

### Browser/E2E

- 首页与详情页 metadata、RSS discovery。
- 详情页 article metadata。
- 404 HTTP 状态与 robots noindex。
- `/rss.xml`、Sitemap 与 `/robots.txt` 的响应和关键绝对 URL。
- 继续运行桌面 Chromium 与 Pixel 7 项目，保留 Axe、主题和 no-JS 用例。

### Build artifact

- 检查 `dist/index.html`、真实详情、`404.html`、`rss.xml`、Sitemap 和 `robots.txt`。
- 确认 Sitemap 不包含 404 或 Practice JSON。

### Existing regression suite

- 内容 schema、URL、practice normalization 单元测试保持通过。
- `npm run check`、`npm run build`、`npm run test:e2e`、Docker build 为最终门禁。

## Compatibility and rollback

- 新增依赖限于 Astro 官方 RSS/Sitemap 包，不引入运行时服务器。
- 若 Sitemap 集成导致构建问题，可移除单一 integration 并保留其余静态站点；RSS/robots 路由相互独立。
- SEO props 均有网站级默认值，现有页面无需一次性传入文章字段。
- 正式服务器配置不在取得目标信息前修改，因此本轮代码回滚只需回退新增依赖、路由、metadata 与文档提交。

## 2026-08-04 information architecture extension (scope-corrected)

### Product boundary and frozen homepage

本扩展只建立长期可演化的公开信息架构与内容容器，不创作内容。以下文件与体验属于冻结边界：

- 不修改 `apps/web/src/pages/index.astro` 与 `apps/web/src/config/home.ts`。
- 不修改首页 Hero、Philosophy、Practice Heatmap、Latest Content、区块顺序、视觉资产、文案或动画。
- 不修改 `content/**/*.md`；现有三项真实内容继续作为唯一内容事实源。
- 只允许共享 `SiteHeader` 同步新的一级导航，以及共享 URL resolver 让既有内容卡指向同一内容的新 canonical；
  首页页面文件、可见内容、布局和交互层级均不改变。

本轮一级导航固定为“知识、项目、旅程、关于”。“博客、笔记、日志、项目”仍是底层内容形式与兼容路由，但不再驱动全站导航。“学习路径”不设独立栏目；以后若增加学习顺序，它属于知识领域内部的编排能力。

### Knowledge section model and ownership

五个公开入口只固定名称、顺序和 slug，不在没有真实新内容时继续解释“主领域 / 内容视图 / 成熟度”等 taxonomy 语义。

- `apps/web/src/lib/content/domain.ts` 继续拥有 legacy `contentTypes`，同时新增唯一的 `knowledgeSections` 注册表。注册表拥有
  五个 section 的稳定 key、slug、中文名称、顺序和结构说明；页面、copy 和测试不得维护平行数组。
- schema 只增加可选、去重的 `knowledgeSections: KnowledgeSectionKey[]`。一篇非项目知识可以属于零个、一个或多个 section，
  现有 Markdown 不迁移也能通过；项目若填写该字段则明确校验失败，避免静默忽略。
- 本轮不新增 `contentForm`、primary domain、knowledge view 或 maturity enum。Note、Guide、Thinking、Review、Case 的稳定含义
  需要由真实写作验证，以后可作为正交字段加入，不影响五个 section、canonical 或现有内容身份。
- 所有筛选由共享 query/projection 层完成。页面不得从标题、legacy `type`、自由 tags、目录位置或正文关键词推断归属。
- 本轮不建立“历史未分类 ID allowlist”，也不把未分类内容升级为构建错误。所有公开非项目内容都进入“最近更新”；
  只有作者显式填写字段后才进入对应 section。
- 不增加 relation、Journey event 或 project metadata。所有 section projection 先排除项目。

五个固定 section 为：

| Slug                               | 中文入口         | 查询方式                       | 定位                               |
| ---------------------------------- | ---------------- | ------------------------------ | ---------------------------------- |
| `agent-app-development`            | Agent 应用开发   | `knowledgeSections` membership | Agent 应用层知识                   |
| `llm-principles`                   | 大模型原理与实现 | `knowledgeSections` membership | 模型原理和实现知识                 |
| `fine-tuning-inference-deployment` | 微调、推理与部署 | `knowledgeSections` membership | 模型工程与交付知识                 |
| `practice-cases`                   | 实践与案例       | `knowledgeSections` membership | 从真实项目和实验中提炼的可迁移知识 |
| `knowledge-frontier`               | 知识前沿         | `knowledgeSections` membership | 正在研究的问题、假设和认知边界     |

表中的“定位”只用于界面结构说明，不代表由系统生成的文章或技术观点。

### Deferred domain models

稳定 `contentId`、五个 section 与 `/knowledge/:slug` 已足够保留未来扩展空间。本轮明确不实现以下模型：

- 类型化关系、反向关系投影、关系图或学习顺序；当前没有一条作者确认的真实关系，提前固定 relation kind 与方向规则没有数据依据。
- Journey event、event ID、飞轮阶段与时间轴投影；当前没有作者确认的独立成长节点，`/journey` 先使用真实空状态。
- 项目的 problem、role、outcomes、evidence、repository、demo、Star 与 `detailPage` metadata；当前项目继续使用既有字段和兼容详情。
- legacy `type/stage/status`、draft 规则与作者工作流重构；这需要在第一批新知识内容产生后，按真实写作负担另立任务。

这些能力未来仍应引用现有 `contentId` 和 canonical，而不是新建平行内容仓库；但它们不是本轮信息架构页面的前置依赖。

### Navigation contract

`apps/web/src/config/site.ts` 改为拥有独立、显式的站点导航：

```typescript
navigation: [
  { key: 'knowledge', label: '知识', href: '/knowledge' },
  { key: 'projects', label: '项目', href: '/projects' },
  { key: 'journey', label: '旅程', href: '/journey' },
  { key: 'about', label: '关于', href: '/about' },
];
```

品牌标识仍链接 `/`。共享页眉中的可见“知识”文字是直达 `/knowledge` 的真实链接；其右侧相邻的原生 `details/summary`
箭头只负责披露包含五个固定 section 的面板，不重复“知识总览”。section 名称、说明与 URL 继续来自中央注册表，不在组件内
复制。桌面精细指针由一个 CSP 兼容的小型脚本增强为 hover 打开、离开/外部点击关闭与 Escape 收起；触屏、键盘和关闭
JavaScript 时，文字链接与原生披露控件仍分别完成跳转和展开。项目、旅程、关于保持普通一级链接，页眉不展示三级技术目录。
底层 `uiCopy.contentTypes` 保留，继续服务 legacy redirect 文案、项目详情和 RSS 分类。

页眉 active 判断由简单 URL 前缀升级为显式 section context：`/knowledge`、五个 section、知识详情与 legacy redirect 终点均属于
“知识”；`/projects` 与兼容项目详情属于“项目”；Journey 与 About 各自独立。精确一级页面与后代 location 使用不同的
`aria-current` 语义，避免在详情页错误宣称一级链接就是当前页面。

### Route and data-flow design

```text
content/**/*.md
  -> strict schema validation
  -> existing public-content filtering + optional knowledge classification
  -> shared content query layer
     -> /knowledge
     -> /knowledge/[key] (section or canonical knowledge detail)
     -> /projects + stable project anchors
     -> compatibility redirects / legacy project detail

siteConfig + uiCopy
  -> shared header
  -> /journey empty state
  -> /about
```

#### Knowledge

- `/knowledge` 按中央注册表顺序展示五张 section 卡片。每张卡固定包含名称、一句结构说明、真实内容数量或“暂无内容”
  和一个可聚焦进入操作；整卡不得同时制造多个同目标链接。
- `/knowledge` 另展示按共享排序得到的“最近更新”，收录所有公开非项目内容，不推断 section，也不构成第六张 section 卡片。
- `/knowledge/[key]` 由一个静态 resolver 同时拥有五个保留 section slug 与非项目内容 slug，解决 section 路由和
  `/knowledge/:slug` canonical 的同级冲突。构建期拒绝 section/content slug 冲突及不同知识内容间的 slug 冲突。
- section 页面调用注册表声明的类型化 projection；有内容时复用内容卡，无内容时显示带“返回知识总览”操作的空状态。
- 知识详情统一回到“知识”总览，不从多选 section 猜测唯一主 breadcrumb。页眉在 section 与详情后代页面将“知识”表达为
  当前 location，只有 `/knowledge` 本身使用精确 page 语义。
- 详情继续渲染同一 Markdown 正文；本轮不增加关联内容、学习路径或“猜你喜欢”模块。

#### Projects

- 新增显式 `/projects` owner，并让 legacy 类型列表路由停止生成 `project`，避免同一路径双 owner。页面把每个真实项目渲染为
  `id=<slug>` 的静态 section，并消费现有 title、status、summary 与 tags。
- `praxis-project-0001` 是唯一精确兼容详情例外：其项目区块继续使用现有链接进入 `/projects/praxis-foundation`；详情正文、
  breadcrumb、返回行为、`contentId`、canonical、首页入口和 RSS/Sitemap 身份全部原样保留。
- 其他项目不生成详情路由，Markdown 正文直接在其 `/projects#<slug>` section 内渲染。这样作者新增真实项目 Markdown 后即可发布，
  同时不引入新的项目子页面或 `detailPage` schema。
- 仓库、Demo 与 Star 入口不做空壳占位；出现作者提供的真实外部地址后再扩展可选字段和操作，不模拟已完成 Star 或账户授权。

#### Journey

- `/journey` 是独立的单页结构，不是 `/journal` 的改名，也不读取或推断 Practice Log、发布时间或更新时间。
- 当前没有作者确认的独立成长节点，因此页面只显示克制的结构说明和真实空状态，并提供“浏览知识”“查看项目”两个退出路径。
- 首版不渲染时间轴、不增加年份/阶段/主题筛选，也不建立数据 projection。现有内容详情内的 `JourneyPanel` 保留；旧
  `/journal` 聚合页按 canonical 迁移规则到达 `/knowledge`。

#### About

- `/about` 的页面标题与 H1 明确为“关于 Praxis”，首版职责是说明站点定位，而不是伪装成作者 Biography。
- 页面只消费已经确认的 `siteConfig.author.name` 与 `siteConfig.author.bio`，并使用必要的结构说明。
- 不补写个人经历、身份、联系方式或未来计划，不创建新的内容类型或 Markdown collection。

### URL, canonical and discovery compatibility

非项目知识在本轮统一迁移到不依赖内容形式的 canonical：

```text
/knowledge/:slug                                      canonical knowledge detail
/notes/ai-code-security-review     -> compatibility   /knowledge/ai-code-security-review
/journal/what-green-gates-miss     -> compatibility   /knowledge/what-green-gates-miss
/blog                              -> compatibility   /knowledge
/notes                             -> compatibility   /knowledge
/journal                           -> compatibility   /knowledge
/projects/praxis-foundation                           existing project canonical
```

URL owner 从 `getContentUrl(type, slug)` 收敛为接收完整内容身份的 public URL resolver：非项目返回 `/knowledge/:slug`；
`praxis-project-0001` 返回既有详情 URL；其他项目返回 `/projects#<slug>`。原 type-first helper 只服务当前精确 legacy mapping
和兼容测试，不能继续被新知识页面、RSS 或系统生成内链调用。本轮不抽象通用 alias/rename 平台或项目详情开关。

迁移规则：

- 在启用 configured redirects 前，`[type]/index.astro` 不再生成 legacy 聚合路径；`[type]/[slug].astro` 只生成当前项目详情。
  一个 pathname 在 prerender manifest 中始终只有一个 owner。
- 当前 Note 与 Journal 的 `contentId`、slug、正文和发布日期不变，只改变 canonical。系统生成的首页卡片、metadata、RSS 与
  共享内容链接跟随 resolver；冻结 Markdown 中的手写 legacy 链接保留，并通过 compatibility page 到达同一正文，不做静默正文改写。
- 只维护五个精确 mapping：`/blog`、`/notes`、`/journal` 到 `/knowledge`，以及当前 Note、Journal 的两个详情地址到对应
  `/knowledge/:slug`。不使用 wildcard redirect，避免 section slug 与内容 slug 共享动态路由时误配。
- RSS 仍只收录真实 Markdown，条目 link 使用新 canonical，并通过 `@astrojs/rss` item `customData` 输出
  `<guid isPermaLink="false">contentId</guid>`；不能依赖该包默认以 link 生成 GUID，否则 URL 迁移会被 feed reader 当作新内容。
- Sitemap 收录 `/knowledge`、canonical 知识详情、`/projects`、现有项目详情、`/journey` 与 `/about`；不收录 legacy redirect。
  五个 section 是稳定站点结构，沿用默认 `index,follow` 并进入 Sitemap；本轮不增加按内容数量变化的 robots 状态机。
  404 继续使用现有 `noindex,nofollow` 契约。
- `astro.config.mjs` 的 configured redirects 是本地/构建 owner。当前 `output: static` 且无 adapter 时，Astro 生成包含
  `meta refresh`、`noindex` 与目标 canonical 的 HTML fallback；构建和 E2E 验证这些元素及最终目标，但不伪称 HTTP 3xx。
- 正式接入用户 Caddy 时再把同一 mapping 实现为 GET 301，并执行线上单跳 smoke；该状态属于 External release gate。
  在此之前不能以保留两份可索引详情代替兼容页，也不能提前勾选生产重定向。

### Rendering and accessibility boundaries

- 新页面优先复用 `BaseLayout`、`ContentCard`、`EmptyState` 与现有设计 token；新增组件只承载可复用的结构，不复制内容查询或 metadata 逻辑。
- 主要信息与所有导航必须由静态 HTML 提供，不以客户端 JavaScript 作为可读或可达前提；知识菜单的脚本仅增强
  精细指针 hover、外部关闭和 Escape，原生披露与链接是无脚本基线。
- 页面必须在 Light/Dark、320px 宽度、Pixel 7、键盘导航和 Axe 检查下可用。
- 页面信息密度保持克制；空状态清楚说明“尚无作者内容”，不伪装成待发布教程目录。
- `EmptyState` 支持可选结构性操作；知识 section 返回知识总览，Journey 前往知识或项目，不能把用户留在死胡同。
- breadcrumb、H1 与项目 hash anchor 不能被 sticky 页眉遮挡。
- “知识”直达链接在总览使用 `aria-current="page"`、在详情或 section 后代使用 `location`；展开后的对应 section 链接在
  子链接集合内使用 `page`。独立箭头只承担原生披露语义并具有明确可访问名称。其他一级链接在精确页面使用 `page`、后代使用
  `location`。键盘顺序固定为品牌、知识直达链接、知识披露箭头、展开后的五个 section、项目、旅程、关于、主题按钮和页面
  首个操作，且移动端点击目标不互相覆盖。

### Test strategy for the extension

#### Unit and schema tests

- 锁定五个 section 的名称、顺序与 slug；验证可选、去重的 `knowledgeSections`、多 section membership 及项目拒绝规则。
- 验证未分类非项目内容仍进入“最近更新”，而不会被自动加入任一 section 或触发构建失败。
- 验证 canonical resolver、当前项目详情例外、其他项目 anchor、五个精确 legacy mapping、知识 slug 全局唯一与
  section/content slug 冲突。
- 不增加 relation、Journey event、project metadata 或历史孤儿治理测试。

#### E2E and build tests

- 首页现有 Hero、资产、Heatmap、Latest Content 与区块顺序作为冻结回归基线；只更新页眉导航断言。
- 验证四个一级导航、知识总览直达链接与箭头披露菜单中的五个 section 直达链接、五个知识入口及数量、最近更新、知识空状态、
  项目真实内容、Journey 空状态与“关于 Praxis”。
- 仅在单元层用最小内存对象验证 section 分类；不建立第二套公开 fixture 站点，不为关系、项目或 Journey 制造演示数据。
- 验证新增页面 canonical、社交 metadata、RSS discovery、RSS GUID、Sitemap 收录，以及旧知识 URL 静态 compatibility
  page 的 meta refresh、noindex 与 canonical；生产 HTTP 301 留到部署 smoke。
- 验证当前真实数据可完成：`知识 → 空 section → 知识`、`知识 → 最近更新 → 详情 → 知识` 与
  `项目 → 项目锚点 → 现有详情 → 项目`；详情页正确点亮所在一级 section。
- 将新增主页面纳入桌面/移动、Light/Dark、320px overflow、键盘、Axe、no-JS 与全量 CSP 产物扫描。
- 在桌面验证 hover 展开/离开关闭，在触屏验证点击展开，在键盘验证 Enter/Space、Tab、Escape 与焦点可见性，并在
  no-JS 上下文验证原生披露仍可进入一个真实 section。
- RSS 继续恰好包含当前三项真实内容，知识条目使用新 canonical、项目条目保持现有 canonical，GUID 对应稳定 `contentId`。
- 断言 `content/`、`dist/`、RSS 与 Sitemap 没有新增示例文章、虚构项目或 Journey 节点；Practice Heatmap 数据保持不变。

### Rollout and rollback

实现按以下可逆层次推进：

1. section registry、一个可选知识多选字段与最小查询测试；不修改内容。
2. 独立导航配置；可单独回退并恢复旧页眉。
3. Knowledge、Projects、Journey、About 静态页面与真实空状态；各新增页面组可独立撤回，
   但撤回页面时必须在同一变更中撤回对应导航入口，不能留下一级导航 404。
4. canonical resolver、Astro HTML compatibility pages、RSS/Sitemap 迁移与完整 E2E；该层作为一个原子候选变更，不能只切换 canonical 而遗漏旧地址。生产 Caddy 301 在外部部署 gate 单独启用并验证。

项目主页面可以回退为现有通用列表，现有详情始终保留。整个扩展不引入数据库、运行时服务、新依赖或 Markdown 正文迁移，
因此回滚不需要恢复内容；canonical 迁移如需回滚，必须同时恢复 resolver、RSS、Sitemap、系统生成链接与 legacy route owner，
不能留下双 canonical 或 redirect loop。任何首页主体回归都先回退共享投影或页眉变更，不修改首页文件与作者内容。
