# Praxis blog foundation

## Goal

为个人项目 `praxis` 建立第一个可交付、可长期演进的博客基础切片。网站以“知行合一”为核心主张，
用“知而思、思而行、行而成”解释实践方法，并以真实的 Praxis 项目记录作为首篇正式内容。
首版部署到用户已有的 Docker Compose + Caddy 服务器，不依赖外部内容服务或动态后端。

## Product definition

- 产品形态：个人博客与个人实践记录站。
- 主题：知行合一。
- 核心理念：知而思、思而行、行而成；三个阶段是解释框架，不是导航栏目。
- 内容价值：把问题、思考、行动、成果和复盘放在同一条长期演进的内容记录中。
- 首篇正式内容：一个持续更新的 `project` 条目，记录 Praxis 的理念、产品思考、技术架构、开发过程、实践事件和阶段成果。
- 正式内容区不发布虚构演示文章；其他内容类型和异常数据只存在于自动化测试 fixtures。

## Content model and URL contract

所有博客、笔记、日志和项目使用一个统一内容集合。每条内容的 `contentId` 在整个生命周期内保持不变，
`type` 与 `stage` 是相互独立的维度：

```text
type:  blog | note | journal | project
stage: know-think | think-act | act-achieve
status: draft | ongoing | completed | reflected
```

共同 metadata 至少包含：

```yaml
contentId: stable-immutable-id
title: string
slug: string
type: blog | note | journal | project
stage: know-think | think-act | act-achieve
status: draft | ongoing | completed | reflected
publishedAt: date
updatedAt: date
summary: string
tags: string[]
```

每条内容还可以包含两个职责清晰、互不替代的区块：

```yaml
journey:
  question: optional rich text
  thinking: optional rich text
  action: optional rich text
  outcome: optional rich text
  reflection: optional rich text
  nextStep: optional rich text

practiceLog:
  - date: date
    kind: publish | learn | practice | reflect | milestone
    note: optional string
```

- Markdown/MDX 正文是内容事实源。
- `journey` 是随内容成熟不断补充的长期知识与实践成果，不绑定某个 stage，也不因 stage 变化创建新内容或切换 schema。
- `practiceLog` 是真实实践事件时间轴，服务于热力图、时间线和成长统计。
- `publishedAt` 自动规范化为首次 `publish` 事件；`updatedAt`、Git 历史、错字修正和排版调整不自动产生事件。
- `practiceLog.kind` 由集中配置管理。首版支持 `publish`、`learn`、`practice`、`reflect`、`milestone`，未来可添加新类型而不复制聚合逻辑。
- 如果同一内容在发布日期显式记录了 `publish`，规范化过程不得重复计数。

永久 URL 由内容类型决定：

```text
/blog              /blog/:slug
/notes             /notes/:slug
/journal           /journal/:slug
/projects          /projects/:slug
```

`stage` 只用于筛选、状态和进度展示，不进入永久 URL。未来可增加 `/about`、`/now`、`/uses`、`/search` 等独立页面，
不得改变现有内容命名空间。

## Homepage and navigation

首页采用编辑型品牌首页（Editorial Landing Page），目标是建立个人理念和长期实践的第一印象，而不是做内容索引仪表盘。

首版首页结构：

1. **Hero**：展示“知行合一”、Praxis 名称和个人简介。
2. **Philosophy**：用文字与视觉解释“知而思、思而行、行而成”；三个阶段不作为独立路由入口。
3. **Now（可选）**：展示当前正在学习或实践的内容；没有内容时可隐藏或显示完整空状态。
4. **Praxis Practice Heatmap**：统计 Praxis 自身产生的实践事件，不展示 GitHub Commit，也不调用外部 API。
5. **Latest Content**：按时间展示数量精简的真实内容，并链接到 type-first 永久 URL。

主导航以内容类型为一级分类，至少提供 `/blog`、`/notes`、`/journal`、`/projects` 的入口。类型列表为空时展示设计完整的空状态，
不得创建虚构文章填充页面。

## Practice Heatmap data boundary

构建时扫描 `content/` 下的 Markdown/MDX，通过内容访问层规范化 `publishedAt` 和显式 `practiceLog`，生成确定性的静态 JSON，
首页只读取该构建产物。首版不依赖 GitHub、第三方统计服务、FastAPI 或 PostgreSQL。

热力图按自然日聚合事件，并保留 `contentId`、`type`、`stage`、日期、`kind` 和可选说明，以便未来扩展连续实践天数、每日次数、
内容类型和理念阶段统计。未来后端可以提供派生统计，但 Praxis 内容与实践记录始终是数据来源。

## Frontend, visual, and language requirements

- 技术栈：Astro + TypeScript + MDX；以 Astro 官方基础项目为起点，不使用现成博客模板或主题。
- 输出模式：静态输出为默认模式；文章和导航不能以 SSR、FastAPI 或客户端 JavaScript 为前提。
- 仓库边界：轻量 monorepo，包含 `apps/web`、未来的 `apps/api`、`content` 和 `infra`；当前只实现 Web 与内容。
- 样式：Tailwind CSS 只负责布局、响应式、Grid/Flex 和基础间距；CSS Custom Properties 是颜色、字体、字号、行宽、间距、圆角、阴影、动效和主题语义的唯一设计 token 来源。
- 不引入大型 UI 组件库，不让页面由不可读的 Utility Class 长串构成；复杂组件可使用少量有语义的自定义 CSS。
- Light / Dark 两套主题同等优先，不能把 Dark 做成 Light 的简单反色；主题变量必须统一驱动核心页面。
- 视觉原则：大留白、统一网格、克制配色、中文阅读优先、低干扰动效、原创信息架构和组件设计。
- 动效只服务于页面进入、滚动反馈和数据表达，并支持 reduced-motion；关闭 JavaScript 后仍可阅读和导航。
- 首版为简体中文单语言，站点默认 `zh-CN`，不添加语言前缀路由，不实现完整 i18n、翻译系统或双语 SEO。
- 共享 UI 文案集中、类型安全地管理；组件不得把导航、状态、空状态和通用操作文案直接写死在结构中，以便未来增加英文文案包。

## Deployment and future API boundary

- 复用服务器现有 Docker Compose + Caddy；不新增第二套反向代理、HTTPS 证书方案、Kubernetes 或 Swarm。
- Astro 生成静态构建产物，由 Caddy 提供 HTTPS 和静态文件访问。
- 根目录提供可重复的 Web 构建入口和静态产物目录；部署文档使用环境变量或占位域名，不覆盖用户现有 Caddy 配置。
- 未来动态能力通过独立 FastAPI + PostgreSQL 提供，前缀统一为 `/api/v1`，首版不实现后端。
- 未来 API 最低契约为 `GET /api/v1/health`，以及按稳定 `contentId` 组织的 comments、views、assistant 等资源。
- API 响应使用 `{ data, error, meta: { requestId } }` 信封；动态能力失败不能阻断静态正文阅读。

## Initial vertical slice

首个可验证切片必须包括：

- Astro 官方基础脚手架下的 `apps/web`。
- `content/` 中唯一一篇真实的 Praxis 长期项目内容。
- 首页 Hero、Philosophy、可选 Now、Practice Heatmap 和精简 Latest Content。
- 至少一个 type 列表页和一个内容详情页；路由能够覆盖 type-first URL 规则。
- 详情页分别展示 Markdown 正文、stage/status、`journey` 和 `practiceLog` 时间轴。
- 自定义 404、基础 SEO 元数据、Light/Dark 主题、键盘可用的导航和空状态。
- 可在无网络环境构建 Practice Heatmap 静态 JSON。
- 可复用现有 Docker Compose + Caddy 的静态部署边界和说明。
- 格式、类型、schema、单元、核心路由 smoke 和基础可访问性验证。

## Minimum quality and error requirements

- 严格 TypeScript；内容 schema 在构建前校验，非法 metadata 明确失败。
- 内容访问层统一负责 schema、查询、URL 生成和实践事件聚合；页面组件不得直接解析 raw frontmatter 或复制查询逻辑。
- 共享组件接收类型化 props，不在展示组件中发起网络请求或持有全局状态。
- 缺失路由渲染品牌化 404；空内容列表和无实践事件有可理解的空状态。
- 动态请求（未来）使用稳定机器错误码、安全用户提示和 `requestId`；错误详情只写入服务端日志。
- 测试至少覆盖：合法/非法 content fixtures、四种 type、`journey` 累积、所有初始 practiceLog kind、自动 publish 去重、updatedAt 不计数、URL 生成、首页到详情页 smoke、404、键盘导航和两套主题的基础对比度。

## Acceptance criteria

- [x] 首页以 Hero 和 Philosophy 清晰表达“知行合一”及“知而思、思而行、行而成”，三个阶段不是独立导航入口。
- [x] 首页展示 Praxis Practice Heatmap；数据完全由本地 `content/` 生成，不发起外部 API 请求；无事件时显示明确空状态。
- [x] 首页 Latest Content 仅展示真实内容，并链接到 `/blog/:slug`、`/notes/:slug`、`/journal/:slug` 或 `/projects/:slug`。
- [x] 首篇正式内容为长期 `project` 条目，首页、详情页和热力图共享同一 `contentId` 数据。
- [x] 详情页分别显示 Markdown 正文、stage/status、`journey` 成果和 `practiceLog` 时间轴。
- [x] 统一内容集合支持四种 type、stage/status 筛选和 type-first URL；stage 变化不改变永久 URL。
- [x] `publishedAt` 只生成一次首次 publish；updatedAt、Git 历史和维护性修改不增加实践事件。
- [x] `practiceLog` 初始 kind 和未来扩展由集中配置控制；聚合 JSON 可稳定复现并保留事件类型。
- [x] Light/Dark 主题在首页、列表、详情和 404 均可用，核心文字和控件满足基础对比度要求。
- [x] 共享 UI 文案来自集中式 `zh-CN` 配置；没有语言前缀路由或 i18n 运行时依赖。
- [x] 自定义 404、内容 schema 失败、空列表和动态能力降级均有明确用户反馈。
- [x] 目标服务器部署方式可生成并提供可访问的静态构建产物，并复用现有 Caddy 边界。
- [x] 自动化检查覆盖格式、类型、内容校验、单元、首页到详情 smoke、404、键盘操作和移动端核心浏览。

## Out of scope

- FastAPI、PostgreSQL、登录、评论、统计服务和 AI 助手的实际实现。
- GitHub Contributions、GitHub API 或任何外部活动统计。
- 完整多语言、语言前缀路由、翻译工作流和双语 SEO。
- 全文搜索、知识图谱、复杂数据看板、Newsletter、支付、社交关系和习惯打卡系统。
- Turborepo、Nx、Kubernetes、Swarm 或其他大型编排系统。
- 发布虚构的 blog、note、journal 示例文章。

## Planning status

需求与技术方案已收敛，`design.md` 和 `implement.md` 将作为实现前审阅材料。当前任务仍处于 Trellis `planning`，
在用户明确批准计划前不得运行 `task.py start` 或修改业务源码。
