# Phase 6B Journey Experience - Implementation Plan

## 1. Baseline Freeze

- Record clean Git state, Journey route/HTML behavior, relevant tests, Heatmap behavior, and Practice
  JSON SHA-256.
- Verify no baseline command writes product files.

## 2. Journey Projection

- Add `apps/web/src/features/journey/model.ts`.
- Add focused unit tests covering all approved join, grouping, fallback, ordering, milestone,
  determinism, empty, and missing-source cases.
- Run modified-file Prettier check, Journey unit tests, lint, and typecheck.
- Roll back only this step if any gate exposes a Phase 6B regression.

## 3. Journey Presentation

- Add Journey copy through `config/copy.ts`.
- Add `components/JourneyTimeline.astro`.
- Add a backward-compatible Journey presentation mode to `PracticeHeatmap.astro`; do not modify its
  view-model.
- Replace `pages/journey.astro` empty composition with compact hero, conditional Heatmap, timeline,
  and honest empty state.
- Validate Journey and homepage HTML plus focused unit/type gates before continuing.

## 4. Browser And E2E Coverage

- Update Journey-specific E2E expectations and add trajectory, source-link, keyboard, reduced-motion,
  light/dark, responsive, touch/scroll, and no-overflow checks.
- Inspect 320x800, 390x844, 768x1024, and 1440x900 with the in-app browser.
- Do not correct unrelated findings.

## 5. Full Validation And Audit

- Run Prettier on intentionally modified product/test files only.
- Run `git diff --check`, lint, typecheck, unit, `generate:practice`, build, and E2E.
- Recompute the Practice JSON SHA-256 and compare it exactly to the approved baseline.
- Review diff stat/status and perform a Phase 6B scope/architecture audit.
- Do not commit unless separately authorized.
