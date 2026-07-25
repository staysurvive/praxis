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

## Public discovery contract

### 1. Scope / Trigger

This contract applies when adding or changing a public route, content metadata, RSS, Sitemap, robots, production
`SITE_URL`, or the Caddy static-serving boundary. These outputs share one canonical origin and must remain deterministic
static build artifacts.

### 2. Signatures

`BaseLayout.astro` owns document metadata:

```typescript
interface Props {
  title: string;
  description?: string;
  canonicalPath?: string;
  seoType?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  tags?: readonly string[];
  noindex?: boolean;
}
```

Static discovery endpoints use Astro's endpoint signature:

```typescript
export const GET: APIRoute = async ({ site }) => Response;
```

Build configuration validates the canonical origin before Astro loads:

```typescript
resolveSiteUrl(value?: string): string;
```

### 3. Contracts

- `SITE_URL` is the canonical build-time origin. It must be HTTPS, contain no credentials/path/query/fragment, and may
  use HTTP only for `localhost`, `127.0.0.1`, or `[::1]`. Local/test builds may use `https://praxis.example`; production
  must supply the real HTTPS origin.
- `siteConfig.discovery.rssPath` is `/rss.xml`; `siteConfig.discovery.sitemapPath` is `/sitemap-index.xml`.
- `/rss.xml` consumes `listEntries()`, which excludes drafts, and emits summary-only items with canonical links,
  `publishedAt`, type label, and tags.
- `/robots.txt` allows public crawling and points to the Sitemap URL derived from `Astro.site`.
- Sitemap includes public HTML routes and excludes `/404`, generated data, and `.xml`/`.txt` endpoints.
- `BaseLayout` emits website metadata by default. Content detail explicitly supplies article dates/tags; 404 supplies
  `noindex`.
- Caddy redirects trailing-slash and direct `index.html` variants to the no-trailing-slash canonical path. Query-aware
  matchers preserve non-empty query parameters, while query-free requests do not gain a trailing `?`. Existing clean
  paths are served without a redirect.
- Missing files must enter `handle_errors`, rewrite to `/404.html`, and retain HTTP 404. Never use `/404.html` as a
  successful final `try_files` candidate.
- Production Caddy sends CSP, frame, MIME-sniffing, referrer, permissions, and HSTS headers. Define those headers in the
  project-scoped `praxis_security_headers` snippet and import it in both the normal route and `handle_errors`; error
  routes do not inherit the normal response-header handler automatically. Theme scripts remain external and Astro builds with
  `inlineStylesheets: 'never'`, so neither `script-src` nor `style-src` requires `unsafe-inline`.

### 4. Validation & Error Matrix

| Condition | Owner | Expected result |
|---|---|---|
| Missing Astro `site` | RSS/robots endpoint | Build fails with an explicit Chinese configuration error |
| Invalid/insecure/ambiguous `SITE_URL` | `resolveSiteUrl` | Astro config load fails before routes or metadata build |
| Draft content | `listEntries()` | Entry is absent from RSS and public content routes |
| Unknown route in Astro preview or Caddy | `404.astro` / Caddy `handle_errors` | HTTP 404, branded page, `noindex, nofollow` |
| `/projects/` or `/projects/index.html` | Caddy canonical redirects | Permanent redirect to `/projects`, query preserved |
| XML/TXT/generated endpoint | Sitemap filter | Endpoint is omitted from `sitemap-0.xml` |
| Placeholder origin in production | release checklist | Deployment remains blocked until `SITE_URL` is explicit |

### 5. Good / Base / Bad Cases

- Good: a published project appears once in RSS/Sitemap, Caddy serves its clean URL directly, and all metadata uses the
  validated origin.
- Base: an empty content type still has an index route in Sitemap but contributes no RSS item.
- Bad: a page hard-codes `https://praxis.example`, accepts an HTTP production origin, parses raw frontmatter for RSS,
  lets 404/JSON enter Sitemap, or serves `/404.html` through `try_files` with status 200.

### 6. Tests Required

- E2E: assert homepage and detail canonical/Open Graph/Twitter/RSS discovery metadata.
- Unit: reject non-HTTPS public origins, credentials, paths, queries, fragments, and malformed `SITE_URL` values.
- E2E: assert article publish/update/tag metadata and visible footer RSS link.
- E2E: assert RSS has only real non-draft items and canonical absolute links.
- E2E: assert Sitemap includes all public HTML namespaces and excludes 404, RSS, robots, and generated JSON.
- E2E: assert robots points to `sitemap-index.xml` and missing routes return 404 plus noindex.
- E2E: assert production HTML contains external theme scripts and no inline scripts or `<style>` blocks.
- Build/Docker: assert `rss.xml`, both Sitemap files, `robots.txt`, `404.html`, and content HTML exist in the exported artifact.
- Caddy smoke: validate the Caddyfile; assert clean paths are 200, variants redirect without losing queries, unknown paths
  are branded 404 responses, immutable assets are cached, and security headers are present.

### 7. Wrong vs Correct

```typescript
// Wrong: route-specific origin and raw collection parsing drift from public queries.
const link = `https://praxis.example/projects/${entry.data.slug}`;

// Correct: validated summaries and Astro.site own the canonical boundary.
const entries = await listEntries();
return rss({ site, items: entries.map((entry) => ({ link: entry.url })) });
```

```caddyfile
# Wrong: this rewrites a missing path to an existing file and returns a soft 404.
try_files {path} /404.html

# Correct: let file_server raise 404, then render the branded document in the error route.
try_files {path} {path}.html {path}/index.html
handle_errors {
	@notFound expression {http.error.status_code} == 404
	rewrite @notFound /404.html
	file_server
}
```
