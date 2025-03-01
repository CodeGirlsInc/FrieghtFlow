import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'freightflow_user',
  password: process.env.DB_PASS ?? 'freightflow123',
  database: process.env.DB_NAME ?? 'freightflow_db',
  synchronize: true,
  logging: true,
  entities: [],
  migrations: [],
  subscribers: [],
});
