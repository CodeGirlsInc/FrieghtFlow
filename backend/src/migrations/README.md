# Migrations

TypeORM migrations for FreightFlow. The app currently uses `synchronize: true` in development,
so migrations are primarily for production deployments.

## Commands

```bash
# Generate a migration from current entity changes (requires running DB)
npm run migration:generate -- src/migrations/DescriptiveName

# Run all pending migrations
npm run migration:run

# Revert the most recent migration
npm run migration:revert

# Create a blank migration file
npm run migration:create -- src/migrations/DescriptiveName
```

## Switching to migrations in production

In `app.module.ts`, the TypeORM config uses:
```
synchronize: configService.get('NODE_ENV') !== 'production'
```

So in production (`NODE_ENV=production`), `synchronize` is `false` and you must run migrations manually before deploying.
