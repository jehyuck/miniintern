import type { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Role } from '../lib/jwt';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = Tx | typeof db;

type LoginType = {
  userId: number;
  email: string;
  password: string;
  role: Role;
};

export const UserRepository = {
  findByEmail(ex: Executor, email: string): Promise<LoginType | undefined> {
    return ex.query.users.findFirst({
      where: eq(users.email, email),
      columns: { userId: true, email: true, password: true, role: true },
    });
  },
  create(ex: Executor, email: string, hashedPassword: string) {
    return ex
      .insert(users)
      .values({ email, password: hashedPassword })
      .returning({ userId: users.userId });
  },
  updateRefreshToken(ex: Executor, userId: number, refreshToken: string) {
    return ex
      .update(users)
      .set({ refreshToken })
      .where(eq(users.userId, userId))
      .returning({ userId: users.userId });
  },
};
