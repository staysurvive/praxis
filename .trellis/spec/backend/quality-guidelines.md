# Future backend quality guidelines

## Before backend implementation

- Confirm a product requirement for the dynamic capability and update the parent design/API contract.
- Preserve static Web builds and verify the API is optional for public content.
- Define request/response schemas, error codes, request-ID behavior, and persistence ownership before adding routes.

## Expected checks

- Unit tests for services, validators, and error mapping.
- API contract tests for `/api/v1` envelopes and status codes.
- Integration tests against a disposable PostgreSQL instance when persistence exists.
- Migration tests and idempotency tests for event-like writes.
- Cross-layer smoke test proving an API outage does not prevent a static article/detail page from rendering.

## Forbidden patterns

- Implementing FastAPI/PostgreSQL merely to support the initial static homepage.
- Treating a database index as the canonical article body or metadata.
- Returning framework exception text or unstable messages as the public contract.
- Calling the future API directly from presentation components without an isolated client and failure state.
