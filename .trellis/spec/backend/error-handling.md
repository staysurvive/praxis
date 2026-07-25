# Future API error handling

## Response envelope

Every `/api/v1` response uses the stable envelope:

```json
{
  "data": {},
  "error": null,
  "meta": { "requestId": "..." }
}
```

Failures use `data: null` and a stable machine-readable error code:

```json
{
  "data": null,
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Safe user-facing message"
  },
  "meta": { "requestId": "..." }
}
```

## Rules

- Generate or propagate a request ID at the API boundary and include it in responses and structured logs.
- Use stable codes for client branching; messages remain safe and concise.
- Log stack traces and diagnostic context server-side, never in the response or static page.
- Validate request and response schemas at the route boundary.
- A failed optional API capability must not make Astro's static article/detail page fail.
- Do not expose database details, secrets, tokens, or raw exception text.

## Foundation boundary example

### 1. Scope / Trigger

This contract applies when the future `apps/api` boundary is introduced. The foundation slice intentionally has no
backend process; static Astro pages must continue to work without it.

### 2. Signatures

The first endpoint is `GET /api/v1/health`. Dynamic resources are grouped by immutable identity, for example
`GET /api/v1/content/{contentId}/comments`.

### 3. Contracts (request/response/env)

Success and failure responses always use the same envelope:

```json
{
  "data": {},
  "error": null,
  "meta": { "requestId": "req_..." }
}
```

No API environment variable is required by the static build. When the frontend eventually calls the API, the base
URL must be isolated in an API client and must not be read by presentational components.

### 4. Validation & Error Matrix

| Condition | HTTP result | Public error |
|---|---:|---|
| Invalid request schema | 400 | stable validation code + safe message |
| Missing `contentId` target | 404 | stable not-found code |
| Optional dependency unavailable | 503 | safe degraded-capability message; static page remains usable |
| Unexpected server failure | 500 | stable internal code; details only in structured logs |

### 5. Good / Base / Bad cases

- Good: every response includes a request ID and stable machine code.
- Base: `GET /api/v1/health` returns `{ data: { status: 'ok' }, error: null, meta }`.
- Bad: returning a database exception or stack trace to the browser, or making Markdown rendering wait for the API.

### 6. Tests required (with assertion points)

- Contract tests assert envelope shape and status codes for health, validation, not-found, and dependency failure.
- An integration smoke test stops the API and confirms `/projects/praxis-foundation` still renders from static output.

### 7. Wrong vs Correct

```typescript
// Wrong: component calls fetch() and lets an API error blank the article.
// Correct: an isolated API client returns a typed error state while Astro content remains rendered.
```
