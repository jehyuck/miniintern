import { db } from '../db';
import { users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

type UserRow = typeof users.$inferSelect;

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
  login(email: string, password: string): Promise<UserRow | undefined> {
    return db.query.users.findFirst({
      where: and(eq(users.email, email), eq(users.password, password)),
    });
  },
  updateRefreshToken(userId: number, refreshToken: string) {
    return db
      .update(users)
      .set({ refreshToken })
      .where(eq(users.userId, userId))
      .returning({ userId: users.userId });
  },
};
