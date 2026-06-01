Health package

Provides a `/api/health` endpoint that performs:

- PostgreSQL connectivity check via `TypeOrmHealthIndicator`
- Disk storage check (threshold 90%)
- Memory heap check (max 300MB)
