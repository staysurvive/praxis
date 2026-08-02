# Praxis v0.1 public release — technical design

## Scope and invariants

本轮在既有静态架构上增加“可发现、可分享、可验证”的发布层，不改动内容事实源、统一 collection、type-first URL
或 Practice Heatmap 的事件语义。所有新增页面继续由 Astro 在构建期生成，FastAPI 与 PostgreSQL 保持不存在。

## Existing experience audit boundary

首页、热力图、详情页、404、主题和响应式组件已经实现。本轮以自动化与浏览器验证为主，只在发现明确缺陷时修改。
这避免为了里程碑重写已经满足产品要求的视觉结构。

## SEO layout contract

`BaseLayout.astro` 继续作为唯一的文档级 metadata owner，新增类型化 props：

```typescript
type SeoType = 'website' | 'article';

interface Props {
  title: string;
  description?: string;
  canonicalPath?: string;
  seoType?: SeoType;
  publishedAt?: string;
  updatedAt?: string;
  tags?: readonly string[];
  noindex?: boolean;
}
```

- `canonicalPath` 与 `Astro.site` 组合为绝对 URL。
- 所有页面共享 Open Graph、Twitter summary card 和 RSS autodiscovery。
- 仅 `seoType === 'article'` 时输出 `article:published_time`、`article:modified_time` 与重复的 `article:tag`。
- `noindex` 只用于 404 等不应被索引的页面。
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

## Content and practice record update

`content/projects/praxis.md` 保持现有 stable ID、slug 与 `type`。更新内容时：

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
