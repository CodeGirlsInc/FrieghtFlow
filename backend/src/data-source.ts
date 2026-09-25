import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Glob for migration files, shared between the DataSource and its spec so the
 * two cannot drift.
 *
 * Every migration in this directory is named `<unix-millis>-<Name>.ts` by
 * `npm run migration:create` and the TypeORM CLI's own default, so anchoring
 * on a leading run of digits selects migrations and nothing else.
 *
 * The previous `src/migrations/*.ts` also matched `migrations.spec.ts` — the
 * Jest suite for the migrations. The CLI would have loaded that file as if it
 * were a migration and failed, because it exports no `MigrationInterface`
 * implementation.
 */
export const MIGRATIONS_GLOB = 'src/migrations/[0-9]*.ts';

/**
 * Dedicated DataSource used by the TypeORM CLI for generating and running
 * migrations. The application itself uses TypeOrmModule.forRootAsync()
 * inside AppModule — this file is ONLY for the CLI.
 *
 * Usage:
 *   npm run migration:generate -- src/migrations/DescriptiveName
 *   npm run migration:run
 *   npm run migration:revert
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USERNAME ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'freightflow',
  // Glob patterns — CLI resolves these at runtime via ts-node
  entities: ['src/**/*.entity.ts'],
  migrations: [MIGRATIONS_GLOB],
  // Never synchronize in migration mode
  synchronize: false,
  logging: ['migration'],
});
