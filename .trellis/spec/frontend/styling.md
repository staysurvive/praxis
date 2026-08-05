# Styling and design tokens

## Division of responsibility

Tailwind CSS is a constrained layout utility layer for containers, responsive breakpoints, Grid/Flex composition,
alignment, and basic spacing. It is not the source of truth for the visual language.

CSS Custom Properties define semantic tokens for:

- Light and Dark color roles, surfaces, borders, text, accents, and focus rings
- Chinese body measure, type scale, heading rhythm, and display typography
- spacing/grid scale, radii, shadows, motion durations/easing, and heatmap levels

Components may add short scoped CSS for meaningful visual patterns. Do not introduce a large UI library or CSS-in-JS.

## Theme rules

- Both themes are intentionally designed and tested; Dark is not a mechanical inversion.
- CSS/system preference is the no-JavaScript baseline. A small enhancement may persist an explicit user choice.
- Components reference semantic variables (`--color-surface`, `--color-text`, etc.), not raw hex values or theme-specific
  assumptions.
- Respect `prefers-reduced-motion`; motion must support comprehension and never be required for navigation.

## Maintainability

- Prefer readable utility groups and named component classes over opaque class strings.
- Avoid recurring arbitrary-value utilities; add or adjust a token when a value is a design decision.
- Keep article measure and typography separate from marketing/display layout so long Chinese prose remains comfortable.
- Check focus, hover, disabled, empty, and high-contrast-adjacent states in both themes.

## Implemented token examples

`apps/web/src/styles/tokens.css` defines the semantic palette and typography used by components. Components reference
roles rather than hard-coded theme colors:

```css
:root {
  --color-page: #f4f1ea;
  --color-text: #211e1a;
  --color-accent: #8c3b26;
}

[data-theme='dark'] {
  --color-page: #171512;
  --color-text: #ece6da;
  --color-accent: #d98e6b;
}
```

Tailwind is used for composition such as `grid`, `gap-*`, and responsive breakpoints; meaningful patterns such as
`.rule-scotch`, `.article-prose`, and `.heatmap-cell` remain named component styles in `global.css` or the Astro files.

## Editorial magazine patterns

The v0.1 visual language is editorial (warm paper, ink rules, serif display type, flat 2px radii — "杂志感").
Recurring patterns are named component classes in `apps/web/src/styles/global.css`; reuse them instead of rebuilding
per page:

- `.rule-scotch` / `.page-section` — a 2px ink rule over a 1px hairline (a scotch rule) marks every section
  threshold. `.page-section` also increments the `section-folio` counter that `.eyebrow--folio::before` renders as
  `01 —`, `02 —` …; adding a homepage section renumbers automatically.
- `.display-title` / `.section-title` — serif display type from system stacks only (Georgia + Source Han Serif SC
  fallbacks in `--font-serif`). Webfonts are forbidden: the CSP allows no third-party origins and pages must not pay
  a font download.
- `.article-prose` — long-form Chinese body sets `text-align: justify`, `text-justify: inter-character`,
  `line-break: strict`, and `hanging-punctuation: allow-end` at `--measure-cjk` (36em); headings and blockquotes
  reset to `text-align: left`.
- `.text-link::before { inset: -0.65rem 0 }` — an invisible hit-area extension yields comfortable tap targets
  without moving a pixel; prefer this over padding hacks that shift layout.
- The practice heatmap opens scrolled to the newest weeks without JavaScript: the scroll container is
  `direction: rtl` while the inner grid restores `direction: ltr`. Do not replace this with a scroll script — the
  page must land on current data with JavaScript disabled.
- A `display: grid` section that contains a horizontally scrollable component must define its content track as
  `minmax(0, 1fr)` (or give its direct grid item `min-width: 0`). Otherwise the grid's automatic minimum can expand
  the document to the heatmap's intrinsic width. Keep overflow on `.heatmap-scroll`; never hide it at page level.
- Radii are intentionally flat (`--radius-sm/md/lg: 2px`) and `--shadow-soft: none`; depth comes from rules and
  surface tints, not shadows or rounding.
- `ThemeToggle.astro` is a deliberate scoped exception for the shared header: it is a `36px` square with a `12px`
  radius, modeled on CC Switch. Keep its warm muted surface token-based and do not generalize this radius to editorial
  cards, rules, or article surfaces.
