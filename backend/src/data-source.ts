import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

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
  migrations: ['src/migrations/*.ts'],
  // Never synchronize in migration mode
  synchronize: false,
  logging: ['migration'],
});