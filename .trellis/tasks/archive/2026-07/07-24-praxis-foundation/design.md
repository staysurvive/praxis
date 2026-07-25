# Praxis blog foundation — technical design

## Status

Converged technical design. User approval was received and the design is implemented in the first static vertical
slice. The remaining workflow work is commit review.

## Architectural invariants

1. Git-managed Markdown/MDX is the source of truth for articles, notes, and logs.
2. Public content must remain buildable and readable without FastAPI or PostgreSQL.
3. FastAPI and PostgreSQL are optional dynamic capabilities, not a content CMS.
4. Dynamic records reference a stable `contentId`; URL slugs may change without breaking those references.
5. Frontend and backend communicate through an explicitly versioned API boundary.
6. The frontend uses Astro, strict TypeScript, and MDX with static output as the default.
7. The project starts from Astro's official base scaffold, not a blog template or third-party theme.
8. Client-side JavaScript is introduced only for explicit interactive features.
9. The repository uses a lightweight monorepo boundary without a task orchestrator.
10. Deployment reuses the existing Docker Compose and Caddy environment.
11. The first release does not add Kubernetes, Swarm, a second reverse proxy, or a second HTTPS solution.

## Repository layout

Selected boundary:

```text
apps/web/       Astro application (implemented now)
apps/api/       reserved FastAPI boundary (future; not implemented now)
content/        Markdown/MDX source of truth
infra/          deployment and reverse-proxy configuration
```

The repository must remain usable with ordinary package and shell commands. Do not add Turborepo, Nx, or another
monorepo orchestrator until multiple independently built applications create a demonstrated need.

## Intended system boundary

```text
Markdown/MDX in Git
        |
        v
Static content build and frontend
        |
        +---------------- public pages remain independent
        |
        v
Optional /api/v1 calls
        |
        v
FastAPI ---- PostgreSQL
comments / identity / analytics / AI state
```

The initial task implements only the content and frontend portion. Backend directories or contracts may be reserved,
but no database or dynamic service is required for the first deployable slice.

Astro generates the public content site as static files. Future interactive islands may call FastAPI, but those calls
must degrade independently and must not determine whether an article can render.

## Content contract

Every publishable entry must have at least:

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

Entries may additionally record meaningful activity:

```yaml
practiceLog:
  - date: date
    kind: publish | learn | practice | reflect | milestone
    note: optional string
```

Entries may also carry a cumulative knowledge-and-practice summary:

```yaml
journey:
  question: optional rich text
  thinking: optional rich text
  action: optional rich text
  outcome: optional rich text
  reflection: optional rich text
  nextStep: optional rich text
```

`type` and `stage` are orthogonal. `type` describes what the entry is; `stage` describes where its thinking/practice
journey currently sits. `journey` is cumulative and intentionally not a discriminated union by stage: fields can be
added or left empty as the same content matures. The schema may grow through additive optional fields, while the stable
identity and common metadata remain compatible. `practiceLog` is a separate event timeline and is not a replacement for
the durable `journey` summary.

The initial type set is `blog`, `note`, `journal`, and `project`. Adding a type should require only an enum/configuration
addition and presentation rules, not a second collection, schema, or query implementation.

The content access layer should expose shared operations such as:

```text
listEntries({ type?, stage?, status?, tag? })
getEntryBySlug(type, slug)
getEntryByContentId(contentId)
```

`practiceLog` is an optional explicit authoring record for meaningful practice. `publishedAt` is normalized into the
initial `publish` event; `updatedAt` and Git commit history never create activity automatically. Typographic,
formatting, and other maintenance edits therefore do not inflate the practice metrics. If an explicit `publish` entry
exists for the publication date, it enriches/replaces the synthetic event instead of creating a duplicate count.

The initial event-kind registry contains `publish`, `learn`, `practice`, `reflect`, and `milestone`. The registry owns
labels, visualization semantics, and validation so that adding a future kind requires one central configuration change
rather than duplicated conditional logic. The normalized event stream retains `contentId`, content `type`, `stage`,
event date, event kind, and optional note for future aggregation dimensions.

## URL and navigation contract

Content type is the first-level navigation and URL namespace:

```text
/blog
/blog/{slug}
/notes
/notes/{slug}
/journal
/journal/{slug}
/projects
/projects/{slug}
```

Stage is a filter/progress dimension and must not be part of a permanent content URL. Independent pages such as
`/about`, `/now`, `/uses`, and `/search` may be added without changing the content namespaces.

## Frontend architecture

Selected stack:

- Astro official base scaffold.
- TypeScript in strict mode.
- Markdown and MDX content.
- Astro content collections or the current official typed content API for schema validation and queries.
- Static output; no SSR adapter in the initial task.

Customization constraints:

- Do not install or fork a blog theme/template.
- Build layout primitives, design tokens, typography, navigation, and content components inside Praxis.
- Open-source blogs may inform patterns, but copied component trees and visual identities are out of scope.
- Framework components and client hydration require a concrete interaction need; plain Astro components are the default.

Minimum boundary:

- Route-level pages for home, type listing, content detail, and 404.
- A content access layer owns schema validation and queries; page components do not parse raw frontmatter directly.
- Presentational components receive typed data and do not perform network calls.
- No global client state library in the first task.
- Dynamic features are isolated behind API client modules when introduced.
- Core content and navigation work without client-side JavaScript.

## Deployment boundary

The selected deployment shape is a static Astro build served by the user's existing Docker Compose and Caddy
environment. Caddy remains the HTTPS and reverse-proxy entry point. A future `/api` route can be forwarded to FastAPI
without changing the public web architecture.

The deployment contract must expose a repeatable Web build, a static artifact directory, and a future `/api` proxy seam;
it must not require FastAPI or PostgreSQL for the first public content release.

Do not introduce Kubernetes, Swarm, a second reverse proxy, or a second certificate-management solution for this task.

## Content collection decision

The selected model is one typed content collection with both `type` and `stage` enums. The additive `journey` object
and optional `practiceLog` allow one entry to move through the three phases without changing its stable `contentId` or
becoming a database record.

The URL decision is settled: type-first URLs with stage as a filter rather than a permanent path segment.

## Homepage information architecture

The homepage is an editorial brand landing page, not a stage directory. Its job is to establish the author's
"知行合一" thesis, explain the relationship between "知而思、思而行、行而成", and provide evidence of ongoing
practice before offering a small latest-content selection.

The first-slice page structure is:

1. Hero — the Praxis name, "知行合一" statement, and concise personal introduction.
2. Philosophy — an explanatory composition for the three stages; these are conceptual sections, not route links.
3. Now (optional) — the current learning or practice focus, hidden or empty without content.
4. Praxis Practice Heatmap — locally derived content activity as evidence of sustained practice.
5. Latest Content — a deliberately small, chronological selection linking to type-first URLs.

The primary navigation links to type indexes (`/blog`, `/notes`, `/journal`, `/projects`). The homepage may use
anchors for its own sections, but it must not imply that stages are independent content areas.

The Praxis Practice Heatmap is generated exclusively from the repository's own Markdown/MDX content and explicit
practice records. It must not call GitHub or any other external activity API. The initial build scans `content/`,
normalizes practice events, writes deterministic static JSON, and renders an explicit empty state when no events exist.

```text
content/ Markdown and MDX
        |
        v
typed content access layer
        |
        v
practice activity aggregator
        |
        v
generated static JSON
        |
        v
Praxis Practice Heatmap
```

A future FastAPI/PostgreSQL service may enrich the same Praxis-owned activity stream with streaks, daily totals, or
type breakdowns. External contribution services must not become the source of truth.

## Visual system baseline

The visual direction is a productized editorial system optimized for long-term reading and maintenance:

- Use a shared responsive grid and generous whitespace rather than ornamental layouts.
- Treat Chinese reading metrics (measure, font size, line height, paragraph rhythm, and heading density) as first-class
  tokens, separate from display typography.
- Design Light and Dark themes as two intentional palettes with equivalent hierarchy, contrast, and focus states.
- Keep the palette restrained: a durable neutral foundation and a small number of semantic accent colors; avoid gradients
  that compete with content.
- Limit motion to purposeful entrance, scroll feedback, and data visualization states, with reduced-motion support.
- Make the Philosophy and Praxis Practice Heatmap components reinforce the practice narrative instead of becoming a dashboard.
- Borrow quality criteria from mature products without copying their brand language, layouts, or component trees.

Theme selection should work with a no-JavaScript default (system preference and a stable CSS fallback). A small hydrated
control may remember an explicit user choice, but theme switching must not be required to read or navigate the site.

## Language boundary

The first slice is Simplified Chinese only, with `zh-CN` as the site default and no locale-prefixed routes. Code-facing
identifiers, URL segments, content types, and enum values remain English.

Shared interface copy must live in a typed centralized module or configuration object. Navigation labels, status names,
empty states, accessibility labels, and common actions must not be embedded as structural assumptions inside reusable
components. Editorial prose and Markdown content remain content, not UI-copy keys.

The first slice does not install an i18n runtime, generate translated routes, or implement bilingual SEO. The HTML
language, Chinese date formatting, and locale-sensitive metadata are driven by a default locale configuration so a
future English copy bundle can reuse page and component structure.

## CSS and design-token implementation

Use Tailwind CSS as a constrained layout utility layer, not as the design language. Tailwind may cover responsive
containers, grid/flex composition, alignment, and basic spacing. CSS Custom Properties are the source of truth for
semantic color, typography, type scale, reading measure, spacing scale, radii, shadows, motion, focus rings, and both
theme palettes.

Components should combine a small number of readable Tailwind classes with component-scoped CSS where a pattern has
meaningful visual behavior. Avoid arbitrary-value utilities for recurring decisions, long opaque class strings, and
third-party UI component kits. Theme-aware values must resolve through semantic tokens, so Light and Dark remain
independently designed rather than one being a color inversion of the other.

## First production content

The only production content required by the foundation slice is a long-lived `project` entry for Praxis itself. It is
not disposable demo copy: the same stable `contentId` will continue to accumulate product reasoning, architecture,
development activity, outcomes, and reflection through Markdown, `journey`, and `practiceLog`.

The homepage Latest Content, project detail route, and Practice Heatmap must all consume this shared real entry through
the content access layer. Coverage for all four content types and invalid metadata belongs in isolated test fixtures;
empty production type indexes render intentional empty states rather than synthetic articles.

## Future API minimum boundary

Base path: `/api/v1`.

The future backend begins with:

```text
GET /api/v1/health
```

Later capabilities should be grouped by stable content identity, for example:

```text
/api/v1/content/{contentId}/comments
/api/v1/content/{contentId}/views
/api/v1/assistant/...
```

Success envelope:

```json
{
  "data": {},
  "error": null,
  "meta": { "requestId": "..." }
}
```

Error envelope:

```json
{
  "data": null,
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Safe user-facing message"
  },
  "meta": { "requestId": "..." }
}
```

## Error-handling minimum

- Invalid Markdown/MDX metadata fails validation before deployment.
- Missing public routes render a branded 404 page.
- Optional backend failures must not make article content unavailable.
- Client messages are safe and actionable; diagnostics and stack traces remain server-side.
- API errors use stable codes and include a request ID for correlation.

## Test minimum

- Static analysis: formatting/lint and strict type checking.
- Content tests: valid fixtures pass and invalid metadata fails schema validation.
- Unit tests: content mapping, stage/status normalization, URL generation, practice-event aggregation, and empty heatmap data.
- Practice-event fixtures: all initial kinds, automatic first publish, multiple events on one day, and proof that
  `updatedAt` alone does not change counts; an explicit initial `publish` entry must not double-count the synthetic event.
- Journey fixtures: a content entry that begins with a question and later contains action, outcome, reflection, and
  next-step fields without changing its `contentId`, slug namespace, or schema shape.
- Browser smoke test: home → type listing → content detail, plus 404.
- Accessibility smoke: keyboard navigation and basic automated accessibility checks on core pages.
- Future backend: unit tests plus API contract/integration tests against a disposable PostgreSQL database.

## Implementation record

- User approved the planning artifacts before implementation began.
- `apps/web`, the single production `content/projects/praxis.mdx` entry, and `infra/` deployment examples are present.
- The final checks include `npm run check`, `npm run build`, `npm run test:e2e`, and a Dockerfile plus Compose artifact
  build. Docker test images and the temporary Compose volume were removed after verification.
