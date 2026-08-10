# State management

## Default state model

The first release has no global client state. Public content is resolved at build time from Markdown, and the
Practice Heatmap is generated as deterministic static JSON. Astro page props and typed content queries are the primary
data flow.

## State categories

- **Build-time state:** content entries, journey, practiceLog, normalized activity, navigation metadata, and UI copy.
- **URL state:** canonical namespace, content/section slug, the short-alias Knowledge `section` context, public article
  `item`, or project hash, and future filter/search parameters; URL state must be serializable and shareable. An
  unassigned article uses `item` without a fabricated `section`. Legacy `type` appears only in the five exact
  compatibility addresses. Navigation context must not fork the canonical content identity.
- **Ephemeral browser state:** theme preference or an explicitly interactive control, kept local to that control.
- **Future server state:** comments, identity, views, and assistant data behind `/api/v1`; isolate it in an API client and
  never make article rendering depend on it.

## Rules

- Do not add a global store, React context, or client cache for static content.
- Compute derived lists and heatmap totals in the content/practice layer, not separately in each page.
- Keep filters accessible as links/forms so the core experience works without JavaScript.
- If a future API island fails, preserve the static page and expose a safe, concise status message.

## Common mistakes

- Re-fetching content in the browser that Astro already built.
- Copying the same filtered-entry logic into home, index, and detail pages.
- Storing a theme choice without a system/CSS fallback and causing a flash of unreadable content.
