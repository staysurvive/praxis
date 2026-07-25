# Future backend logging

There is no backend logger in the foundation slice. A future FastAPI service should use structured logs suitable for
Docker/Compose collection rather than ad-hoc print statements.

## Required fields

Include timestamp, level, service, environment, request ID, route/operation, duration, and a safe error code where
applicable. Correlate dynamic records with `contentId` only when it is useful and non-sensitive.

## Levels

- `INFO`: lifecycle, request completion, migrations, and important dynamic events.
- `WARNING`: recoverable dependency degradation or rejected optional input.
- `ERROR`: failed operations requiring attention, with a safe code and request ID.
- `DEBUG`: local diagnostics only; disabled or filtered in production.

Never log tokens, credentials, full comment bodies, authentication secrets, or raw stack traces into client-visible data.
