# Bug Analysis: ClientRouter soft navigation hides or detaches the theme toggle

## 1. Root Cause Category

- **Category:** E - Implicit Assumption, with a D - Test Coverage Gap contributor.
- **Specific Cause:** `theme-toggle.js` queried and bound the Header button only during its first evaluation. Astro
  `ClientRouter` replaces the Header or restores it from a history snapshot, so the current button could retain neither
  the original click handler nor a trustworthy ready state. Existing tests covered first-load theme behavior but not a
  shared Header control across a Knowledge soft navigation.

## 2. Why Fixes Failed

1. **Initial page-load rebinding:** Re-querying on `astro:page-load` fixed the visible disappearance, but a history
   snapshot could briefly expose stale DOM state before the lifecycle completed.
2. **Before-swap cleanup alone:** Clearing the outgoing node reduced stale animation state, but Astro may restore a
   snapshot captured before that mutation; cleanup could not be the only correctness mechanism.
3. **Over-eager regression timing:** Reading the changed URL was not proof that the DOM swap had completed. The test
   initially clicked while the new page lifecycle was still running and confused theme initialization with a binding
   failure.

## 3. Prevention Mechanisms

| Priority | Mechanism | Specific Action | Status |
| --- | --- | --- | --- |
| P0 | Architecture | Use one namespaced, delegated theme click listener that survives body swaps. | DONE |
| P0 | Lifecycle | Re-query current controls/metadata and reapply saved theme on every `astro:page-load`. | DONE |
| P0 | Test coverage | Exercise chapter to overview, theme switch, browser Back, page-load completion, and a second switch. | DONE |
| P1 | Documentation | Record shared-control ClientRouter rules in frontend hook and quality specs. | DONE |

## 4. Systematic Expansion

- **Similar issues:** Any body-rendered shared Header control that captures a DOM node once can fail after ClientRouter
  navigation. Document scripts with page-local listeners still need cleanup and re-initialization.
- **Design improvement:** Prefer persistent delegated handlers for controls present on every page; keep page-local
  observers and keyboard handlers behind idempotent lifecycle initialization.
- **Process improvement:** E2E navigation assertions must wait for `astro:page-load`, not only the URL, before validating
  post-swap behavior.

## 5. Knowledge Capture

- [x] Updated `.trellis/spec/frontend/hook-guidelines.md` with the shared-control lifecycle contract.
- [x] Updated `.trellis/spec/frontend/quality-guidelines.md` with the required regression path.
- [x] Updated the task PRD, design, implementation checklist, and `design-qa.md`.
- [x] Confirmed this repository has no project spec-template source to synchronize; the only `templates` directory is
  the installed Astro dependency under `node_modules`.
