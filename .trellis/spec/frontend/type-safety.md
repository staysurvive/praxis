# Type safety and validation

## TypeScript baseline

- Use strict TypeScript for `apps/web`; do not weaken compiler options to accommodate a component.
- Prefer inferred types from the content schema and configuration objects. Export shared domain types from the owning
  module (`content`, `practice`, `copy`) rather than recreating them in pages.
- Use `satisfies` for configuration and props so literals remain narrow without unsafe casts.
- Keep public domain unions explicit: `ContentType`, `Stage`, `Status`, and the initial `PracticeKind` registry.

## Runtime boundaries

- Validate Markdown frontmatter with the Astro-supported schema/runtime validator before a page can build; reject
  `.mdx` source files before collection discovery.
- Normalize source identity through `normalizeContentIdentity()` before uniqueness checks. That primitive may only
  apply schema-established trims and `isContentType`; it must not duplicate Zod regex, length, refine, or route rules.
- Treat generated activity JSON as a typed derived artifact; validate its shape at the boundary that reads it.
- Normalize dates to a documented date-only representation before grouping by day; do not mix locale strings and `Date`
  objects in aggregation logic.
- Future API payloads require a separate runtime validator and an error-envelope type; do not cast `fetch()` results.

## Content model rules

- `contentId` is stable and independent of `slug`.
- `ContentSummary` is `ContentFrontmatter` plus collection `id` and canonical `url`; presentation labels are
  projected from raw domain values by explicit consumers or focused feature models.
- `journey` is additive optional data; it is not a discriminated union keyed by `stage`.
- `practiceLog` events have a date, a registered kind, and an optional note. `updatedAt` is not an event.
- New type/kind support is added to the central registry/schema and shared queries, not via copied collections or branches.

## Forbidden patterns

- `any`, unchecked `as` casts, non-null assertions used to bypass schema failures, or raw `Record<string, unknown>` passed to UI.
- Duplicated string unions in route pages or components.
- Silent fallback from invalid metadata to a partially rendered public page; fail the build with an actionable error.

## Implemented validation examples

The Zod schema in `apps/web/src/lib/content/schema.ts` validates frontmatter before Astro can emit a route. The
build-time generator uses the same schema for files under `content/` and reports the relative source path on failure:

```typescript
const parsed = contentSchema.safeParse(frontmatter);
if (!parsed.success) {
  throw new Error(`内容校验失败：${relativePath}`);
}
```

The generated JSON is parsed at `apps/web/src/lib/practice-data.ts`; callers receive `PracticeDataset`, never
`unknown` or an unchecked fetch cast. Domain registries in `lib/content/domain.ts` provide the `ContentType`, `Stage`,
`Status`, and `PracticeKind` unions used by routes and components.
