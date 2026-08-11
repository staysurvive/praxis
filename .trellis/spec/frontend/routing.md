# Routing and navigation

## Permanent namespaces

Public information architecture is independent from the legacy content-form `type`:

```text
/knowledge
/knowledge/:key       # one resolver owns five section slugs and every non-project content slug
/projects
/projects#<slug>      # default project identity and inline body
/projects/praxis-foundation  # the only historical project-detail exception
/journey
/about
```

`stage`, `status`, content form, and knowledge section are orthogonal and never create additional permanent route
families. A stage or section change must not break a canonical link or a future record keyed by `contentId`.

Exactly five legacy addresses are compatibility-only HTML pages: `/blog`, `/notes`, and `/journal` target
`/knowledge`; `/notes/ai-code-security-review` and `/journal/what-green-gates-miss` target their matching knowledge
canonical. The static candidate emits `noindex`, canonical, and immediate meta refresh. Production Caddy GET 301 and
online single-hop verification remain an external deployment gate; do not add wildcards or a general alias system.

## Route responsibilities

- The home route composes editorial sections and a small latest-content selection.
- `/knowledge` renders the central five-section registry plus all public non-project content in recent-update order.
- `/knowledge/[key]` is the single route owner for both reserved section slugs and canonical knowledge details; builds
  fail on section/content or content/content slug collisions.
- `/projects` renders every public project at a stable slug anchor and inlines Markdown for every project except the
  one historical detail. The remaining `[type]/[slug]` owner emits only that exception.
- `/journey` projects the existing public Practice dataset into a truthful trajectory joined to canonical
  `ContentSummary.url` values; with no events it renders one honest empty state. `/about` consumes only the confirmed
  site identity. Neither creates a new content type or route family.

## Navigation and filters

Primary navigation is the explicit ordered list Knowledge, Projects, Journey, About; it is never derived from
`contentTypes`. The visible Knowledge label enters the document-workspace overview at `/knowledge`, and its adjacent
native disclosure arrow contains exactly the five registry-backed section links; do not repeat a Knowledge-overview
menu item or nest the link inside `summary`.
The overview is the primary Knowledge entry, while the disclosure, chapter cards, and start-reading action may link
directly to `/knowledge?section=<short-alias>`. Knowledge article navigation uses the public article slug as `item`;
assigned articles include their first authored section alias, while unassigned articles truthfully use
`/knowledge?item=<slug>` without inventing a chapter. Projects, Journey, and About remain direct links. The Knowledge label uses
`aria-current="page"` on `/knowledge` and `aria-current="location"` on section/article descendants; the matching
section link uses `page` within the nested link set. The icon-only disclosure has its own accessible name but no
competing current-page state. Direct primary links use `page` on an exact route and `location` on a descendant. All
navigation, section entries, empty-state exits, and detail return paths are real links and work without JavaScript; the
menu enhancement may only add fine-pointer hover, outside-close, and Escape behavior. The `section` query is navigation
context only and never changes canonical metadata, content selection, RSS, or Sitemap output.

Astro dev, the project `npm run preview` static server, and production Caddy internally dispatch valid query navigation
to the existing static `/knowledge/:key` artifact without changing the browser URL. `item` selects content and its
authored metadata selects the active chapter; a stale valid section context is normalized by the Knowledge page
lifecycle. Unknown aliases, unknown items, unsafe item slugs, item values that collide with the five reserved section
slugs, duplicate selectors, and unsupported query keys must return the branded 404 rather than a successful overview.
Canonical metadata, RSS, Sitemap, and direct compatibility paths remain path based.

## Metadata and errors

- Set `lang="zh-CN"`, canonical URLs, title/description, and social metadata through a shared helper.
- Unknown type/slug combinations render the branded `404.astro`; do not leak stack traces or raw schema details to visitors.
- Invalid content metadata fails during build before a route can ship.

## Implemented route examples

`ContentSummary.url` is computed once by the shared public resolver and is consumed by pages, cards, metadata, and RSS:

```typescript
const summary = toContentSummary(entry);
return summary.url; // knowledge canonical, project anchor, or the one project-detail exception
```

Knowledge details return to their first explicitly assigned section when one exists, otherwise to `/knowledge`, without
changing the canonical detail URL. The historical project detail returns to `/projects`. Unknown paths are handled by
`apps/web/src/pages/404.astro`; no raw exception text is sent to visitors.

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
resolveProductionSiteUrl(value?: string): string;
```

### 3. Contracts

- `SITE_URL` is the canonical build-time origin. `resolveSiteUrl` accepts HTTPS origins and local HTTP only for
  `localhost`, `127.0.0.1`, or `[::1]`; local/test builds may use `https://praxis.example`.
- `npm run build:production` and `infra/Dockerfile.web` invoke `resolveProductionSiteUrl` before the export build.
  Production requires an explicit,
  normalized HTTPS origin that is neither a local host nor any canonical form of the `praxis.example` placeholder
  (including case, trailing slash/dot, or default-port variants).
- `siteConfig.discovery.rssPath` is `/rss.xml`; `siteConfig.discovery.sitemapPath` is `/sitemap-index.xml`.
- `/rss.xml` consumes `listEntries()`, which excludes drafts, and emits summary-only items with canonical links,
  `publishedAt`, type label, tags, and `<guid isPermaLink="false">contentId</guid>` so a canonical migration is not a
  new feed identity.
- `/robots.txt` allows public crawling and points to the Sitemap URL derived from `Astro.site`.
- Sitemap includes the primary pages, all five knowledge sections, canonical knowledge details, `/projects`, the one
  historical project detail, `/journey`, and `/about`; it excludes all five compatibility pages, `/404`, generated
  data, and `.xml`/`.txt` endpoints.
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
| Missing, local, or normalized placeholder `SITE_URL` in production build/export | `resolveProductionSiteUrl` | Build fails before static output is emitted |
| Draft content | `listEntries()` | Entry is absent from RSS and public content routes |
| Knowledge slug matches a section or another knowledge item | knowledge route build guard | Build fails before static paths are emitted |
| One of the five legacy paths in the static candidate | configured Astro redirect | HTTP 200 compatibility HTML with noindex, target canonical, and immediate refresh |
| Unknown route in Astro preview or Caddy | `404.astro` / Caddy `handle_errors` | HTTP 404, branded page, `noindex, nofollow` |
| `/projects/` or `/projects/index.html` | Caddy canonical redirects | Permanent redirect to `/projects`, query preserved |
| XML/TXT/generated endpoint | Sitemap filter | Endpoint is omitted from `sitemap-0.xml` |
| Placeholder origin in production | release checklist | Deployment remains blocked until `SITE_URL` is explicit |

### 5. Good / Base / Bad Cases

- Good: a published knowledge item appears once at `/knowledge/:slug`, keeps `contentId` as its RSS GUID, and every
  generated link/metadata output uses the same canonical.
- Base: an empty knowledge section remains indexable and returns to `/knowledge` without fabricated content.
- Bad: a page hard-codes `https://praxis.example`, a Docker export accepts `https://praxis.example/` or
  `https://localhost`, parses raw frontmatter for RSS, lets 404/JSON enter Sitemap, or serves `/404.html` through
  `try_files` with status 200.

### 6. Tests Required

- E2E: assert homepage and detail canonical/Open Graph/Twitter/RSS discovery metadata.
- Unit: reject non-HTTPS public origins, credentials, paths, queries, fragments, malformed values, and every
  normalized placeholder/local origin passed to `resolveProductionSiteUrl`.
- E2E: assert article publish/update/tag metadata and visible footer RSS link.
- E2E: assert RSS has only real non-draft items, canonical absolute links, and exactly one stable `contentId` GUID per item.
- E2E: assert Sitemap includes the new primary/section/canonical routes and excludes all compatibility paths, 404, RSS,
  robots, and generated JSON.
- E2E/build: inspect all five static compatibility artifacts for noindex, target canonical, immediate refresh, and no
  duplicate article body; verify each reaches its final target in one hop.
- E2E: assert robots points to `sitemap-index.xml` and missing routes return 404 plus noindex.
- E2E: assert production HTML contains external theme scripts and no inline scripts or `<style>` blocks.
- Build/Docker: assert `rss.xml`, both Sitemap files, `robots.txt`, `404.html`, and content HTML exist in the exported artifact.
- Caddy smoke: validate the Caddyfile; assert clean paths are 200, variants redirect without losing queries, unknown paths
  are branded 404 responses, immutable assets are cached, and security headers are present.

### 7. Wrong vs Correct

```typescript
// Wrong: legacy type-first URL generation drifts from canonical knowledge URLs.
const link = `https://praxis.example/notes/${entry.data.slug}`;

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
