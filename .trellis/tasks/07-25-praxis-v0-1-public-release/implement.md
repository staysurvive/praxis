# Praxis v0.1 public release — implementation plan

## Ordered checklist

1. **Establish official discovery dependencies and config**
   - Add Astro-compatible `@astrojs/rss` and `@astrojs/sitemap` dependencies.
   - Register Sitemap with explicit exclusions for 404 and generated activity JSON.
   - Keep static output and the existing `SITE_URL` contract.

2. **Extend the centralized SEO contract**
   - Add typed website/article/noindex fields to `BaseLayout.astro`.
   - Add Twitter card, RSS discovery, article timestamps/tags, and robots metadata.
   - Pass article metadata from the unified detail route and noindex from 404.

3. **Add static discovery endpoints**
   - Implement `/rss.xml` from `listEntries()` and canonical URLs.
   - Implement `/robots.txt` from `Astro.site`.
   - Confirm Sitemap contains public routes and excludes non-indexable/generated endpoints.

4. **Bring real content up to date**
   - Update `homeContent.now` for v0.1 release preparation.
   - Add truthful `journey.outcome`, `journey.reflection`, next step and meaningful practice events to the Praxis project.
   - Keep `contentId`, slug, type-first URL and `status: ongoing` stable until real deployment.

5. **Create the versioned release gate**
   - Add `docs/releases/v0.1-checklist.md` with evidence-oriented sections.
   - Include `docs` in repository formatting checks.
   - Mark only locally verified items complete; leave domain/server/HTTPS/online smoke pending.

6. **Expand regression coverage**
   - Add E2E assertions for metadata, RSS, Sitemap, robots and 404 noindex.
   - Preserve desktop/mobile execution, Axe, theme persistence and no-JS reading.
   - Add a deterministic build-artifact assertion script only if E2E cannot cover an artifact invariant clearly.

7. **Run release-candidate validation**
   - `npm run format`
   - `npm run check`
   - `npm run build`
   - `npm run test:e2e`
   - `docker build -f infra/Dockerfile.web -t praxis-web-v0.1-check .`
   - Inspect desktop/mobile Light/Dark pages and generated discovery files.

8. **Update evidence and prepare deployment handoff**
   - Check completed deployment-preparation items in `docs/releases/v0.1-checklist.md`.
   - Update the Praxis practice record only for milestones that actually occurred.
   - Run Trellis quality/spec/commit workflow.
   - Keep production deployment items open until the user supplies the real domain and existing Caddy/Compose integration boundary.

## Risky files and rollback points

- `apps/web/src/layouts/BaseLayout.astro`: metadata regressions affect every page; validate defaults and 404 separately.
- `apps/web/astro.config.mjs`: Sitemap integration affects the full build; verify output paths before continuing.
- `content/projects/praxis.mdx`: schema rejects invalid dates or duplicate events; preserve stable identity and URL.
- `package-lock.json`: dependency changes must stay limited to official Astro packages and their transitive requirements.

## Review gates

- Gate A: planning artifacts match the user-approved scope and contain no backend work.
- Gate B: metadata and discovery endpoints build with a deterministic test `SITE_URL`.
- Gate C: existing editorial/heatmap/theme/mobile behavior has no regression.
- Gate D: release checklist distinguishes verified local readiness from unperformed production deployment.
