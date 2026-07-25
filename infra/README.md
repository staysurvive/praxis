# Praxis deployment boundary

Praxis builds to static files under `apps/web/dist/`. The production server already owns Docker Compose, Caddy,
certificate management, and public networking; this directory only provides an artifact-export example and a Caddy
snippet to merge into that existing setup.

## Local production build

```powershell
$env:SITE_URL='https://your-domain.example'
npm ci
npm run build
```

Serve or mount the resulting `apps/web/dist/` directory from the existing Caddy container.

## Compose integration

[`compose.web.example.yml`](./compose.web.example.yml) defines a one-shot build/export service. Copy the service and
volume into the existing Compose project, then mount the same `praxis-web-dist` volume read-only in the existing Caddy
service at `/srv/praxis`.

```powershell
docker compose -f infra/compose.web.example.yml run --rm praxis-web-build
```

The example does not run a second web server or proxy.

## Caddy integration

Merge the relevant directives from [`Caddyfile.example`](./Caddyfile.example) into the existing site block and replace
the example domain. Do not copy it over a live Caddyfile without reviewing the server's current routes and volumes.

The route fallback resolves Astro's generated `index.html` files without changing canonical URLs. Requests with a
trailing slash or a direct `index.html` path are redirected to the canonical no-trailing-slash URL; non-empty query
parameters are preserved without adding an empty `?` to query-free requests. Unknown paths serve the branded
`404.html` with a real HTTP 404 status. Keep the project-scoped `praxis_security_headers` snippet imported in both
the main route and `handle_errors`; Caddy error routes do not inherit the normal response-header handler. The external
theme scripts and Astro's `inlineStylesheets: 'never'` setting keep production scripts and styles compatible with the
strict CSP. Adding a third-party script, image, font, or API origin requires an explicit Content Security Policy review.

The future `/api` block is intentionally commented. Enable it only after an independent FastAPI service exists.
