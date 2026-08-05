# Knowledge navigation design QA — refined pass

Date: 2026-08-04

## Comparison target

- Source visual truth: `.trellis/tasks/07-25-praxis-v0-1-public-release/evidence/knowledge-menu-reference.png`
- Browser-rendered implementation: `.trellis/tasks/07-25-praxis-v0-1-public-release/evidence/knowledge-menu-chevron-premium-desktop-open.png`
- Responsive evidence:
  - `.trellis/tasks/07-25-praxis-v0-1-public-release/evidence/knowledge-menu-chevron-premium-desktop-hover.png`
  - `.trellis/tasks/07-25-praxis-v0-1-public-release/evidence/knowledge-menu-chevron-premium-mobile-dark-320.png`

The source is a 482 × 478 px OpenAI navigation-reference crop in its expanded state. The current chevron evidence was
captured from `/knowledge` with the Knowledge disclosure open, hovered, and at a 320 px Dark-theme narrow viewport.
The final review relies on those current-state captures rather than the earlier side-by-side crop.

The reference informs the compact, scannable floating-menu pattern. The following deliberate deviations implement the
author's latest direction rather than copying its controls: Praxis keeps its warm-paper tokens and Chinese content,
removes the boxed Knowledge trigger, uses a small chevron to the text's right, and reduces the card width.

## State and evidence

- Desktop: Light theme, `/knowledge`, disclosure open through its native summary.
- Desktop menu: 320 × 378.875 CSS px, 12 px card radius, 0 px trigger border/padding/shadow, and normal 500-weight
  overview label by default. This reduces the former 384 px card width by about 17%.
- Narrow: 320 × 800 CSS px, Light and Dark themes, disclosure open. The rendered panel is 264.8 px wide inside a 305 px
  document client width; `scrollWidth === clientWidth`, so the panel produces no page-level horizontal overflow.
- Interaction: pointer click opened the native disclosure; a real nested `Agent 应用开发` link reached
  `/knowledge/agent-app-development`; the preview was restored to `/knowledge` afterward.
- Accessibility baseline: the menu remains a native `<details>/<summary>` containing real links. Keyboard focus uses the
  existing nav underline instead of a boxed ring on the Knowledge trigger; child-link focus still receives the global
  visible focus treatment. The progressive-enhancement script remains limited to hover, dismissal, Escape, and safe
  focus restoration.

## Findings

No actionable P0, P1, or P2 visual mismatch remains.

- Fonts and typography: menu labels use the established Praxis navigation stack at 0.875rem. Default labels—including
  `知识总览`—are 500 weight; hover and keyboard-focus rules raise only the active item label to 600. Descriptions stay at
  0.75rem/1.45 and are readable in both the 320 px captures without truncation.
- Spacing and layout rhythm: the trigger is now ordinary navigation text with a compact chevron on its trailing edge.
  The card is deliberately narrower, has 0.55rem of separation below the header, 0.7rem × 0.85rem item insets, fine
  dividers, and a contained scroll region. The 12 px radius and existing restrained shadow create the requested
  rounded floating-card hierarchy without altering the site's global editorial radii.
- Colors and visual tokens: the implementation retains the warm paper, ink, line, raised-surface, and brand-tint tokens.
  The overview no longer has a default tint or selected fill. The warm tint is reserved for hover/focus, preventing a
  false "preselected" destination while retaining an obvious interactive state.
- Image quality and assets: this control has no image content. No generated imagery, placeholder, image asset, CSS art,
  or emoji was introduced. The compact inline SVG chevron is decorative (`aria-hidden`) and local to the disclosure
  trigger rather than a new external asset.
- Copy and content: overview copy and all five section labels/descriptions remain registry-driven. The refinement adds no
  artificial content or third-level taxonomy.
- Icons and affordances: the compact `aria-hidden` chevron sits to the right of `知识`; the native `details/summary`
  semantics still own disclosure, keyboard, touch, and no-JavaScript behavior. This gives the requested arrow order
  without adding a separate icon asset or accessible-name noise.
- States and responsiveness: pointer click, nested-link navigation, Light/Dark, desktop hover, and 320 px open states
  were rendered. The compact menu stays within the narrow viewport without page-level horizontal overflow.

## Comparison history

1. The earlier pass retained a bordered, padded Knowledge trigger, a leading marker, a 384 px panel, a 2 px radius,
   always-bold labels, and a tinted overview. These were the issues named in the latest review.
2. The refined pass removes the trigger surface and its focus-box shadow, puts a compact decorative chevron on the
   right, reduces the panel to 320 px, applies a scoped 12 px radius, tightens spacing, removes default
   overview/current fills, and limits stronger weight plus brand tint to hover/focus.
3. Post-fix desktop hover and 320 px Dark captures confirm the compact rounded card, chevron position, no horizontal
   overflow, and readable text.

## Follow-up polish

- P3: if Praxis later adopts a shared icon family, the small inline chevron can be revisited for exact optical matching.
  The native `details/summary` behavior remains the robust no-JavaScript disclosure baseline.

## Implementation checklist

- [x] Removed the boxed Knowledge trigger while preserving an accessible text-level focus indication.
- [x] Put the compact decorative disclosure chevron to the right of the label.
- [x] Removed default overview emphasis and restricted stronger label weight/surface tint to hover or focus.
- [x] Reduced the card and made its corners deliberately rounded.
- [x] Captured and compared desktop open state, plus 320 px Light and Dark open states.
- [x] Verified a nested destination link and no horizontal overflow at 320 px.

## Current chevron and surface refinement

The native summary marker is hidden and a small, `aria-hidden` inline SVG chevron supplies a fixed down-facing
affordance beside the Knowledge label. The menu still uses native `<details>/<summary>` semantics and real nested links.

The panel now uses an opaque 88/12 raised-paper/brand-tint surface, the existing emphasis-line border and softer
dividers. Hover and keyboard focus use a clearer 40/60 raised-paper/brand-tint surface with a 2 px warm-copper leading
rail, so the interaction remains restrained but unmistakable. The fixed down chevron is optically lowered by `0.075em`
to sit naturally beside the Chinese label. Current evidence:

- `.trellis/tasks/07-25-praxis-v0-1-public-release/evidence/knowledge-menu-chevron-premium-desktop-closed.png`
- `.trellis/tasks/07-25-praxis-v0-1-public-release/evidence/knowledge-menu-chevron-premium-desktop-open.png`
- `.trellis/tasks/07-25-praxis-v0-1-public-release/evidence/knowledge-menu-chevron-premium-desktop-dark.png`
- `.trellis/tasks/07-25-praxis-v0-1-public-release/evidence/knowledge-menu-chevron-premium-mobile-dark-320.png`

final result: passed

## Theme toggle design QA — CC Switch reference

Date: 2026-08-05
Scope: shared Praxis header theme control only.

### Comparison target

- Source visual: user-provided [CC Switch reference](C:/Users/npp_c/AppData/Local/Temp/codex-clipboard-34881a1a-8691-4c63-a515-45e0ea917097.png), light theme, normal state, `1920 × 980`.
- Source behavior: `https://ccswitch.io/zh/docs?section=getting-started` (36px control, 12px radius, 20px outline icon, sequential 150ms exit/150ms entry on desktop).
- Implementation: `http://localhost:4321/`, captured in the in-app browser at the same `1920 × 980` viewport in light and dark themes.

The reference and the implementation were captured together in the same visual comparison input. The red rectangle in the reference is an annotation around the target, not part of the target control.

### Findings

No P0, P1, or P2 differences found in the scoped control.

| Fidelity surface        | Result                                                                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonts and typography    | No visible control text. The surrounding Praxis header typography remains unchanged.                                                                                                                                                                                          |
| Spacing and layout      | The control is exactly `36 × 36px` with a `12px` radius and remains clear of the primary navigation at desktop and 320px widths.                                                                                                                                              |
| Colors and tokens       | The source's muted, warm surface is reproduced with existing Praxis semantic color tokens rather than copying CC Switch's literal palette. Both light and dark surfaces preserve icon contrast.                                                                               |
| Icons and image quality | Inline `Moon` and `Sun` SVGs render at `20px` with a 2px line stroke; no runtime icon dependency or raster asset was introduced.                                                                                                                                              |
| Copy and accessibility  | The action-oriented Chinese `aria-label` and `title` continue to track the resolved next theme. Existing focus treatment, keyboard reachability, no-JavaScript fallback, and browser-chrome color sync remain intact.                                                         |
| Interaction states      | Fine-pointer hover scales to `1.1`, press scales to `0.95`, and desktop theme changes use the reference's sequential handoff: outgoing icon exits down over 150ms, incoming icon enters from above over the following 150ms. Touch and reduced-motion contexts swap directly. |
| Responsiveness          | Desktop and Pixel 7 Playwright runs pass, as does the 320px overflow regression.                                                                                                                                                                                              |

### Evidence

- `npm run check`: passed (76 unit tests).
- `npm run test:e2e`: passed (67 tests; 5 expected device-specific skips), including desktop sequential-handoff, touch direct-swap, geometry, icon-state, reduced-motion, no-JavaScript browser-chrome fallback, and handler-load-failure coverage.
- In-app browser inspection confirmed the normal light state, the dark-state sun glyph, 36px geometry, and label handoff at `1920 × 980`.

final result: passed
