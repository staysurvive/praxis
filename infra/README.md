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

The future `/api` block is intentionally commented. Enable it only after an independent FastAPI service exists.
