# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Praxis (知行合一) — a personal practice site. Static Astro + TypeScript + Markdown build; all content and UI copy is Chinese (`zh-CN`). npm-workspaces monorepo with a single workspace `apps/web`. Root `content/` (Markdown) is the content source of truth. `apps/api` is reserved for a future FastAPI service — do not add backend code without explicit scope approval. Node >= 22.12.0.

This project is managed by Trellis (see `AGENTS.md`): task planning/consent workflow lives in `.trellis/workflow.md`, and coding guidelines are in `.trellis/spec/<package>/<layer>/` — read the relevant spec index before writing code in a layer.

Product-level constraints (decision priority, digital-garden positioning, work mode, adjudicated charter deviations) live in `docs/charter.md` — read it before designing any new feature.

## Commands

All from repo root (they delegate to the `@praxis/web` workspace):

```bash
npm run dev            # regenerates practice data, then astro dev at http://localhost:4321
npm run build          # regenerates practice data, then astro build → apps/web/dist/
npm run build:production # validates a real HTTPS SITE_URL, then runs the static build
npm run preview        # serves dist/ (also port 4321 — stop dev first)
npm run check          # format:check + lint + typecheck + test:unit (offline quality gate)
npm run test:e2e       # runs a full build first, then Playwright against preview
npm run audit:deps     # npm audit (networked; separate from check)
npm run generate:practice  # rebuild apps/web/src/generated/practice-activity.json only
```

Single tests (paths are relative to `apps/web`, the script cwd):

```bash
npm run test:unit --workspace @praxis/web -- tests/unit/practice.test.ts        # one file
npm run test:unit --workspace @praxis/web -- -t "test name"                     # by name
cd apps/web && npx playwright test site.spec.ts -g "branded 404" --project=chromium  # one e2e, skip rebuild (needs a prior build)
```

Gotchas:

- `dev`, `build`, and `typecheck` self-prime via pre-hooks that run `generate:practice`; `lint` and `test:unit` do not (unit tests are pure library tests and don't need it).
- Playwright defines two projects: `chromium` and `mobile-chromium` (Pixel 7); without `--project` every test runs in both. The suite starts a fresh preview server on 4321 and does not reuse an existing one.
- E2E metadata assertions derive their expected origin from `SITE_URL`; when it is unset they use the default fallback `https://praxis.example`.
- `apps/web/README.md` is the untouched Astro starter README; ignore it. Root `README.md` and root `package.json` are authoritative.

## Architecture

### Content pipeline

- `apps/web/src/content.config.ts` defines a single collection `content` with a glob loader whose `base` is the repo-root `content/` directory. Entry id = frontmatter `contentId` (stable identity, decoupled from file path and slug).
- Frontmatter is validated by a **strict** zod schema (`apps/web/src/lib/content/schema.ts`) — unknown keys fail the build. Required: `contentId`, `title`, `slug`, `type`, `stage`, `status`, `publishedAt`, `updatedAt`, `summary`. Optional: `tags`, `journey`, `practiceLog`.
- All closed vocabularies (`contentTypes`, `stages`, `statuses`, `practiceKinds`) live in `apps/web/src/lib/content/domain.ts`, along with the type→URL-path mapping `contentTypePaths` (`note`→`/notes`, `project`→`/projects`), `getContentUrl`, and `isPublicStatus` (`status !== 'draft'` is the single publication policy). Adding a content type or practice kind = extend these registries + `uiCopy` labels; never a second collection, duplicated schema, or copied route family.
- `apps/web/src/lib/content/index.ts` is the **only** query path (`getContentEntries`, `getEntryBySlug`, `getEntryByContentId`, `getLatestEntries`). Drafts are excluded by default everywhere public (routes, RSS, heatmap JSON).

### Practice heatmap pipeline

- `apps/web/scripts/generate-practice-data.ts` (run via tsx pre-hooks) walks root `content/` itself, validates every file with the same zod schema, enforces cross-file invariants Astro can't (globally unique `contentId` and `type:slug`), and writes `apps/web/src/generated/practice-activity.json` (gitignored, deterministic).
- Event semantics (in `apps/web/src/lib/practice.ts`, pure/framework-free): `publishedAt` synthesizes exactly one implicit `publish` event unless `practiceLog` already logs it that day; `updatedAt` and Git history **never** create events. Public datasets must be built via `buildPublicPracticeDataset` (draft-filtering), never raw `buildPracticeDataset`.
- `apps/web/src/lib/practice-data.ts` imports the generated JSON and re-validates it with zod at the read boundary. It feeds the homepage heatmap and is republished at `/generated/practice-activity.json` by a prerendered endpoint.

### Layer boundaries

- `src/pages/` — route entry points only; compose lib loaders + components. `[type]/index.astro` and `[type]/[slug].astro` generate `/blog`, `/notes`, `/journal`, `/projects` via `getStaticPaths` over the registry; `[type]` params are URL paths, not enum values. `stage` never appears in permanent URLs.
- `src/components/` — presentational `.astro` components with typed `Props`; no collection queries, no network calls; they receive precomputed summaries (`ContentSummary` with computed `url` and labels).
- `src/config/` — the `zh-CN` string catalog: `copy.ts` (`uiCopy`, checked with `satisfies Record<Enum, string>` so vocabulary changes force copy updates), `site.ts`, `home.ts`. UI text is never hard-coded in component markup.
- `src/styles/tokens.css` — semantic CSS custom properties (`--color-surface`, …) with a `[data-theme='dark']` block; dark theme is designed, not inverted. Tailwind is a layout-only utility layer (grid/flex/spacing); visual language uses tokens, and recurring patterns get named component classes, not long utility strings.
- `apps/web/config/` (top level, not `src/config/`) — build-config validation only: `resolveSiteUrl` (HTTPS-only origin, default `https://praxis.example`); never hard-code an origin in a page.
- No global client state, no UI framework/hooks; the site must be fully readable without JavaScript. Only explicit interactions hydrate (theme toggle).

### CSP / hardening constraints (production breaks if violated)

- No inline `<script>` or `<style>` in output HTML: theme scripts are external files in `public/scripts/`, and Astro builds with `inlineStylesheets: 'never'`. The e2e suite asserts this, and the Caddy CSP (`script-src 'self'; style-src 'self'`) enforces it.
- ESLint enforces `no-console`, `eqeqeq`, `@typescript-eslint/no-explicit-any`, type-only imports, and `astro/no-set-html-directive` (no `set:html`).
- Deployment (`infra/`) is a one-shot Docker build that exports `dist/` into a volume served by a pre-existing Caddy — there is no app server, and the example adds no second proxy. Security headers live in a Caddy snippet that must stay imported in both the normal route and `handle_errors` (error routes don't inherit headers). Adding any third-party script/font/image/API origin requires a CSP review.
