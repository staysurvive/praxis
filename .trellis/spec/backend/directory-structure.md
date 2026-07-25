# Future API directory structure

`apps/api/` is reserved but intentionally absent in the foundation slice. When introduced, keep the FastAPI service
separate from `apps/web` and preserve the static site boundary:

```text
apps/api/
├── app/
│   ├── main.py              # FastAPI application and middleware
│   ├── api/v1/              # versioned route modules
│   ├── schemas/             # request/response validation
│   ├── services/            # use cases and dynamic capabilities
│   ├── repositories/        # persistence access
│   ├── models/              # PostgreSQL models
│   └── core/                # settings, errors, logging, auth primitives
└── tests/
```

Routes should validate transport data and delegate to services. Services should use repositories for persistence and
return typed domain results. The API must reference a `contentId`, not read or mutate Markdown bodies through a request.

Do not create a second web renderer, duplicate Astro content queries, or place database calls in `apps/web` components.
