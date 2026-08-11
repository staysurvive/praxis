# Phase 6B Journey Experience

## Goal

Turn the empty Journey route into a truthful, data-backed practice trajectory that shows how
authored practice accumulates over time and resolves to its exact Knowledge or Project source.

## Requirements

- Consume the existing public Practice dataset and Content Collection without changing either
  contract.
- Add a pure Journey view-model that joins events to `ContentSummary` by `contentId`, groups days
  newest-first, preserves the existing within-day event order, and fails on missing sources.
- Keep explicit `practiceLog` events and synthetic `publishedAt` events semantically distinct.
- Use existing source URLs; never infer relationships from dates, copy, tags, stages, or titles.
- Replace the Journey empty hero with a compact trajectory introduction backed by derived counts.
- Reuse the Phase 5 Heatmap architecture in a Journey presentation mode without changing homepage
  behavior or `buildPracticeHeatmapViewModel()`.
- Render an accessible day-grouped timeline with truthful notes, publication fallbacks, milestones,
  and descriptive source links.
- Render one honest empty state and hide the Heatmap/timeline when there are no events.
- Preserve all routes, schemas, generated Practice JSON, SEO/RSS/Sitemap/robots behavior, and every
  non-Journey page.
- Keep presentation labels in the existing copy layer and keep localized copy out of domain code.

## Acceptance Criteria

- [x] `/journey` renders the real 11-event dataset instead of the old empty state.
- [x] Aggregate values are derived and the primary action anchors to the Journey trajectory.
- [x] Events are grouped by date descending without claiming a time-of-day order.
- [x] Every event resolves to its exact source content and correct existing Knowledge/Project URL.
- [x] Missing source content fails deterministically instead of producing a fallback URL.
- [x] Synthetic publish events use source-title fallback copy and remain identifiable as synthetic.
- [x] The Journey timeline exposes active-day facts without requiring Heatmap hover.
- [x] 320x800, 390x844, 768x1024, and 1440x900 have no page-level horizontal overflow.
- [x] Light/dark, keyboard, touch, and reduced-motion checks pass.
- [x] Focused Journey tests plus full lint, typecheck, unit, build, and E2E gates pass.
- [x] Generated Practice JSON SHA-256 remains
  `6CE7DD3141BB04DF1E07A4B6701C1B4B5E887B1DFB03B84BB22432A29296C682`.
- [x] Git diff contains only Journey implementation, focused tests, and Trellis task/spec records.

## Out Of Scope

- Homepage, Knowledge, Projects, About, navigation, global design system, routes, schemas, generators,
  Practice domain/Heatmap view-model, SEO, RSS, Sitemap, robots, APIs, databases, state management,
  dependencies, inferred cross-content relationships, historical stage transitions, and gamification.
