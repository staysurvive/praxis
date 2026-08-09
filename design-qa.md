# Knowledge sidebar CC Switch source-based design QA

Date: 2026-08-09
Scope: shared left navigation on every `/knowledge/*` child page.

## Comparison Target

- Source URL: `https://ccswitch.io/zh/docs?section=getting-started`.
- Source implementation analysis: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/ccswitch-source-analysis.md`.
- User reference crop: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/ccswitch-sidebar-reference.png`.
- Current Praxis crop supplied by the user: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/praxis-sidebar-current.png`.
- Browser source capture: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/ccswitch-docs-light-1280x720.png`.
- Pre-fix Praxis capture: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/praxis-docs-sidebar-before-light-1280x720.png`.
- Final Light Praxis capture: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/praxis-docs-sidebar-after-light-1280x720.png`.
- Final Dark Praxis capture: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/praxis-docs-sidebar-after-dark-1280x720.png`.
- Final mobile Praxis capture: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/praxis-docs-sidebar-after-mobile-light-390x844.png`.
- Full same-view comparison: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/comparison-sidebar-light-1280x720.png`.
- Focused same-region comparison: `.trellis/tasks/08-09-knowledge-sidebar-ui-polish/research/comparison-sidebar-focus-light.png`.

The source and final desktop implementation were both captured by the Codex in-app Browser at a `1280 x 720` CSS
viewport and saved as `1280 x 720` PNGs at the same scroll position (`scrollY = 0`). No density normalization was
required. The source is Light theme with `getting-started` active; the implementation is Light theme with
`agent-app-development` active. The focused comparison crops the left `320 x 560` region from both equal-size captures.

## Findings

No actionable P0, P1, or P2 mismatch remains.

- **Information architecture:** CC Switch uses one search control followed by a flat icon-led product-navigation rail.
  Praxis now uses the same hierarchy for Knowledge overview, five stable chapters, and two real recent entries. Praxis
  deliberately keeps direct route links instead of copying CC Switch's JavaScript buttons and nested content tree.
- **Fonts and typography:** the source uses Inter at 14-16px; Praxis keeps its system sans stack and uses 14px nav copy
  at `1.45` line height. The result matches the source density without replacing the site's editorial serif reading
  system or downloading a remote font. Letter spacing remains `0` in all new controls.
- **Spacing and layout rhythm:** source measurement established an `18rem / 288px` rail, approximately 44px search,
  40px primary rows, 12px radii, 12px inner gaps, and 4px row rhythm. The final implementation computes to `288px`,
  `44px`, `40px`, `12px`, and `4px` respectively. The wide three-column shell and first-viewport content alignment
  remain intact.
- **Colors and visual tokens:** CC Switch uses `rgb(238 234 226)` paper and a warm primary at 10% opacity. Praxis keeps
  its `rgb(244 241 234)` paper and maps the current state to the existing copper brand tint. Dark uses the same semantic
  roles and remains designed rather than inverted.
- **Icons and image quality:** every visible rail icon comes from `lucide-astro`, matching the source's Lucide family at
  16px with 1.8px strokes. No CC Switch Logo, inline SVG, custom SVG, CSS drawing, emoji, placeholder, or generated image
  was introduced. The interface has no content imagery to reproduce.
- **Copy and content:** all Praxis labels and chapter descriptions remain registry/copy driven. Chapter numbers remain in
  the reading header; repetitive visible zero counts were removed from the visual rail while truthful count phrases
  remain in screen-reader-only text.
- **States and interactions:** current chapter and article use a rounded tinted surface plus changed text/icon color.
  Hover, visible focus, `Ctrl/Meta + K`, live-result filtering, Escape reset, native mobile disclosure and TOC behavior
  work. Recent article labels truncate visually but retain full text and a `title` fallback.
- **Responsiveness and accessibility:** the `390 x 844` open state shows all chapter descriptions and a native summary;
  320px and project-mobile browser regressions report no page overflow. One H1, real links, `aria-current`, no-JavaScript
  navigation and Light/Dark Axe scans remain valid.

## Comparison History

1. The user-provided pre-fix state had four P2 issues: no navigation icons, a table-like row system, visible repeated
   numbers/zero counts, and square selected/search surfaces that did not match the supplied source.
2. Source inspection confirmed CC Switch's actual React/Tailwind/Lucide contract and measured the active control geometry.
3. The first implementation pass added Lucide icons and new markup, but an old long-running dev server served stale CSS;
   the browser showed icons with legacy square styles. Restarting the server applied the intended scoped styles; this
   was preview state, not a production-code fix.
4. The post-restart focused comparison confirms equal rail width, search geometry, row height, icon rhythm, rounded
   current surface and compact hierarchy. Dark, article-current and mobile-expanded states found no remaining P0/P1/P2.

## Interaction And Automated Checks

- `Ctrl+K` focused `#knowledge-filter-input`.
- Filtering `安全` left one visible item and announced `已显示 1 个知识入口`; Escape restored all seven entries.
- Browser console contained no warnings or errors on the local implementation.
- Focused Prettier: passed after formatting the dependency manifest.
- Lint: passed.
- Astro TypeCheck: 68 files, zero diagnostics.
- Unit: 77/77 passed.
- Build: 14 pages.
- Full E2E: 74 passed with 6 expected device-specific skips.
- `git diff --check`: passed with line-ending notices only.

## Follow-up Polish

No P3 is required for this pass. A future full-text search modal should be a separate feature only after the content
volume justifies it; this iteration intentionally preserves the lighter in-page filter.

final result: passed
