# Routing and navigation

## Permanent namespaces

Content type is the first URL segment:

```text
/blog
/blog/:slug
/notes
/notes/:slug
/journal
/journal/:slug
/projects
/projects/:slug
```

`stage` is a filter/progress dimension and never appears in a permanent content path. A stage change must not break a
content link or a future record keyed by `contentId`.

## Route responsibilities

- The home route composes editorial sections and a small latest-content selection.
- A shared type-index route validates the type against the central registry and uses the content access layer.
- A shared detail route resolves `(type, slug)`, returns the custom 404 for unknown combinations, and renders typed body,
  metadata, journey, and practiceLog.
- Independent pages (`about`, `now`, `uses`, `search`) may be added without changing content namespaces.

## Navigation and filters

Use real links/forms for type and stage filters so the experience works without JavaScript. Do not create stage navigation
that implies three separate collections. Empty type indexes are valid and should use the centralized copy/empty-state component.

## Metadata and errors

- Set `lang="zh-CN"`, canonical URLs, title/description, and social metadata through a shared helper.
- Unknown type/slug combinations render the branded `404.astro`; do not leak stack traces or raw schema details to visitors.
- Invalid content metadata fails during build before a route can ship.

## Implemented route examples

The shared dynamic route is `apps/web/src/pages/[type]/[slug].astro`. Static paths are generated from the unified
collection and use the type path only for the first segment:

```typescript
return entries.map((entry) => ({
  params: { type: getContentPath(entry.data.type), slug: entry.data.slug },
  props: { contentId: entry.data.contentId },
}));
```

The detail page uses `getContentUrl(summary.type)` for its back link, so a stage change does not alter the permanent
URL. Unknown paths are handled by `apps/web/src/pages/404.astro`; no raw exception text is sent to visitors.
