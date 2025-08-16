import {
  pgTable,
  bigint,
  varchar,
  boolean,
  integer,
  timestamp,
  text,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const appStatus = pgEnum('application_status', ['APPLIED', 'CANCELLED']);
export const userRole = pgEnum('user_role', ['USER', 'HOST', 'ADMIN']);

export const users = pgTable('users', {
  userId: bigint('user_id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRole('role').notNull().default('USER'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  refreshToken: text('refresh_token'),
});

export const mclass = pgTable(
  'mclass',
  {
    mclassId: bigint('mclass_id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    capacity: integer('capacity').notNull(),
    applyDeadline: timestamp('apply_deadline', { withTimezone: true }).notNull(),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    deleted: boolean('deleted').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // FK 조회 성능용 (자동으로 안 생김)
    index('idx_mclass_user').on(t.userId),
    // 필수 비즈니스 규칙
    // sql`
    //   ALTER TABLE "mclass"
    //   ADD CONSTRAINT "chk_mclass_capacity_positive"
    //   CHECK (capacity > 0)
    // `,
    // sql`
    //   ALTER TABLE "mclass"
    //   ADD CONSTRAINT "chk_mclass_time_order"
    //   CHECK (start_date <= end_date)
    // `,
  ],
);

export const application = pgTable(
  'application',
  {
    applicationId: bigint('application_id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    mclassId: bigint('mclass_id', { mode: 'number' })
      .notNull()
      .references(() => mclass.mclassId, { onDelete: 'cascade' }),
    status: appStatus('status').notNull().default('APPLIED'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uniq_active_application')
      .on(t.userId, t.mclassId)
      .where(sql`status = 'APPLIED'`),
    index('idx_application_user').on(t.userId),
    index('idx_application_mclass').on(t.mclassId),
  ],
);
