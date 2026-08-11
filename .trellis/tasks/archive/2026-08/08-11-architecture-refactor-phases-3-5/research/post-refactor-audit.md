# Post-refactor audit

## Architecture

- Shared source modules remain narrow and do not own schema parsing, content queries, routes, SEO, or UI presentation.
- Knowledge projection is page-specific and does not become a repository/service layer.
- `ContentSummary` exposes facts, not display labels.
- Practice Heatmap projection is a deterministic view-model; generated Practice JSON remains independent.

## Dependencies

```text
Astro loader       -> shared source and identity primitives
Practice generator -> shared source and identity primitives
Knowledge pages    -> Knowledge view-model -> content query/domain
PracticeHeatmap    -> Heatmap view-model   -> practice facts
```

No reverse dependency or new import cycle was found in the reviewed changes.

## Behavior

- Public identity, routes, canonical URLs, RSS, Sitemap, draft/public policy, Markdown schema, and Practice JSON are
  unchanged.
- The final build emits 14 pages and the complete browser suite passes.
- The final Practice JSON hash matches the Phase 3 baseline exactly.
- Phase 5 homepage/Heatmap HTML comparison is byte-identical and the Heatmap style block is unchanged.

## Scope

All five commits remain independently reviewable. No empty future architecture directories, generic service layers,
or unrelated dead-code cleanup were introduced.
