# Phase 6B Journey Experience - Technical Design

## Architecture

```text
PracticeDataset + ContentSummary[]
              -> features/journey/model.ts
              -> journey.astro + JourneyTimeline + PracticeHeatmap presentation mode
```

The feature model is a pure projection. It accepts already-loaded facts, builds a strict
`contentId` map, projects aggregate counts and date groups, and returns display-neutral facts plus
existing source URLs. Astro loading stays at the page boundary.

## Projection Contract

- `JourneyViewModel` exposes `totalEvents`, `activeDays`, `contentCount`, `hasEvents`, and descending
  day groups.
- Each projected event preserves `kind`, `note`, `source`, and its dataset order within the day.
- Source facts come from the matching `ContentSummary`: title, type, and existing `url`.
- The component derives localized kind/type labels from `uiCopy`.
- A publish event without a note receives a minimal source-title-based presentation fallback.
- A missing `ContentSummary` throws with the missing `contentId`; it is never silently omitted.

## UI Composition

- Journey-specific compact hero: existing Journey artwork, H1, role statement, aggregate facts, and
  an in-page trajectory link.
- Journey Heatmap mode: same dataset/calendar/view-model, with homepage-only aggregate header and
  recent-event details omitted. Homepage defaults do not change.
- Journey timeline: reverse-chronological day groups and stable event rows with descriptive source
  links. Milestone remains text, not gamification.
- Empty data: one Journey empty state; no Heatmap or timeline.

## Compatibility

- Do not edit `lib/practice.ts`, `features/practice/heatmap-model.ts`, content schema, generator, or
  URL helpers.
- Do not change the default `PracticeHeatmap` output used by the homepage.
- Do not alter route paths, canonical URLs, RSS/Sitemap/robots, or generated JSON bytes.

## Risks And Rollback

- Presentation-mode regression: default props retain the current homepage markup and behavior;
  verify homepage output and E2E coverage.
- False ordering: reverse day groups only; retain source order inside each day.
- Sparse data: render all current events without invented summaries or pagination.
- Each implementation step is independently revertible; stop immediately on a regression outside
  the approved boundary.
