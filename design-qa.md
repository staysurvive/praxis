# Knowledge documentation workspace design QA

Date: 2026-08-10
Scope: `/knowledge`, all `/knowledge/*` chapter/article pages, shared Knowledge navigation, route context, and progressive enhancement.

## Source visual truth

- Live reference: `https://ccswitch.io/zh/docs?section=getting-started`.
- Source implementation notes: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/ccswitch-source-analysis.md`.
- User reference: `.trellis/tasks/08-10-knowledge-docs-workspace-routing/research/user-reference-knowledge-section.png`.
- Source capture: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/ccswitch-docs-light-1280x720.png`.

The CC Switch source was inspected for information architecture and visual relationships rather than copied as a brand asset. The key verified relationships are a compact search-first rail, icon-led chapter rows, rounded active state, a stable reading column, and a shareable `section` query state.

## Implementation evidence

- Overview, Light, 1920 × 1080: `.trellis/tasks/08-10-knowledge-docs-workspace-routing/research/knowledge-overview-light-1920x1080.png`.
- Overview, Light, mobile 390 × 844: `.trellis/tasks/08-10-knowledge-docs-workspace-routing/research/knowledge-overview-light-390x844.png`.
- Chapter, Light, 1920 × 1080: `.trellis/tasks/08-10-knowledge-docs-workspace-routing/research/knowledge-section-light-1920x1080.png`.
- Chapter, Dark, 1920 × 1080: `.trellis/tasks/08-10-knowledge-docs-workspace-routing/research/knowledge-section-dark-1920x1080.png`.
- Full-view comparison: `.trellis/tasks/08-10-knowledge-docs-workspace-routing/research/comparison-knowledge-section-light-page.png`.
- Focused sidebar comparison: `.trellis/tasks/08-10-knowledge-docs-workspace-routing/research/comparison-knowledge-sidebar-light.png`.

Source and implementation browser captures were taken at the stated CSS viewport sizes with the browser chrome excluded from the comparison. The focused comparison uses the same left navigation region and scroll position; the full-view comparison keeps the complete first viewport so hierarchy and whitespace can be judged together.

## Findings

- **Typography:** Praxis retains the existing system sans UI stack and editorial serif reading treatment. Navigation copy stays compact and readable; no remote font or CC Switch type asset was introduced.
- **Spacing and layout:** The documentation shell uses a stable three-column desktop rhythm: approximately 288px navigation, a flexible reading column, and a narrow page TOC. Search and nav rows use the source-derived 44px/40px geometry with 12px radii and 4px row rhythm. Mobile collapses the rail into native disclosure behavior without introducing horizontal overflow at 320px.
- **Colors and tokens:** Light mode keeps Praxis paper and copper tokens; Dark mode maps the same semantic roles instead of using a raw inversion. Active rows use a restrained copper tint, with text and icon state changes as a second signal.
- **Icons and imagery:** Navigation icons use the existing `lucide-astro` package. No hand-drawn SVG, emoji, CC Switch logo, remote image, or placeholder artwork was added to the Knowledge shell.
- **Copy and content:** Chapter labels, descriptions, counts, article titles, and recent updates come from the content registry. Empty chapters remain truthful empty states. The rail hides repetitive visible zero counts while retaining accessible count text.
- **Interaction and accessibility:** Real links preserve shareable URLs and work without JavaScript. `aria-current`, visible focus, keyboard disclosure, `Ctrl/Meta + K`, Escape reset, live filter status, TOC highlighting, browser history, and ClientRouter page-load rebinding were exercised. The shared Header theme control uses one delegated listener, clears outgoing state before swaps, and only marks the current control ready after page-load initialization. Reduced-motion and forced-colors behavior remain supported.
- **Routing:** The top-level “知识” entry opens the workspace overview at `/knowledge?section=agent-app-development`; the disclosure and start-reading action still enter the default chapter. Canonical URLs remain query-free.

## Comparison history

1. The prior Knowledge entry page duplicated the editorial hero and made users take an unnecessary overview-to-chapter step.
2. The sidebar polish pass adopted the verified source geometry, icon hierarchy, rounded current state, and lighter content density while preserving Praxis identity.
3. The current pass replaces the old overview composition with the Knowledge workspace, adds section-aware links, and scopes Astro ClientRouter plus hover prefetch to documentation pages.
4. A parallel E2E theme-animation assertion was made deterministic by capturing the transition in the same browser task; this does not alter runtime behavior.
5. A ClientRouter regression exposed that the shared Header DOM is replaced or restored from history snapshots. The theme control now re-queries current metadata on page load, uses a single delegated click listener, clears outgoing ready/animation state, and has a chapter-to-overview-to-Back regression test.

## Automated verification

- Changed-file Prettier check — passed. The repository-wide `npm run format:check` still reports 66 pre-existing baseline files outside this change set, so they were not bulk-rewritten.
- `npm run lint` — passed.
- `npm run typecheck` — passed: 69 files, zero diagnostics.
- `npm run test:unit` — passed: 78 tests across 6 files.
- `npm run build` — passed: 14 static pages.
- Focused Knowledge E2E — passed on Chromium and mobile Chromium.
- Focused ClientRouter theme lifecycle E2E — passed 10/10 concurrent repetitions.
- Full E2E — passed: 77 tests passed, 7 expected project/device skips.
- No-JavaScript navigation, Light/Dark, mobile, reduced-motion, forced-colors, Axe, history/back, prefetch attributes, and 320px overflow checks are covered by the suite.

No actionable P0, P1, or P2 visual or interaction mismatch remains for this scope.

final result: passed
