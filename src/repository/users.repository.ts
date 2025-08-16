import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const UserRepository = {
  findById(userId: number) {
    return db.select().from(users).where(eq(users.userId, userId)).limit(1);
  },
  findByEmail(email: string) {
    return db.select().from(users).where(eq(users.email, email)).limit(1);
  },
  create(email: string, password: string) {
    return db.insert(users).values({ email, password }).returning({ userId: users.userId });
  },
};
