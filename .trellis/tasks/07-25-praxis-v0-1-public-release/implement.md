# Praxis v0.1 public release — implementation plan

> **Active-plan boundary:** 从本文件开头到 “Historical release review gates” 只记录已经完成的 v0.1 发布基线，不得重新执行，其中涉及 `homeContent.now` 与 `content/projects/praxis.md` 的历史步骤尤其不属于当前授权。当前唯一活动计划从 “Information architecture execution plan (2026-08-04)” 开始。

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

## Historical ordered checklist (completed; do not re-run)

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

## Historical risky files and rollback points

- `apps/web/src/layouts/BaseLayout.astro`: metadata regressions affect every page; validate defaults and 404 separately.
- `apps/web/astro.config.mjs`: Sitemap integration affects the full build; verify output paths before continuing.
- `content/projects/praxis.md`: schema rejects invalid dates or duplicate events; preserve stable identity and URL.
- `package-lock.json`: dependency changes must stay limited to official Astro packages and their transitive requirements.

## Historical release review gates

- Gate A: planning artifacts match the user-approved scope and contain no backend work.
- Gate B: metadata and discovery endpoints build with a deterministic test `SITE_URL`.
- Gate C: existing editorial/heatmap/theme/mobile behavior has no regression.
- Gate D: release checklist distinguishes verified local readiness from unperformed production deployment.

## Information architecture execution plan (2026-08-04)

> **Re-approval gate (2026-08-04 review):** 本轮审查实质缩减了知识、项目、Journey 与兼容范围。即使任务状态仍为
> `in_progress`，在用户审阅并明确批准这版最终摘要前，也不得修改产品代码或执行以下清单。

当前活动实现只包含四类结果：显式导航与五项 section 注册表、四个主页面骨架、最小知识 canonical 迁移、针对真实内容与
空状态的回归验证。关系图谱、Journey 事件、项目证据模型、作者工作流重构和通用 alias 系统均不进入本轮。

### Scope guard before implementation

- [ ] Record the pre-change git state and preserve the latest approved planning artifacts plus any unrelated user changes.
- [ ] Treat `apps/web/src/pages/index.astro`, `apps/web/src/config/home.ts`, homepage assets and all `content/**/*.md` files as frozen.
- [ ] Confirm the current three public entries, their `contentId` values and type-first URLs before changing shared routing code.
- [ ] Do not create example articles, knowledge tutorials, project narratives, Journey nodes or inferred author biography.

### Primary-page exhibition visual extension (approved 2026-08-05)

- [x] Generate and visually inspect four text-free local art backgrounds; publish optimized WebP assets for the four root Hero variants.
- [x] Add a typed, root-only `EditorialHero.astro` plus a central visual asset registry. Replace `PageHero` only in
      `/knowledge`、`/projects`、`/journey`、`/about`; do not touch `PageHero.astro`、`knowledge/[key].astro`、article layouts,
      homepage files or content projections.
- [x] Keep the desktop Hero at `--section-min-block-size`, mobile copy/media split, semantic text and decorative images separate,
      and token-based Light/Dark overlays. Restrict motion to a CSS transform/opacity entrance in the no-preference branch.
- [x] Add E2E coverage for each root Hero's semantic H1, dedicated asset, full first desktop viewport, no horizontal overflow,
      reduced-motion static state and the unchanged knowledge section shell.

### 1. Add the minimum knowledge structure contract

Files:

- `apps/web/src/lib/content/domain.ts`
- `apps/web/src/lib/content/schema.ts`
- `apps/web/src/lib/content/index.ts`
- `apps/web/tests/unit/content-domain.test.ts`
- `apps/web/tests/unit/content-schema.test.ts`
- `apps/web/tests/unit/content-query.test.ts` (new only if existing tests cannot own the focused queries)

Checklist:

- [ ] Add the ordered `knowledgeSections` registry with the five approved keys, slugs, labels and descriptions; do not add primary/view/content-form/maturity semantics.
- [ ] Add one optional, deduplicated `knowledgeSections: KnowledgeSectionKey[]` field for non-project content. Every existing Markdown file must validate unchanged;
      projects using the field must fail clearly. Do not add an ID allowlist, orphan-content failure, relation fields, Journey event fields or project metadata.
- [ ] Add only `listKnowledgeSectionEntries()` and `listRecentKnowledge()` (or equivalent focused queries). Page files must not infer membership from legacy
      type, tags, paths, titles or keywords.
- [ ] Test fixed section order, valid/invalid optional values, multi-section membership, deduplication, project rejection, unclassified recent-content visibility and no-inference behavior
      using minimal in-memory unit data; do not add production Markdown fixtures.
- [ ] Run the focused unit suite before changing routes.

### 2. Decouple the primary navigation

Files:

- `apps/web/src/config/site.ts`
- `apps/web/src/config/copy.ts`
- `apps/web/src/components/SiteHeader.astro` (audit first; edit only if its current contract cannot render the new configuration)

Checklist:

- [ ] Replace navigation generated from `contentTypes` with the explicit order: 知识 `/knowledge`、项目 `/projects`、旅程 `/journey`、关于 `/about`.
- [ ] Keep the brand link at `/` and preserve `uiCopy.contentTypes` for compatibility pages, details and RSS.
- [ ] Add centralized labels, structural descriptions, count/empty copy and empty-state actions for the five knowledge sections and three new page shells.
- [ ] Render the visible Knowledge label as a direct overview link, with an adjacent native disclosure arrow containing only the five
      registry-backed section links. Enhance fine-pointer hover, outside close and Escape with one narrowly scoped CSP-compatible script;
      keep the direct-link and disclosure click/keyboard/no-JavaScript behaviors native and independently operable.
- [ ] Keep Projects/Journey/About as direct links and add no third-level technical catalog. Make active navigation section-aware: exact primary
      pages use page semantics; knowledge/project descendants use location semantics. Preserve visible focus and brand-first keyboard order.
- [ ] Verify the shared header changes on the homepage while homepage body files, visible content, layout, assets and interactions remain untouched; only existing content-card hrefs may follow the approved public URL resolver.

### 3. Build the Knowledge overview, section pages and details

Suggested files:

- `apps/web/src/pages/knowledge/index.astro`
- `apps/web/src/pages/knowledge/[key].astro`
- `apps/web/src/components/KnowledgeSectionCard.astro`
- an interior-page heading component only if at least two new pages share the exact structure

Checklist:

- [ ] Render five section cards from the central registry in the approved order at `/knowledge`; each card has one focus target, structural description and real count/empty label.
- [ ] Add a separate “最近更新” projection containing all public non-project entries so current unclassified Note/Journal content remains discoverable; do not label it a sixth section.
- [ ] Generate a single `[key]` route set containing five reserved section slugs plus every public non-project content slug. Reject section/content and content/content slug collisions during the build.
- [ ] Query each section through its registry declaration; never infer membership from legacy `type`, tags, folders, titles or keywords.
- [ ] Render knowledge detail at `/knowledge/:slug` with the current full detail shell: Markdown, ContentMeta, article SEO, JourneyPanel and PracticeTimeline all remain intact.
      Use a stable return to `/knowledge` rather than guessing one primary breadcrumb from the multi-select sections.
- [ ] Do not add related-content, learning-path, relation-graph, recommendation or placeholder modules.
- [ ] Extend `EmptyState` with a structural action, and ensure empty sections return to the knowledge overview without JavaScript.
- [ ] Confirm all five sections truthfully render empty with the current untouched content set while “最近更新” exposes the two real non-project entries.

### 4. Make Projects a single-page primary experience

Files:

- `apps/web/src/pages/[type]/index.astro`
- `apps/web/src/pages/projects/index.astro`
- `apps/web/src/pages/[type]/[slug].astro`

Checklist:

- [ ] Remove `project` from the generic type-index owner before adding the explicit `/projects` page; Step 7 converts the other legacy aggregates to compatibility mappings.
- [ ] Render every real project as a static `id=<slug>` section using existing title, status, summary and tags.
- [ ] Treat `praxis-project-0001` as the only detail exception: keep its existing link, Markdown detail shell, breadcrumb/back behavior, canonical, `contentId`, homepage link and RSS/Sitemap identity unchanged.
- [ ] For any other project, render its Markdown body inline in `/projects#<slug>` and do not generate a detail route. Do not add a `detailPage` switch.
- [ ] Do not add problem/role/outcomes/evidence/repository/Demo/Star/relation fields or empty placeholders; test project anchor visibility under the sticky header.
- [ ] Add a focused unit check that the exact current `contentId` keeps its detail URL while another in-memory project resolves to `/projects#<slug>`;
      no test project may enter `content/` or the public build.

### 5. Add the Journey single page

Suggested files:

- `apps/web/src/pages/journey.astro`

Checklist:

- [ ] Render `/journey` as a static single-page shell with a truthful empty state and “浏览知识”“查看项目” actions.
- [ ] Do not create a timeline, event schema, projection, event ID, flywheel-stage selector or test-only Journey content.
- [ ] Do not infer nodes from commits, Practice Log, publish/update dates, article summaries or the existing content-level `journey` object.
- [ ] Keep the existing content-detail `JourneyPanel`; do not rename `/journal` into Journey. The legacy `/journal` aggregate becomes a Knowledge redirect in Step 7.

### 6. Add the About single page

File:

- `apps/web/src/pages/about.astro`

Checklist:

- [ ] Title the page “关于 Praxis” and explain the site identity using only confirmed `siteConfig.author.name`, `siteConfig.author.bio` and structural UI copy.
- [ ] Omit unknown personal history, roles, contact details and social links.
- [ ] Keep the page static and avoid creating a new content type or collection.

### 7. Migrate Knowledge canonical URLs and preserve compatibility

Audit files:

- `apps/web/src/pages/[type]/[slug].astro`
- `apps/web/src/pages/[type]/index.astro`
- `apps/web/src/pages/knowledge/[key].astro`
- `apps/web/src/lib/content/domain.ts` (public URL resolver plus current exact legacy mapping)
- `apps/web/src/pages/rss.xml.ts`
- `apps/web/astro.config.mjs`

Checklist:

- [ ] Replace new type-first link generation with a public URL resolver: non-project content maps to `/knowledge/:slug`; the current project keeps
      `/projects/praxis-foundation`; other projects map to `/projects#<slug>`. Keep the old helper only for compatibility tests.
- [ ] Remove legacy aggregate static paths before configured redirects claim `/blog`, `/notes` and `/journal`. Restrict `[type]/[slug].astro` to the current project detail before old knowledge aliases are enabled.
- [ ] Maintain only five exact mappings: the three aggregate paths above and the two current detail paths
      `/notes/ai-code-security-review`、`/journal/what-green-gates-miss`. Do not introduce wildcard redirects or a general alias/rename framework.
- [ ] Verify each compatibility artifact contains immediate meta refresh, `noindex` and the target canonical, never loops and renders no duplicate body. Record production GET 301 as an unchecked Caddy deployment item; do not assert an HTTP 3xx from the local static file server.
- [ ] Keep RSS limited to the same three real Markdown entries; use new canonical links for Note/Journal, preserve the project link, and use item `customData` to emit `<guid isPermaLink="false">contentId</guid>` instead of the package's default link-based GUID.
- [ ] Verify Sitemap adds `/knowledge`, all five section pages, canonical knowledge details, `/projects`, the existing project detail, `/journey` and `/about`, and excludes all legacy compatibility paths.
- [ ] Leave the existing BaseLayout robots contract, `robots.txt` and `SITE_URL` behavior unchanged.
- [ ] Update only shared/system-generated card, metadata and RSS links through the resolver without editing `index.astro`, `home.ts` or author Markdown. Explicitly test the frozen journal's hand-written legacy link through its compatibility page.

### 8. Extend browser and accessibility regression coverage

Primary file:

- `apps/web/tests/e2e/site.spec.ts`

Checklist:

- [ ] Preserve existing homepage Hero, visual asset, Heatmap, Latest Content and section-order assertions as the zero-regression baseline.
- [ ] Assert the four new primary navigation items, brand-home behavior, keyboard order, active state and visible focus.
- [ ] Assert the visible Knowledge link navigates directly to the overview while its adjacent disclosure arrow opens on desktop hover and touch
      click, exposes exactly five section links, closes on pointer leave/outside click/Escape, and remains independently usable through native
      click with JavaScript disabled.
- [ ] Cover the Knowledge overview, five section cards/counts, recent real content, all five empty section pages, the real Projects page, empty Journey and confirmed “关于 Praxis” content.
- [ ] Keep production E2E on the current three real entries only; classification edge cases stay in focused unit data and no public fixture site is created.
- [ ] Extend canonical, Open Graph, Twitter, RSS discovery/GUID and Sitemap assertions. For old URLs, inspect the generated compatibility HTML and final target; defer HTTP 301 status to production Caddy smoke.
- [ ] Run 320px overflow checks for `/knowledge`, one section, one knowledge detail, `/projects`, the project detail, `/journey` and `/about`; retain both Desktop Chrome and Pixel 7 projects.
- [ ] Include all new primary pages in Light/Dark Axe coverage and at least one empty section page.
- [ ] In a no-JavaScript context, complete `知识 → 空 section → 返回知识`, `知识 → 最近更新 → 详情 → 返回知识` and `项目 → 项目锚点 → 现有详情 → 返回项目`; verify Journey empty state and About remain readable.
- [ ] Verify sticky header does not cover H1, breadcrumb or project anchors; cards have one focus target; four mobile nav links and theme control do not overlap at 320px.
- [ ] Let the existing full-output CSP scan cover new HTML pages; do not duplicate scanner logic or add tests for deferred relation/Journey/project schemas.

### 9. Full validation gate

Run from the repository root:

```powershell
npm run format
npm run check
npm run build
$env:SITE_URL='https://praxis-build-check.example'; npm run build:production
npm run test:e2e
```

- [ ] Inspect `git diff --check` after formatting and confirm no frozen homepage/content file changed.
- [ ] Run `git diff --exit-code -- apps/web/src/pages/index.astro apps/web/src/config/home.ts apps/web/public/brand content` against the clean
      pre-change baseline; any output is a frozen-boundary failure. The only permitted new public asset is the scoped knowledge-menu behavior
      script when the existing CSP pattern requires it.
- [ ] Inspect generated HTML, redirect artifacts/mappings, RSS GUID/link values, Sitemap and robots with the deterministic test origin; verify legacy paths are absent from Sitemap and resolve in one hop.
- [ ] Confirm both untouched, unclassified non-project entries appear in “最近更新” without an allowlist or build warning.
- [ ] Assert `content/` and generated output contain no new article, project or Journey item; directly assert homepage Note/Journal cards use `/knowledge/:slug`, the project card keeps `/projects/praxis-foundation`, and visible order/text remain unchanged.
- [ ] Run Docker build only if the daemon is available; lack of a daemon does not permit marking the production deployment gate complete.
- [ ] Do not mark domain, Caddy/Compose, HTTPS or online smoke items complete without real external evidence.

### 10. Trellis finish gates

- [ ] Dispatch a full-scope `trellis-check` review after implementation and fix all scope, lint, type, test, accessibility and compatibility findings.
- [ ] Run `trellis-update-spec` if implementation establishes a reusable project convention not already present in `.trellis/spec/`.
- [ ] Update the release checklist only for evidence actually produced in this run.
- [ ] Add/retain an unchecked production item for Caddy GET 301 mappings and online single-hop smoke; local Astro HTML fallback is not evidence that this gate passed.
- [ ] Review the final diff for user-owned changes, frozen-file violations, generated content and accidental URL migrations before committing.

### Extension risks and rollback points

- **Five sections gain unapproved hidden semantics:** keep one flat, optional multi-select field; tests must prove one item can join multiple sections without a primary/view distinction.
- **Optional classification becomes hidden governance:** keep unclassified content valid and visible in recent updates; do not add allowlists or build failures in this release.
- **Journey fabricates chronology:** keep `/journey` static and empty; any attempt to derive nodes from current metadata is a scope failure.
- **`/projects` route collision:** remove `project` from generic index static paths before the explicit page is generated.
- **Project scope expands into a portfolio CMS:** keep only existing fields, inline Markdown for non-legacy projects and the one exact detail exception; remove evidence/repository/detail-page schema work.
- **Knowledge slug collision:** reserve all five section slugs and fail before static path generation when any non-project slug duplicates a reserved or existing slug.
- **Canonical migration is partial:** treat resolver, Astro HTML compatibility pages, RSS, Sitemap and system-generated links as one rollback unit; never leave old and new details both indexable. Production Caddy 301 remains a separate unchecked external gate.
- **Homepage changes beyond the approved boundary:** only shared header navigation and existing content-card destinations may change; revert any change to
  `index.astro`, `home.ts`, assets, visible copy, layout, motion or content immediately.
- **Header becomes unusable on narrow screens:** simplify presentation within the existing static header contract; do not add a JavaScript dependency as a shortcut.
- **Project canonical/RSS/Sitemap drift:** the existing Praxis project URL remains authoritative; roll back the new project projection before changing its identity.
- **A page group is rolled back:** remove its primary navigation entry in the same rollback so the shared header never points to a missing page.

### Extension review gates

- Gate E: `prd.md`, `design.md` and this plan agree on five public sections backed by one optional flat multi-select, single primary Projects/Journey entries, author-owned content and the frozen homepage.
- Gate F: section registry, navigation, routes and exact legacy mappings have clear owners; no page guesses classification, and no deferred domain model entered the diff.
- Gate G: knowledge canonical migration covers exactly the current five legacy addresses; the existing project canonical, RSS identity, Sitemap entry and homepage project link remain valid, while production HTTP 301 is still visibly gated.
- Gate H: all unit, build, desktop/mobile, no-JS, keyboard and Axe checks pass with no generated article, project narrative, Journey node or relation model.
