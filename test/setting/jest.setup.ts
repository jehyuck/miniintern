import { db, pool, runMigrations } from '../../src/db';
import { sql } from 'drizzle-orm';

beforeAll(async () => {
  await runMigrations();
});

afterEach(async () => {
  await db.execute(sql`TRUNCATE TABLE "application" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "mclass" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  await pool.end();
});
