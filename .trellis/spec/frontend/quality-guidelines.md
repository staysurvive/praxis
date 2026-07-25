# Frontend quality guidelines

## Required checks

The root project must expose equivalent commands for formatting, linting, strict type-checking, unit tests, browser
smoke tests, and static build. The foundation task names them `format:check`, `lint`, `typecheck`, `test:unit`,
`test:e2e`, `build`, and `check`. Dependency auditing is an explicit networked gate through `audit:deps`, not part of
the offline-capable `check` command.

## Test coverage

- Schema fixtures: valid entries for all four types, invalid metadata, cumulative journey data, and empty production lists.
- Domain units: type/stage/status filters, type-first URL generation, practice-kind registry, publish de-duplication,
  multiple events on a day, and proof that `updatedAt` alone has no effect.
- Browser smoke: home → a type index → the real Praxis project detail, plus a missing route/404.
- Accessibility: keyboard navigation, visible focus, landmarks/headings, reduced motion, color-independent heatmap
  summary, and basic automated checks in both themes.
- Responsive: run the normal mobile project and a 320px regression; the document must not scroll horizontally. A wide
  heatmap may scroll only inside `.heatmap-scroll`.
- Build: deterministic offline activity JSON and a static artifact that can be served without FastAPI/PostgreSQL.
- Security: drafts are absent from every public projection; production HTML has no inline scripts or styles; `SITE_URL`
  rejects unsafe origins; Caddy returns a real 404 with security headers; the final export image has no known CVEs.

## Forbidden patterns

- Shipping a page that requires SSR, a backend, an external API, or JavaScript to read authored content.
- Publishing fake demo articles to satisfy visual coverage.
- Bypassing content validation, swallowing build errors, or logging secrets/user content into client output.
- Introducing a blog template, large UI kit, monorepo orchestrator, or second reverse proxy without a new approved scope.

## Review checklist

- Does the change preserve the unified content model and stable `contentId`?
- Does it keep `stage` out of permanent URLs?
- Are copy, tokens, and filters reused from their owning modules?
- Are Light and Dark, mobile, keyboard, no-JavaScript, and empty states covered?
- Is any generated data clearly derived and reproducible from `content/`?

## Verified commands and source examples

The final foundation check runs:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run audit:deps
npm run build
npm run test:e2e
docker build -f infra/Dockerfile.web -t praxis-web-check .
docker scout cves local://praxis-web-check
```

The current browser suite is `apps/web/tests/e2e/site.spec.ts`; it covers the homepage, type-first navigation, empty
states, branded 404, theme persistence, no-JavaScript reading, 320px/mobile Chromium, Light/Dark Axe checks, keyboard
focus, reduced motion, and public discovery endpoints. Unit fixtures in `apps/web/tests/fixtures/content.ts` cover all
four content types without publishing those fixtures.

> **Narrow viewport gotcha**: do not apply a fixed `min-width: 20rem` to `html`. At a 320px outer viewport, the
> vertical scrollbar reduces the document client width below 20rem and creates page-level horizontal scrolling. Let
> the document shrink; use an explicit small-screen header layout and keep the heatmap's overflow on its own container.

### Validation and error matrix

| Condition | Boundary | Expected result |
|---|---|---|
| Invalid frontmatter/date/type | `contentSchema` / build generator | Build fails with source path and field issue |
| Duplicate `contentId` or type/slug | `generate-practice-data.ts` | Build fails before static output |
| Draft contains private practice notes | `buildPublicPracticeDataset` | Notes and counters are absent from public JSON/UI |
| Unsafe `SITE_URL` | `resolveSiteUrl` | Astro config load fails before generating metadata |
| Unknown public path | `404.astro` | Branded 404 with safe navigation copy |
| Unknown path behind Caddy | `handle_errors` | Branded document with HTTP 404, never a soft 404 |
| Empty type or activity list | `EmptyState.astro` / `PracticeHeatmap.astro` | Intentional empty state, no fake content |
| Future API outage | isolated API island | Static Markdown/detail content remains readable |

### Wrong vs correct

```astro
<!-- Wrong: route parses raw frontmatter and duplicates URL rules. -->
<a href={`/projects/${entry.data.slug}`}>{entry.data.title}</a>

<!-- Correct: content access returns a typed summary with one URL helper. -->
<ContentCard entry={summary} />
```
