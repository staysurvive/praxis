# Praxis v0.1 public release

## Goal

把已经可运行的 Praxis 静态站点推进到“可以公开分享、但尚未擅自部署”的 v0.1 发布候选状态。首页、内容阅读、
Practice Heatmap、主题与移动端体验必须经过审计并保持完整；补齐基础 SEO、RSS、Sitemap、robots、真实项目进展
和一份可追踪的上线 Checklist。只有 Checklist 的部署前项目全部通过后，才允许接入用户现有服务器。

## Background and confirmed facts

- `apps/web` 已实现 Astro 7 + TypeScript + Markdown 静态站点，生产内容只来自根目录 `content/`。
- 首页已经包含 Hero、Philosophy、Now、Praxis Practice Heatmap 与 Latest Content；热力图只读取本地构建数据。
- `/projects/praxis-foundation` 是唯一正式内容，`blog`、`note`、`journal` 仅有测试 fixtures，不发布虚构文章。
- 自定义 404、Light/Dark、移动端 Playwright 项目、无 JavaScript 阅读和 Axe 检查已经存在，应审计和扩展而非重写。
- `BaseLayout.astro` 已包含 title、description、canonical 和基础 Open Graph，但所有页面固定为 `website`，尚无
  RSS discovery、Twitter card、文章级时间/标签元数据或 404 noindex。
- 仓库尚无 `/rss.xml`、Sitemap、`robots.txt` 或长期保存的 v0.1 上线 Checklist。
- `SITE_URL` 是构建期站点来源；缺省值仍为 `https://praxis.example`，正式部署必须显式传入真实域名。
- `content/projects/praxis.md` 与首页 Now 文案仍描述“基础功能即将实现”，需要按真实进展更新。

## Requirements

### R1 — Existing public experience audit

- 保留原创编辑型首页及其信息架构，不把三个理念阶段改成导航栏目。
- Practice Heatmap 继续只统计 `publishedAt` 与显式 `practiceLog`，不得增加 GitHub 或外部 API 依赖。
- 首页、类型列表、项目详情、404 在 Light/Dark、桌面与移动端均具备完整阅读和导航体验。
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
- Sitemap 包含首页、四个类型列表和公开内容详情；排除 404 与生成的 Practice JSON 端点。
- 提供 `/robots.txt`，允许公开抓取并指向由 `Astro.site` 计算出的 Sitemap URL。
- 构建必须在显式 `SITE_URL` 下生成正确的绝对 URL；占位域名只允许用于本地开发和测试。

### R5 — First real project content

- 保持 `contentId: praxis-project-0001` 和永久 URL 不变。
- 更新首页 Now 与 Praxis 项目正文，使其准确反映 foundation 已完成、v0.1 正在进入公开发布准备。
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

## Acceptance criteria

- [x] AC1：首页、Practice Heatmap、项目详情和 404 在桌面/移动端及 Light/Dark 下通过现有与新增 E2E 审计。
- [x] AC2：所有公开页面具有 canonical、Open Graph、Twitter card 与 RSS discovery；项目详情具有文章级时间和标签元数据。
- [x] AC3：404 返回品牌页面、HTTP 404，并输出 `noindex, nofollow`，且不进入 Sitemap。
- [x] AC4：`/rss.xml` 构建成功，只包含真实非草稿内容并使用规范绝对 URL。
- [x] AC5：Sitemap 覆盖首页、类型列表和真实内容，排除 404 与生成 JSON；`/robots.txt` 指向 Sitemap。
- [x] AC6：Praxis 项目和首页 Now 准确记录真实进展，`contentId`/URL 不变，没有虚构内容或虚假部署事件。
- [x] AC7：`docs/releases/v0.1-checklist.md` 存在，部署前条目以验证证据勾选，生产部署条目保持待办直至真实完成。
- [ ] AC8：`npm run check`、`npm run build`、`npm run test:e2e` 已通过；Docker build 待 Docker daemon 可用时补验。
- [x] AC9：站点仍为静态优先；无需 FastAPI、数据库、登录、评论、统计或 AI 服务即可构建和阅读。

## Out of scope

- FastAPI、PostgreSQL、评论、登录、阅读统计、AI 助手和任何动态 API。
- 完整 i18n、多语言路由、翻译工作流或双语 SEO。
- 全文搜索、Newsletter、Web Analytics、CMS、GitHub Contributions 或外部活动数据。
- 发布虚构的 blog、note、journal 或 project 内容。
- Kubernetes、Swarm、Turborepo、Nx、第二套反向代理或 HTTPS 方案。
- 未获得生产域名和服务器配置边界前，擅自修改或部署用户服务器。

## External release gate

本任务先完成可公开分享的代码与内容发布候选。正式部署仍需要真实域名以及用户现有 Docker Compose/Caddy
集成位置；缺少这些外部信息不阻止本地实现与部署前验收，但生产部署和上线后检查不得被提前标记完成。
