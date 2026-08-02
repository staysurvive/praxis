# Unified content model

## Source of truth

Markdown (`.md`) under the repository root `content/` is the authored source of truth. The custom typed Astro
loader owns discovery, source-policy enforcement, and schema validation. Pages and components never parse raw
frontmatter.

## Entry identity and dimensions

Every entry has an immutable `contentId` independent of its slug. `type` (`blog`, `note`, `journal`, `project`) and
`stage` (`know-think`, `think-act`, `act-achieve`) are orthogonal. `status` describes publication/progress and does not
change the URL namespace.

Adding a type means extending one registry/configuration and presentation mapping. Do not create a second collection,
schema, query helper, or route family with copied logic.

## Journey versus practiceLog

`journey` is a cumulative optional object for the durable result of thinking and practice:

```yaml
journey:
  question: optional rich text
  thinking: optional rich text
  action: optional rich text
  outcome: optional rich text
  reflection: optional rich text
  nextStep: optional rich text
```

`practiceLog` is a separate explicit event timeline:

```yaml
practiceLog:
  - date: 2026-07-24
    kind: practice
    note: 完成一个可运行原型
```

`publishedAt` supplies one normalized `publish` event. `updatedAt`, Git history, typo fixes, and formatting edits do
not create events. An explicit publication event on the same date must be merged rather than double-counted.

The `practiceKinds` registry in `lib/content/domain.ts` owns allowed values; `uiCopy.practiceKinds` owns their Chinese
labels, and `levelForCount` in `lib/practice.ts` owns heatmap intensity. Initial kinds are `publish`, `learn`,
`practice`, `reflect`, and `milestone`; new kinds must be added to the shared registry and copy mapping rather than
reimplemented in each component.

## Access operations

Keep shared operations in one content module:

```text
listEntries({ type?, stage?, status?, tag? })
getEntryBySlug(type, slug)
getEntryByContentId(contentId)
```

The practice aggregator consumes the same typed entries and writes a deterministic static JSON artifact. It never calls
GitHub or derives events from Git history.

## Implemented foundation contract

### 1. Scope / Trigger

This contract applies to every authored Markdown entry and to the build-time Praxis Practice Heatmap. It was
implemented for the first vertical slice so future content types do not create a second schema or query path.

### 2. Signatures

The shared publication policy in `apps/web/src/lib/content/domain.ts` and access layer in
`apps/web/src/lib/content/index.ts` expose:

```typescript
isPublicStatus(status: Status): boolean;
listEntries(filter?: ContentFilter): Promise<ContentSummary[]>;
getEntryBySlug(type: ContentType, slug: string): Promise<ContentCollectionEntry | undefined>;
getEntryByContentId(contentId: string): Promise<ContentCollectionEntry | undefined>;
```

The activity layer in `apps/web/src/lib/practice.ts` exposes:

```typescript
normalizePracticeEvents(entries: readonly PracticeSourceEntry[]): NormalizedPracticeEvent[];
buildPracticeDataset(entries: readonly PracticeSourceEntry[], options?: PracticeDatasetOptions): PracticeDataset;
buildPublicPracticeDataset(entries: readonly ContentFrontmatter[], options?: PracticeDatasetOptions): PracticeDataset;
markdownContentLoader(): Loader;
```

### 3. Contracts (content, artifact, environment)

- Authored input is YAML frontmatter plus Markdown `.md` under `content/`; `contentId` is immutable and `slug` is URL-facing.
- `markdownContentLoader` and `generate-practice-data.ts` scan `content/` for `.mdx` and fail if one is present. The
  loader renders each Markdown body through the production Sätterli policy before the collection is exposed: raw HTML,
  MDX-style expressions, line-leading ESM imports/exports, and unsafe link/image protocols are build errors, never
  sanitized output.
- Normalized events contain `contentId`, `type`, `stage`, date-only `YYYY-MM-DD`, `kind`, optional `note`, and `source`.
- The generated file is `apps/web/src/generated/practice-activity.json` (ignored and reproducible) and is emitted as
  `/generated/practice-activity.json` in the static artifact.
- `isPublicStatus` is the single publication policy for routes, queries, RSS, and Practice projections. Draft entries
  still participate in duplicate identity/URL validation, but their dates, notes, and counters never enter public JSON.
- `PracticeDatasetOptions.endDateKey` caps the generated public projection at the Shanghai calendar date; future
  `publishedAt` or `practiceLog` events contribute neither an event, active day, nor content counter.
- `SITE_URL` is optional at build time; `apps/web/astro.config.mjs` falls back to `https://praxis.example`.

### 4. Validation & Error Matrix

| Condition | Validation owner | Result |
|---|---|---|
| Unknown type/stage/status or malformed date | `contentSchema` | Build/type-check fails |
| `updatedAt < publishedAt` | `contentSchema.superRefine` | Build fails with field issue |
| Duplicate event or repeated initial publish | `contentSchema.superRefine` | Build fails before route generation |
| Duplicate `contentId` or type/slug across files | `generate-practice-data.ts` | Build fails with relative file path |
| `.mdx` file under `content/` | loader + generator file policy | Build fails and instructs the author to use `.md` |
| Raw HTML, MDX expression, or MDX ESM in a `.md` body | production Markdown policy | Build fails with an actionable source position; content is not silently stripped |
| `javascript:`, `data:`, or other unsafe link/image protocol | production Markdown policy | Build fails before an executable URL can be emitted |
| Draft content with practice events | `isPublicStatus` + `buildPublicPracticeDataset` | Entry is absent from public routes, RSS, heatmap totals, events, and JSON |
| Event date after `endDateKey` | practice projection | Event and its counters are absent from public JSON and heatmap UI |
| Missing type content | shared index route + `EmptyState` | Safe empty state, no fabricated entry |

### 5. Good / Base / Bad cases

- Good: `content/projects/praxis.md` keeps one `contentId`, accumulates `journey`, records meaningful `practiceLog`,
  and uses ordinary Markdown links/images rather than authored HTML.
- Base: an entry with only `publishedAt` produces exactly one synthetic `publish` event.
- Bad: changing `updatedAt` for a typo fix changes no activity count; adding two identical events is rejected; sending
  all parsed entries directly to `buildPracticeDataset` can leak draft metadata; writing `<img onerror=...>`,
  `{expression}`, or a `.mdx` entry must never produce an emitted page.

### 6. Tests required (with assertion points)

- `apps/web/tests/unit/content-schema.test.ts`: valid all-type fixtures pass; invalid dates, IDs, and duplicate events
  fail with a Zod issue.
- `apps/web/tests/unit/practice.test.ts`: automatic publish, explicit publish de-duplication, multiple same-day events,
  updatedAt-only changes, draft exclusion, and end-date exclusion preserve expected public counts.
- `apps/web/tests/unit/content-markdown.test.ts`: ordinary Markdown renders, while raw HTML, MDX syntax, unsafe
  link/image protocols, and `.mdx` source files fail; fenced code and escaped braces remain valid.
- `apps/web/tests/unit/content-domain.test.ts`: type-first URL mapping, shared registry behavior, and the public-status
  policy remain stable.
- `apps/web/tests/e2e/site.spec.ts`: homepage → `/projects` → real detail, empty `/blog`, 404, no-JS reading, and Axe.

### 7. Wrong vs Correct

```typescript
// Wrong: derive activity from every metadata update, publish draft entries, or include future events.
const dataset = buildPracticeDataset(entries.map(toPracticeSourceEntry));

// Correct: filter by the shared publication policy, then normalize only real events through today.
const dataset = buildPublicPracticeDataset(entries, { endDateKey: getTodayDateKey() });
```
