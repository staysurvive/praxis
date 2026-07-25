# Praxis backend guidelines

## Current state

No backend is implemented in the foundation slice. `apps/api/` is a reserved boundary for a future FastAPI service;
the Astro site must build and serve authored content without it. These guidelines define the compatibility contract so a
future backend does not become a competing content CMS.

Authoritative references:

- `.trellis/tasks/07-24-praxis-foundation/prd.md`
- `.trellis/tasks/07-24-praxis-foundation/design.md`
- `.trellis/spec/frontend/content-model.md`

## Guide index

| Guide | Applies to |
|---|---|
| [Directory structure](./directory-structure.md) | Reserved `apps/api/` layout |
| [Database boundary](./database-guidelines.md) | Future PostgreSQL-derived dynamic data |
| [Error handling](./error-handling.md) | `/api/v1` response and failure contract |
| [Logging](./logging-guidelines.md) | Future structured server diagnostics |
| [Quality](./quality-guidelines.md) | Future API tests and static-site independence |

## Non-negotiable boundary

- Markdown/MDX, `journey`, and `practiceLog` remain the authoritative content record.
- Backend records reference stable `contentId`; they do not replace body Markdown or core metadata.
- Public content remains available when the API is down.
- All public endpoints use `/api/v1` and the documented response envelope.

Do not add backend source files to the first foundation implementation unless the user explicitly expands scope.
