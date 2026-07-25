# Praxis frontend development guidelines

## Current repository state

The Praxis v0.1 release candidate is implemented in `apps/web` as an Astro + TypeScript + MDX static site. The root
`content/` directory remains the authored source of truth, while `infra/` documents the existing Docker Compose +
Caddy deployment boundary. Static RSS, Sitemap, robots, social metadata, and release-gate checks are part of the public
Web contract; draft-safe public projections, strict origin validation, CSP-compatible browser scripts, and hardened
static serving are part of that same boundary and do not introduce a backend.

Authoritative planning references:

- `.trellis/tasks/07-24-praxis-foundation/prd.md`
- `.trellis/tasks/07-24-praxis-foundation/design.md`
- `.trellis/tasks/07-24-praxis-foundation/implement.md`
- `.trellis/tasks/07-25-praxis-v0-1-public-release/prd.md`
- `.trellis/tasks/07-25-praxis-v0-1-public-release/design.md`

## Guide index

| Guide | Applies to |
|---|---|
| [Directory structure](./directory-structure.md) | `apps/web`, `content/`, generated assets, and tests |
| [Component guidelines](./component-guidelines.md) | Astro components, props, composition, and accessibility |
| [Content model](./content-model.md) | Unified entries, `journey`, `practiceLog`, and queries |
| [Routing](./routing.md) | Type-first URLs, filters, metadata, and 404 behavior |
| [Styling](./styling.md) | Tailwind layout utilities and CSS design tokens |
| [State management](./state-management.md) | Build-time data and progressive enhancement boundaries |
| [Hook and browser behavior](./hook-guidelines.md) | Client scripts and hydrated islands; no React hooks |
| [Type safety](./type-safety.md) | Strict TypeScript and runtime content validation |
| [Quality](./quality-guidelines.md) | Checks, tests, accessibility, and forbidden patterns |

## Pre-development checklist

- Read the task PRD, technical design, and implementation plan.
- Keep Markdown/MDX in `content/` as the source of truth; do not introduce a CMS or database for article bodies.
- Confirm that a change belongs to `apps/web`, `content`, `infra`, or a future API boundary before editing.
- Search existing content access, token, copy, and route helpers before adding a new one.
- Preserve static rendering and verify the core path without client-side JavaScript.

## Implemented source examples

The current implementation uses the following concrete boundaries:

```text
content/projects/praxis.mdx                 # only production entry
apps/web/src/content.config.ts              # root content loader + schema
apps/web/src/lib/content/index.ts           # typed queries and summaries
apps/web/src/lib/practice.ts                # explicit event normalization
apps/web/scripts/generate-practice-data.ts  # deterministic build artifact
apps/web/src/components/                    # typed presentational Astro components
apps/web/src/pages/                         # HTML routes plus RSS, robots, and generated JSON
infra/Dockerfile.web                        # static artifact image
```

For example, routes consume a shared summary rather than parsing frontmatter:

```typescript
const entries = await listEntries({ type: 'project' });
const href = entries[0] ? getContentUrl(entries[0].type, entries[0].slug) : '/projects';
```

The generated activity boundary is validated again when it is read:

```typescript
export const practiceDataset: PracticeDataset = datasetSchema.parse(rawPracticeDataset);
```

## Quality check

- Run the root formatting, lint, type-check, unit-test, build, and browser smoke commands defined by the task.
- Check both Light and Dark themes, Chinese long-form reading width, keyboard focus, reduced motion, and the custom 404.
- Verify no page parses raw frontmatter directly and no new type duplicates the unified content schema.
