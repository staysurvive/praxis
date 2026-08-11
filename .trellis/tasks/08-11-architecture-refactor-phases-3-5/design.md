# Architecture refactor phases 3-5 design

## Scope

This document records the architecture already implemented and reviewed in commits `f4e1b6e`, `34ba1b4`, `873b257`,
`b9e25fc`, and `2917e3d`. It does not expand the completed scope.

## Phase 3: authored content source boundary

```text
Markdown files
    -> shared source/file/identity primitives
        -> Astro Content Collection -> Website
        -> Practice Generator       -> generated Practice JSON
```

- `source-reader.ts` owns authored file discovery and source identity uniqueness checks.
- `file-policy.ts` owns candidate and `.md`/`.mdx` extension policy.
- `identity-normalizer.ts` is a pure normalization primitive. It only trims `contentId` and `slug` and delegates type
  recognition to `isContentType`; it is not a second schema.
- `content-loader.ts` wraps Astro's public `glob` loader. Initial-load identities are accumulated and checked after the
  source loader completes. Incremental add/change calls are checked inside the public `generateId` callback against
  `DataStore`, excluding the candidate file's previous entry. Unlink remains owned by Astro.
- `generate-practice-data.ts` shares discovery and identity normalization, then performs schema parsing and Practice
  aggregation. Shared primitives do not parse Markdown, frontmatter, routes, SEO, or UI copy.

## Phase 4A: Knowledge projection boundary

```text
Astro Content Collection
    -> content query/domain facts
        -> features/knowledge/model.ts
            -> Knowledge pages/layout
                -> Knowledge components
```

`features/knowledge/model.ts` owns page-level projection: sidebar sections and counts, recent entries, current state,
TOC items, adjacent sections, layout metadata, and final navigation hrefs. It does not scan Markdown, parse
frontmatter, or implement route rules. Pages retain `getStaticPaths`, route inputs, rendering, and Astro responses.
Components receive typed props and render them without querying the collection.

## Phase 4B: ContentSummary presentation boundary

`ContentSummary` is `ContentFrontmatter` plus collection `id` and canonical `url`. It does not carry localized
`typeLabel`, `stageLabel`, or `statusLabel` fields. Consumers that render labels map raw domain values through `uiCopy`;
Knowledge-specific labels belong in the Knowledge view-model. No generic presentation adapter was introduced.

## Phase 5: Practice Heatmap projection boundary

```text
PracticeDataset and calendar facts
    -> buildPracticeHeatmapViewModel(dataset, endDateKey)
        -> PracticeHeatmap.astro
```

The pure view-model owns the fixed 53-week projection, visible-window statistics, reverse-ordered recent eight events,
week/month label placement, localized month labels, and accessibility summary. `lib/practice.ts` retains event
normalization, dataset construction, calendar cells, intensity levels, and numeric month positions. The component
retains rendering-only date/copy formatting and unchanged markup/CSS.

## Dependency rules

- Pages/components may depend on feature models; feature models may depend on content/practice facts.
- Content/practice domain modules must not depend on feature models or components.
- `source-reader.ts` and `identity-normalizer.ts` must not depend on Astro pages, route resolution, presentation, or
  Practice aggregation.
- Generated Practice JSON remains a domain artifact and never consumes the Heatmap view-model.

## Compatibility and rollback

Each phase is independently revertible by commit. Any future change that alters identity, URL, HTML, CSS, or Practice
JSON semantics must be planned as a new task instead of being folded into these projection boundaries.
