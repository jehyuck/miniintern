import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function ping(): Promise<Date> {
  const r = await pool.query<{ now: Date }>('select now() as now');
  return r.rows[0].now;
}

export async function runMigrations() {
  const migrationsFolder = path.join(__dirname, '../../drizzle');
  await migrate(db, { migrationsFolder });
}
