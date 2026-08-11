# Frontend directory structure

## Current state

The foundation slice now follows this boundary without a monorepo orchestrator:

```text
apps/web/
├── config/                  # build-config validation helpers
├── public/                  # production assets, brand source set, and CSP-safe browser scripts
├── scripts/                 # deterministic build-time generators
├── src/
│   ├── components/          # reusable presentational Astro components
│   ├── config/              # site settings and typed UI copy
│   ├── features/            # narrow Knowledge and Practice view-model projections
│   ├── layouts/             # document and content layouts
│   ├── lib/                 # source, content, URL, and practice domain facts
│   ├── pages/               # route entry points only
│   ├── styles/              # tokens, theme layers, and global base styles
│   └── content.config.ts    # collection/loader schema for root content/
├── tests/                   # unit, fixture, and browser test support
└── astro.config.*
content/                     # Markdown (.md) authored source of truth
infra/                       # static artifact and existing Compose/Caddy deployment docs
```

Within `src/`, `features/knowledge/model.ts` and `features/practice/heatmap-model.ts` are the only current
feature-level projection modules. `features/` is not a destination for generic helpers, types, constants, or future
subsystems.

The generated activity file is intentionally ignored at `apps/web/src/generated/practice-activity.json`; every
`prebuild`/`pretypecheck` run recreates it from `content/`. The public copy is emitted at
`apps/web/dist/generated/practice-activity.json`.

## Ownership rules

- `src/pages/` composes loaders and components; it does not parse frontmatter or contain query variants.
- `src/lib/` owns authored-source primitives, typed content access/query, identity and slug validation, the public URL
  resolver, and practice-event/calendar facts.
- `src/features/` owns focused page-level view-models. Current allowed examples are Knowledge page projection and the
  Practice Heatmap projection; helpers, constants, schemas, and generic presentation adapters do not move here.
- `src/components/` renders typed props and does not make network calls.
- `src/config/` owns `zh-CN` copy, navigation metadata, and site defaults; repeated labels do not live in component markup.
- `src/styles/` owns semantic CSS tokens and theme primitives; component styles remain local to the component when practical.
- `config/` owns build configuration validation such as the canonical `SITE_URL`; it must not become a second UI config tree.
- `public/scripts/` is reserved for small external scripts required by the production CSP. Authored content never belongs there.
- `public/brand/` keeps the supplied brand source set and its dedicated device-size variants. Root `/favicon.*` files are the production browser entry points declared by `BaseLayout.astro`; derive new large variants from the master asset, never by scaling an icon-sized fallback.
- `src/generated/` and `dist/generated/` contain reproducible derived output only. Authored content never belongs there.
- `content/` is not moved under `src/` merely to simplify imports; use the official Astro content loader/adapter.
- `apps/api/` is reserved for a future FastAPI service and is not part of the first Web implementation.

## Naming

- Use kebab-case for content slugs and route segments, PascalCase for component filenames, and camelCase for TypeScript helpers.
- Name route files after their URL responsibility (`knowledge/[key].astro` for the shared section/detail namespace,
  `projects/index.astro` for the project single page, `[type]/[slug].astro` only for the historical project-detail
  exception, and `404.astro` for unknown paths).
- Keep domain vocabulary stable: `contentId`, `journey`, `practiceLog`, `type`, `stage`, and `status` are not renamed per page.
- Put generated files under an explicit `generated` directory and document whether they are committed or ignored.

## Avoid

- A second content collection for each `type`.
- Generic `service`, `manager`, `repository`, or display-adapter layers around existing static content queries.
- A `utils/` dumping ground when a helper belongs to content, routing, styling, or copy ownership.
- Importing page-only code into the content model or design-token layer.
- Letting `.env`, `.git`, local dependencies, reports, or generated output enter the Docker build context; keep
  `.dockerignore` aligned with `infra/Dockerfile.web`.
