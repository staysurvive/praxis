# Architecture refactor phases 3-5

## Goal

Record and preserve the approved architecture refactor that unified authored content source rules, moved Knowledge
page orchestration into a focused projection model, removed presentation labels from `ContentSummary`, and extracted
the Practice Heatmap view-model without changing public behavior.

## Requirements

- Keep `apps/web`; do not introduce future API, service, database, worker, or AI directories.
- Keep `features/` narrow: only real page/view-model projections belong there.
- Share authored source discovery, extension policy, path normalization, and identity validation between the Astro
  content loader and Practice generator without reimplementing Astro parsing or collection behavior.
- Preserve existing `contentId`, `type:slug`, article slug, Knowledge section slug, route resolution, canonical URL,
  RSS, Sitemap, draft/public semantics, Markdown schema, and generated Practice JSON.
- Keep `ContentSummary` limited to content facts plus collection `id` and canonical `url`; presentation labels belong
  to explicit consumers or feature-specific projection models.
- Keep Knowledge pages responsible only for route inputs, model invocation, composition, and Astro response concerns.
- Keep components responsible for typed rendering and interaction, not collection queries or business statistics.
- Move Heatmap visible-window statistics, recent-event projection, localized month labels, and accessibility summary
  into a pure deterministic Practice-specific view-model.
- Do not change homepage/page visuals, markup semantics, CSS, animations, routes, SEO, RSS, Sitemap, or Practice JSON.
- Keep historical Prettier failures outside this refactor's diff; all modified files must pass Prettier.

## Acceptance Criteria

- [x] Astro loader and Practice generator consume the shared source rules.
- [x] Loader initial load and official `glob().generateId()` watcher path enforce the same normalized identity rules.
- [x] Identity normalization reuses only `contentId.trim()`, `slug.trim()`, and existing content-type semantics.
- [x] Knowledge index, section, and article projection live in `features/knowledge/model.ts`.
- [x] `ContentSummary` contains no type/stage/status display labels.
- [x] Heatmap projection lives in `features/practice/heatmap-model.ts` and is independently unit tested.
- [x] Unit tests pass: 116/116 on the final Phase 5 state.
- [x] Typecheck reports 0 diagnostics; build emits 14 pages.
- [x] E2E passes: 80 passed / 8 skipped.
- [x] Practice JSON SHA-256 remains
  `6CE7DD3141BB04DF1E07A4B6701C1B4B5E887B1DFB03B84BB22432A29296C682`.
- [x] Homepage and Heatmap HTML are byte-identical to the frozen Phase 5 baseline; Heatmap CSS has no diff.
- [x] Each phase is preserved as an independent commit.

## Notes

This task was created after implementation because the original multi-phase work predated Trellis task registration.
It is a synchronization record, not authorization for a new refactor phase.
