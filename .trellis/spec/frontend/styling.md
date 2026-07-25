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
  --color-page: #f3f1eb;
  --color-text: #1d1d1a;
  --color-accent: #a14f3d;
}

[data-theme='dark'] {
  --color-page: #11110f;
  --color-text: #f1eee5;
  --color-accent: #d78067;
}
```

Tailwind is used for composition such as `grid`, `gap-*`, and responsive breakpoints; meaningful patterns such as
`.surface-card`, `.article-prose`, and `.heatmap-cell` remain named component styles in the Astro files.
