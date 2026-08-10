# Knowledge workspace source findings

Date: 2026-08-10

## CC Switch reference

- Reference: `https://ccswitch.io/zh/docs?section=getting-started`.
- The `section` value is navigation state carried in the query string. It selects the visible documentation chapter while the canonical content URL remains the stable `/zh/docs` route.
- The documentation shell prioritizes search, a persistent left navigation rail, chapter grouping, and a reading column. The query state is shareable and survives a direct browser visit.
- Navigation controls remain ordinary links in the rendered document. Client-side behavior enhances transitions and filtering but is not required to resolve a chapter or article.
- The source rail uses a compact search control, icon-led rows, rounded active surfaces, and restrained spacing. Praxis adapts these relationships with existing copper, paper, typography, and Lucide tokens instead of copying CC Switch branding or runtime code.

## Astro progressive enhancement

- `ClientRouter` is used only inside the Knowledge documentation layout so the rest of the editorial site keeps its existing navigation behavior.
- `data-astro-prefetch="hover"` is applied to internal Knowledge links to warm likely destinations without changing the real `href` contract.
- `knowledge-docs.js` binds on the initial page and `astro:page-load`, cleaning prior listeners and observers before rebinding. This keeps search, `Ctrl/Meta + K`, Escape, and TOC behavior valid after soft navigation.
- Every Knowledge link is still a server-rendered `<a>` element. If JavaScript, prefetch, or ClientRouter is unavailable, the browser follows the same URL and receives the statically rendered HTML page.

## Praxis-specific decisions

- `/knowledge` remains a useful workspace overview and index, but the top-level “知识” link enters the first chapter directly with `?section=agent-app-development`.
- `section` is intentionally excluded from canonical metadata, RSS, sitemap entries, content IDs, and static route generation.
- Empty chapters keep their truthful empty state; the overview does not invent article counts or placeholder content.
