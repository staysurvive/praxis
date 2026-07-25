# Praxis blog foundation — implementation plan

## Preconditions and gates

1. User reviewed and approved `prd.md`, `design.md`, and this plan.
2. Run the Trellis pre-development context step (`trellis-before-dev`) and load the relevant `.trellis/spec/` files.
3. The child task `07-24-praxis-foundation` is active; the parent bootstrap task remains separate until its checklist is archived.
4. Node/npm versions and the Astro Tailwind/content-loader path were verified during implementation.

## Implementation record

All ordered steps in this plan are complete. The implementation starts from Astro's base scaffold, keeps authored
content in root `content/`, generates local practice data at build time, and exports a static artifact for the existing
Compose/Caddy environment. No FastAPI, PostgreSQL, external activity API, template, UI kit, or second proxy was added.

The final quality gate is documented in `.trellis/spec/frontend/quality-guidelines.md` and rerun before commit review.

## Ordered implementation steps

### 1. Establish the lightweight workspace

- Add a root `package.json` using npm workspaces with `apps/web` as the only active workspace; keep scripts transparent and avoid Turborepo/Nx.
- Create `apps/web` from the official Astro base scaffold, then enable strict TypeScript and static output.
- Add the approved Tailwind integration without a UI component kit. Keep `content/` and `infra/` at the repository root.
- Add root scripts that delegate to the Web app for format, lint, type-check, unit tests, browser tests, and build.

### 2. Implement the typed content boundary

- Add one Astro content collection/content loader that reads the root `content/` directory.
- Define the common metadata schema, `journey` additive object, `practiceLog` event schema, type/stage/status enums, and centralized event-kind registry.
- Add the content access layer with `listEntries`, `getEntryBySlug`, `getEntryByContentId`, type filtering, stage filtering, and URL generation.
- Keep raw frontmatter parsing and schema errors inside this boundary; pages consume typed entries only.
- Add the real `content/projects/praxis.md` entry with stable `contentId`, Chinese prose, journey fields, and several meaningful practice events.

### 3. Generate the Praxis activity data

- Implement a deterministic build-time aggregator that synthesizes the first `publish` event from `publishedAt`, merges explicit `practiceLog`, and de-duplicates an explicit publication event on the same date.
- Never derive events from `updatedAt` or Git history.
- Preserve `contentId`, `type`, `stage`, date, kind, and note in the normalized stream.
- Write generated JSON to the ignored derived file `apps/web/src/generated/practice-activity.json`; Astro emits the
  same dataset at `/generated/practice-activity.json` in `apps/web/dist/`, keeping it out of authored content.
- Render a keyboard-readable empty state when the event stream is empty.

### 4. Build the design system foundation

- Define semantic CSS Custom Properties for Light and Dark palettes, typography, Chinese reading measure, spacing, grid, radii, shadows, motion, focus rings, and heatmap levels.
- Configure Tailwind to consume or coexist with those tokens for layout and responsive utilities only.
- Add a no-JavaScript theme default using system preference/CSS, then add a small progressively enhanced theme control that can remember an explicit choice.
- Add `zh-CN` site configuration and a typed centralized UI-copy module for navigation, status labels, empty states, accessibility labels, and common actions.
- Keep component styles short and semantic; avoid repeated arbitrary-value utilities and long opaque class strings.

### 5. Implement shared layout and navigation

- Create the site shell, header/navigation, footer, typography primitives, metadata display, type badges, stage/status indicators, and empty-state component.
- Primary navigation links to `/blog`, `/notes`, `/journal`, and `/projects`; stages remain explanatory/filter dimensions.
- Ensure all shared UI labels come from the copy module and the document declares `lang="zh-CN"`.

### 6. Implement pages and content presentation

- Build the editorial homepage with Hero, Philosophy, optional Now, Praxis Practice Heatmap, and a small Latest Content selection.
- Build the type index route(s) with a shared typed query path; empty types should render intentionally.
- Build the type-first detail route with Markdown/MDX body, metadata, journey sections, and practiceLog timeline.
- Add a branded `404.astro`, canonical/meta helpers, and safe handling for unknown type/slug combinations.
- Keep all core reading and navigation functional without client-side JavaScript.

### 7. Add deployment boundary files

- Add a repeatable static build and document the artifact directory.
- Add an `infra/` example or deployment README that mounts/serves the artifact through the user's existing Caddy/Compose setup.
- Document the future `/api` proxy seam without adding FastAPI, PostgreSQL, a second proxy, or certificate management.
- Do not overwrite or assume the user's live Caddyfile, domain, or server filesystem layout.

### 8. Add verification and quality gates

- Unit tests: schema acceptance/rejection, type/stage/status normalization, journey accumulation, URL generation, practice-event normalization, de-duplication, and empty heatmap data.
- Browser smoke tests: home → a type index → Praxis detail, plus a missing route/404.
- Accessibility checks: keyboard navigation, focus visibility, semantic landmarks, reduced motion, and automated checks on Light/Dark core pages.
- Build tests: offline content/activity generation, strict type-check, lint/format, and static artifact inspection.
- Verify disabling JavaScript still permits core reading and navigation.

## Expected ownership boundaries

| Area | Owns | Must not own |
|---|---|---|
| `content/` | Markdown/MDX, journey, practiceLog | runtime UI or database records |
| content access layer | schema, normalization, queries, URL rules | page markup or network calls |
| page/components | presentation and accessible interaction | raw frontmatter parsing or duplicated filters |
| practice aggregator | deterministic event stream and generated JSON | Git history or external APIs |
| `infra/` | artifact/build/deployment documentation | live server secrets or replacement proxy stack |
| future `apps/api/` | dynamic capabilities under `/api/v1` | Markdown body as a competing source of truth |

## Validation commands to provide

The implementation must expose equivalent root commands (using the selected npm scripts):

```text
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
npm run check
```

`npm run check` should run the non-browser quality gates; `npm run build` must succeed without network access once dependencies are installed.

## Risk and rollback points

- If the current Astro content loader cannot read root-level `content/` cleanly, isolate an adapter rather than moving the source of truth into a database or duplicating files.
- If Tailwind integration changes between versions, keep tokens in CSS and replace only the integration layer; do not spread framework-specific color values through components.
- If theme persistence causes a flash or accessibility regression, retain the CSS/system default and remove the persistence enhancement.
- Generated practice JSON is disposable; deleting it and rebuilding must reproduce the same result from `content/`.
- Deployment examples must remain opt-in documentation. Never modify a live Caddy configuration without an explicit server-specific request.
- No implementation step may add FastAPI/PostgreSQL or make static article rendering depend on a future API.

## Final review gate before start

- Re-read the converged PRD and design for drift.
- Confirm there is exactly one production content entry and no demo articles.
- Confirm all initial practice kinds and four type fixtures are represented in tests.
- Confirm the generated heatmap has no external API dependency.
- Confirm `design.md`, this plan, and the Trellis specs are referenced by the pre-development context step.
