# Future database boundary

PostgreSQL is out of scope for the foundation task. When it is introduced for comments, identity, views, or assistant
state, it must store dynamic/derived data only; Markdown/MDX remains the source of truth for authored content.

## Required boundaries

- Reference content with immutable `contentId`, never a mutable slug as the foreign identity.
- Keep migrations versioned and reviewable under the future API package; do not mutate production schema ad hoc.
- Keep persistence in repositories/services, not route handlers or Astro code.
- Use explicit transactions for multi-record writes and idempotency for event-like view/comment operations.
- Store dates/times with an explicit timezone policy; the heatmap's authored date remains a date-only Praxis event.

## Avoid

- Copying article Markdown into database rows.
- Making a database connection a prerequisite for static page builds.
- Adding an ORM or migration tool before a backend scope is approved.
