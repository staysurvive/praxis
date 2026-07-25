# Browser enhancement guidelines

## Scope

Praxis is an Astro site, not a React application. React-style hooks and a hook-based state library are not part of the
frontend architecture. Browser behavior belongs in a small script or an explicitly justified hydrated island.

## Allowed enhancements

- A theme control may read/write a namespaced `localStorage` preference after the CSS/system default is available.
- A future interactive feature may call an API client under `/api/v1`, but it must render a useful failure state and never
  gate the Markdown page.
- Keep scripts narrowly scoped, typed, and colocated with the component or under `src/scripts/` when shared.

## Data fetching

- Build-time content and Practice Heatmap data are loaded from the local content boundary, not from browser fetches.
- Do not fetch GitHub or another external activity service.
- Do not add polling, client caches, or a global server-state library to the first slice.

## Naming and review

- Name browser modules after behavior (`theme-toggle.ts`, `copy-link.ts`), not generic `use*` names.
- Document the progressive-enhancement fallback in the component and test the no-JavaScript path.
- Remove an enhancement if the same experience can be expressed with semantic HTML/CSS.
