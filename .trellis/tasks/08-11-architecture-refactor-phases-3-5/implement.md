# Architecture refactor phases 3-5 execution record

## Completed sequence

- [x] Freeze baseline behavior, generated Practice SHA-256, page count, and known format exceptions.
- [x] Unify source discovery, extension policy, normalized identity checks, and source-safety primitives.
- [x] Connect the Astro loader and Practice generator to the shared primitives.
- [x] Add watcher-path identity regression coverage through Astro's public `glob().generateId()` lifecycle.
- [x] Audit and extract Knowledge index/section/article projection into a focused feature model.
- [x] Pass `overviewHref` through `KnowledgeDocsLayout` without adding layout queries or route logic.
- [x] Remove presentation labels from `ContentSummary` and update only real label consumers.
- [x] Extract the pure Practice Heatmap view-model and move localized month labels out of `lib/practice.ts`.
- [x] Add focused unit coverage for identity, Knowledge models, ContentSummary consumers, and Heatmap projection.
- [x] Run post-refactor architecture, dependency, behavior, scope, and git-diff audits after each phase.

## Commits

| Phase | Commit | Subject |
|---|---|---|
| Phase 3 | `f4e1b6e` | `refactor: unify content source rules` |
| Phase 3 follow-up | `34ba1b4` | `fix: align content identity validation` |
| Phase 4A | `873b257` | `refactor: extract knowledge page projection` |
| Phase 4B | `b9e25fc` | `refactor: remove presentation labels from content summary` |
| Phase 5 | `2917e3d` | `refactor: extract practice heatmap view model` |

## Final validation

```text
modified-file Prettier: passed
git diff --check: passed
lint: passed
typecheck: 0 diagnostics
unit: 116 passed
generate:practice: passed
build: 14 pages
E2E: 80 passed / 8 skipped
Practice SHA-256: 6CE7DD3141BB04DF1E07A4B6701C1B4B5E887B1DFB03B84BB22432A29296C682
homepage HTML: byte-identical to Phase 5 baseline
Heatmap HTML: byte-identical to Phase 5 baseline
Heatmap CSS: no diff
```

## Stop point

Phase 5 is complete. This record does not start another architecture phase.
