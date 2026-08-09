# Knowledge documentation CC Switch refinement design QA

Date: 2026-08-09
Scope: every `/knowledge/*` child page, covering five fixed section pages and two public articles.

## Comparison target

- Source visual truth: `.trellis/tasks/08-09-knowledge-docs-architecture/research/ccswitch-docs-refinement-reference.png`
- Pre-refinement comparison: `.trellis/tasks/08-09-knowledge-docs-architecture/research/comparison-refinement-before.png`
- Final Light section capture: `.trellis/tasks/08-09-knowledge-docs-architecture/research/implementation-refinement-section-light-1280x720.png`
- Normalized Light section capture: `.trellis/tasks/08-09-knowledge-docs-architecture/research/implementation-refinement-section-light-1280x659-normalized.png`
- Final section comparison: `.trellis/tasks/08-09-knowledge-docs-architecture/research/comparison-refinement-after.png`
- Focused navigation comparison: `.trellis/tasks/08-09-knowledge-docs-architecture/research/comparison-refinement-navigation-focus.png`
- Final article comparison: `.trellis/tasks/08-09-knowledge-docs-architecture/research/comparison-refinement-article-after.png`
- Article theme evidence: `.trellis/tasks/08-09-knowledge-docs-architecture/research/implementation-refinement-article-light-1280x720.png` and `.trellis/tasks/08-09-knowledge-docs-architecture/research/implementation-refinement-article-dark-1280x720.png`

The source is a `1920 x 989` Light-theme CC Switch documentation screenshot. The Codex in-app Browser rendered the
implementation at a `1280 x 720` CSS viewport with device scale factor `1.25`; its presentation surface returned a
`1265 x 712` raster. The source was downsampled to `1280 x 659`. The implementation raster was normalized to
`1280 x 720` and cropped to the first `659` pixels for a same-pixel, first-viewport structural comparison. The full
comparison is `2560 x 723`, including a 64px evidence header.

The screenshots do not claim pixel fidelity between two identical CSS viewports. They are used to compare proportion,
hierarchy, first-viewport alignment, navigation density, palette, and state treatment. Exact current geometry is locked
separately by browser tests at both `1536 x 900` and `1920 x 1021`.

Primary states are `/knowledge/agent-app-development` in Light and `/knowledge/ai-code-security-review` in Light and
Dark, all at scroll position zero. The short `1280 x 720` state intentionally uses the non-sticky fallback so neither
rail becomes an inaccessible nested scroll container.

## Findings

No actionable P0, P1, or P2 mismatch remains.

- **Information architecture:** the implementation preserves the reference's search-first left rail, dominant center
  reading column, and active right TOC. Praxis adds a truthful overview and recent-entry group without changing the
  stable five-chapter taxonomy.
- **Fonts and typography:** CC Switch uses a compact sans-serif product-doc hierarchy. Praxis intentionally keeps
  sans-serif navigation and serif editorial display headings. The refined header removes excess top space, starts the
  title within the first viewport, keeps CJK wrapping readable, and uses `letter-spacing: 0` throughout new components.
- **Spacing and layout rhythm:** the shell now caps at `108rem`, about 90% of a 1920px viewport. Wide tracks target a
  `20rem` rail, flexible main column, and `18rem` TOC. The search, main heading, and TOC title share a coordinated first
  viewport start. Section and article block gaps are smaller, while long-form measure remains unchanged.
- **Navigation density:** desktop chapter rows are compact single-line entries containing stable chapter number, title,
  and an unpadded real count. Descriptions remain in filter data and reappear in the narrow disclosure. The focused
  comparison confirms a readable current surface and brand rail without copying CC Switch icons or arrows.
- **Colors and visual tokens:** the sampled reference paper is approximately `rgb(238 234 226)`; Praxis retains its
  established lighter paper `rgb(244 241 234)`, ink, copper accent, semantic dividers, and designed Dark theme. This is
  an intentional brand adaptation, not palette drift.
- **Image and asset fidelity:** the documentation shell needs no content imagery. The supplied Praxis brand asset remains
  unchanged. CC Switch's logo and category icons were not copied or replaced with fake glyphs, CSS drawings, emoji, or
  handcrafted SVGs.
- **Copy and content:** the five chapters keep their real names, introductions, and topic scopes. Counts reflect explicit
  membership only; both existing articles remain unclassified, and empty chapters remain truthful.
- **Responsiveness and scrolling:** full E2E covers 1920px, 1536px, the project mobile viewport, and 320px. Wide rails
  are sticky only when the viewport is tall enough; short-height and narrow states return to document flow. There is no
  page-level horizontal overflow and no avoidable desktop rail scrollbar.
- **Accessibility:** one H1, landmarks, native disclosures, real links, `aria-current`, `aria-live`, visible focus,
  no-JavaScript navigation, reduced motion, and Light/Dark Axe scans all remain intact.

## Focused comparison

The navigation crop is necessary because the full comparison makes row density, count formatting, and current-state
treatment too small to judge. It confirms the reference's compact vertical rhythm while preserving Praxis's numbered
taxonomy. No additional focused asset crop is required because neither design uses content imagery in this viewport;
the full section and article comparisons clearly expose heading, rule, paragraph, and TOC alignment.

## Interaction and browser checks

- `Ctrl+K` focused the knowledge filter.
- Filtering with `安全` left one visible entry and announced `已显示 1 个知识入口`.
- `Escape` cleared the query, restored all seven entries, and removed focus from the input.
- The first article TOC link updated the URL hash and received `aria-current="location"`.
- Theme switching reached Dark and returned to Light; clean captures were taken after reload to remove focus chrome.
- At `1280 x 720`, both rails computed to `position: static`; tall desktop geometry tests require sticky rails.
- Browser logs contained no warning or error.

## Comparison history

1. The pre-refinement evidence showed four P2 differences: a narrow centered shell, a late-entering main title, verbose
   two-line desktop chapter rows with ambiguous `00` counts, and nested desktop rail scrolling.
2. The refinement expanded the shell to `108rem`, reset the three wide tracks, aligned first-viewport starts, hid the
   visual filter label on desktop while retaining its accessible name, compacted chapter rows, rendered unpadded counts,
   preserved descriptions on narrow screens, reduced vertical gaps, and replaced rail scrolling with a short-height
   non-sticky fallback.
3. Post-fix section, article, focused-navigation, Light, and Dark evidence found no remaining P0/P1/P2. No visual fix
   was applied after this final comparison.

## Automated verification

- Focused Prettier: passed for every task-owned source, test, spec, and QA file.
- Lint: passed.
- Astro typecheck: passed, 68 files and zero diagnostics.
- Unit tests: passed, 77/77.
- Static build: passed, 14 pages.
- Full built-preview Playwright: passed, 74 tests with 6 expected device-specific skips.
- `git diff --check`: passed.
- Repository-wide `format:check` still reports 73 pre-existing CRLF checkout differences in untouched files; no
  task-owned file is part of that baseline failure.

## Follow-up polish

No P3 item is required for this pass. Full-text search and chapter iconography remain intentionally outside the scope.

final result: passed
