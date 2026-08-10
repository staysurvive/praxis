# Praxis deployment boundary

Praxis builds to static files under `apps/web/dist/`. The production server already owns Docker Compose, Caddy,
certificate management, and public networking; this directory only provides an artifact-export example and a Caddy
snippet to merge into that existing setup.

## Local production build

```powershell
$env:SITE_URL='https://your-domain.example'
npm ci
npm run build:production
```

`npm run build:production` rejects a missing, local, private, reserved, or placeholder origin. Serve or mount the resulting
`apps/web/dist/` directory from the existing Caddy container.

## Compose integration

[`compose.web.example.yml`](./compose.web.example.yml) defines a one-shot build/export service. Copy the service and
volume into the existing Compose project, then mount the same `praxis-web-dist` volume read-only in the existing Caddy
service at `/srv/praxis`.

```powershell
$env:PRAXIS_SITE_URL='https://your-domain.example'
docker compose -f infra/compose.web.example.yml run --rm praxis-web-build
```

`PRAXIS_SITE_URL` is required and must be the public HTTPS origin; the export image rejects an empty, local, or
`praxis.example` placeholder origin. Each export writes a complete release under `praxis-web-dist/releases/` and
atomically switches `praxis-web-dist/current`; point Caddy at `/srv/praxis/current`. The example does not run a second
web server or proxy.

## Caddy integration

Merge the relevant directives from [`Caddyfile.example`](./Caddyfile.example) into the existing site block and replace
the example domain. Do not copy it over a live Caddyfile without reviewing the server's current routes and volumes.

Knowledge navigation uses `/knowledge?section=<alias>&item=<slug>` while the exported content remains at the canonical
`/knowledge/:key` files. The example Caddy route rewrites valid Knowledge queries internally before static-file lookup,
so the browser keeps the short query URL and direct requests still work without JavaScript. Unknown section aliases,
unsafe item values, repeated selectors, extra parameters, and unsupported Knowledge query shapes enter the normal
branded 404 path instead of falling back to the overview. Keep the alias mapping synchronized with
`apps/web/src/lib/content/domain.ts`.

The route fallback resolves Astro's generated `index.html` files without changing canonical URLs. Requests with a
trailing slash or a direct `index.html` path are redirected to the canonical no-trailing-slash URL; non-empty query
parameters are preserved without adding an empty `?` to query-free requests. Unknown paths serve the branded
`404.html` with a real HTTP 404 status. Keep the project-scoped `praxis_security_headers` snippet imported in both
the main route and `handle_errors`; Caddy error routes do not inherit the normal response-header handler. The external
theme scripts and Astro's `inlineStylesheets: 'never'` setting keep production scripts and styles compatible with the
strict CSP. Adding a third-party script, image, font, or API origin requires an explicit Content Security Policy review.

The future `/api` block is intentionally commented. Enable it only after an independent FastAPI service exists.
