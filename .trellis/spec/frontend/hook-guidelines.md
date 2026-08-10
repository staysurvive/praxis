# Browser enhancement guidelines

## Scope

Praxis is an Astro site, not a React application. React-style hooks and a hook-based state library are not part of the
frontend architecture. Browser behavior belongs in a small script or an explicitly justified hydrated island.

## Allowed enhancements

- A theme control may read/write a namespaced `localStorage` preference after the CSS/system default is available.
- Production browser code that must satisfy `script-src 'self'` lives as external files under `public/scripts/`. The
  head-level theme initializer remains a blocking classic script so the saved theme is applied before body rendering.
- Browser chrome must retain a no-JavaScript system-theme fallback: `BaseLayout.astro` emits media-qualified light/dark
  `data-theme-color-fallback` metas plus a disabled `data-theme-color-override`. Once either theme script runs, it
  disables both fallbacks and enables the override with the resolved color. Do not collapse this back to one static
  `theme-color` meta, or a system-dark no-JavaScript page will retain light browser chrome.
- A progressively enhanced control stays hidden until its own handler has bound and set its ready data attribute. The
  document-level `.js` class proves only that the head initializer ran; it must not make an independently loaded
  control visible. Cover both the no-JavaScript metadata fallback and an aborted component-script request in E2E.
- A future interactive feature may call an API client under `/api/v1`, but it must render a useful failure state and never
  gate the Markdown page.
- Keep scripts narrowly scoped, typed, and colocated with the component or under `src/scripts/` when shared.
- Knowledge document behavior may use Astro `ClientRouter` as progressive enhancement. Any document script that binds
  search, keyboard shortcuts, or table-of-contents state must listen for `astro:page-load`, clean up listeners and
  observers from the previous document, and leave real links usable when the router or script is unavailable.
- When query navigation contains an `item`, the statically rendered article and its authored `knowledgeSections` own
  the active state. On `astro:page-load`, normalize a stale valid `section` query with `history.replaceState`; never
  rewrite direct canonical `/knowledge/:key` visits or invent a section for unassigned content.

### ClientRouter DOM replacement contract

Shared controls rendered inside the page body, including the site Header theme toggle, are replaced or restored from
history snapshots when `ClientRouter` swaps documents. Their external scripts must therefore be page-lifecycle aware
even when the control is not specific to Knowledge:

- keep one namespaced global state object with an idempotent `init` function;
- run `init` on the initial script evaluation and on every `astro:page-load`;
- on `astro:before-swap`, remove the outgoing control's ready/transition attributes and listeners so a cached DOM node
  cannot advertise stale readiness when browser history restores it;
- prefer one globally registered delegated listener for a shared control that exists on every page; otherwise remove
  listeners from the previous DOM node before rebinding;
- re-query the current control and any replaced head metadata inside `init`, rather than retaining first-page nodes;
- reapply the saved explicit theme during `init`, because ClientRouter may replace the root `data-theme` attribute;
- set the control's ready attribute only after its current DOM node has a working event handler;
- if ClientRouter evaluates the external script again, call the existing global `init` and return without registering a
  second document-level lifecycle listener.

```javascript
// Wrong: ClientRouter replaces this node, leaving the new control hidden and unbound.
const button = document.querySelector('[data-theme-toggle]');
button?.addEventListener('click', toggleTheme);

// Correct: one delegated handler survives swaps; each page load marks the current node ready.
window.__praxisThemeToggle ??= { init };
document.addEventListener('click', handleThemeClick);
document.addEventListener('astro:before-swap', teardown);
document.addEventListener('astro:page-load', window.__praxisThemeToggle.init);
window.__praxisThemeToggle.init();
```

## Data fetching

- Build-time content and Practice Heatmap data are loaded from the local content boundary, not from browser fetches.
- Do not fetch GitHub or another external activity service.
- Do not add polling, client caches, or a global server-state library to the first slice.

## Naming and review

- Name browser modules after behavior (`theme-toggle.ts`, `copy-link.ts`), not generic `use*` names.
- If the theme follows the system preference, subscribe to `matchMedia` changes so the button's action label remains
  accurate. An explicit saved theme continues to override the system value.
- Document the progressive-enhancement fallback in the component and test the no-JavaScript path.
- Remove an enhancement if the same experience can be expressed with semantic HTML/CSS.
