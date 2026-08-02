# Praxis v0.1 public release — implementation plan

## Progress snapshot (2026-08-01)

- 已补录 2026-07-30 至 2026-08-01 的 8 个本地提交（`653cfb1` 至 `64104a8`）：首页版式、统一编辑型面板、交互动效、Practice Heatmap、favicon 与页眉品牌标识均已进入发布候选。
- Heatmap 新增月份/星期标尺、年度总数、色阶与本地化 tooltip；纯函数月份投影、tooltip 裁切边界、品牌资产声明及页眉标识均有对应单元或 E2E 回归断言。
- `8a51804` 已同步统一面板尺寸规范；本次追记 Session 7，并补充品牌资产来源与静态 tooltip 的可复用前端契约。
- 生产部署门槛没有变化：仍等待公开署名、正式域名和服务器 Caddy/Compose 接入边界。任务继续保持 `in_progress`，不可提前归档。

## Progress snapshot (2026-07-26)

- 步骤 1–7 的静态检查与浏览器验证已有证据：SEO/RSS/Sitemap/robots 落地，release gate 文档就位，
  `npm run check`、生产静态构建与 `npm run test:e2e` 均通过；Docker build 需在 Docker daemon 可用时补验。
- 步骤 8 部分完成：checklist 部署前条目已按证据勾选，Trellis 质量/spec/commit 流程已走完
  （sessions 1–6）；生产部署与上线后检查仍开放，等待用户提供署名、正式域名和服务器
  Caddy/Compose 接入边界。
- 超出原计划的真实进展：正式内容从 1 篇增至 3 篇（项目 + 安全审查笔记 + 首篇日志），
  首页 currentProject 与 Latest top-3 解耦，e2e 扩至 30 断言；本地 main 已推送到
  github.com/staysurvive/praxis（32ce0ef）。
- 任务保持 `in_progress`，在真实部署完成前不归档。

## Ordered checklist

1. **Establish official discovery dependencies and config**
   - Add Astro-compatible `@astrojs/rss` and `@astrojs/sitemap` dependencies.
   - Register Sitemap with explicit exclusions for 404 and generated activity JSON.
   - Keep static output and the existing `SITE_URL` contract.

2. **Extend the centralized SEO contract**
   - Add typed website/article/noindex fields to `BaseLayout.astro`.
   - Add Twitter card, RSS discovery, article timestamps/tags, and robots metadata.
   - Pass article metadata from the unified detail route and noindex from 404.

3. **Add static discovery endpoints**
   - Implement `/rss.xml` from `listEntries()` and canonical URLs.
   - Implement `/robots.txt` from `Astro.site`.
   - Confirm Sitemap contains public routes and excludes non-indexable/generated endpoints.

4. **Bring real content up to date**
   - Update `homeContent.now` for v0.1 release preparation.
   - Add truthful `journey.outcome`, `journey.reflection`, next step and meaningful practice events to the Praxis project.
   - Keep `contentId`, slug, type-first URL and `status: ongoing` stable until real deployment.

5. **Create the versioned release gate**
   - Add `docs/releases/v0.1-checklist.md` with evidence-oriented sections.
   - Include `docs` in repository formatting checks.
   - Mark only locally verified items complete; leave domain/server/HTTPS/online smoke pending.

6. **Expand regression coverage**
   - Add E2E assertions for metadata, RSS, Sitemap, robots and 404 noindex.
   - Preserve desktop/mobile execution, Axe, theme persistence and no-JS reading.
   - Add a deterministic build-artifact assertion script only if E2E cannot cover an artifact invariant clearly.

7. **Run release-candidate validation**
   - `npm run format`
   - `npm run check`
   - `$env:SITE_URL='https://praxis-build-check.example'; npm run build:production`
   - `npm run test:e2e`
   - `docker build --build-arg SITE_URL=https://praxis-build-check.example -f infra/Dockerfile.web -t praxis-web-v0.1-check .`
   - Inspect desktop/mobile Light/Dark pages and generated discovery files.

8. **Update evidence and prepare deployment handoff**
   - Check completed deployment-preparation items in `docs/releases/v0.1-checklist.md`.
   - Update the Praxis practice record only for milestones that actually occurred.
   - Run Trellis quality/spec/commit workflow.
   - Keep production deployment items open until the user supplies the real domain and existing Caddy/Compose integration boundary.

## Risky files and rollback points

- `apps/web/src/layouts/BaseLayout.astro`: metadata regressions affect every page; validate defaults and 404 separately.
- `apps/web/astro.config.mjs`: Sitemap integration affects the full build; verify output paths before continuing.
- `content/projects/praxis.md`: schema rejects invalid dates or duplicate events; preserve stable identity and URL.
- `package-lock.json`: dependency changes must stay limited to official Astro packages and their transitive requirements.

## Review gates

- Gate A: planning artifacts match the user-approved scope and contain no backend work.
- Gate B: metadata and discovery endpoints build with a deterministic test `SITE_URL`.
- Gate C: existing editorial/heatmap/theme/mobile behavior has no regression.
- Gate D: release checklist distinguishes verified local readiness from unperformed production deployment.
