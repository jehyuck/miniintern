import type { Role } from '../../src/lib/jwt';
import { signAccessToken } from '../../src/lib/jwt';
import { db } from '../../src/db';
import bcrypt from 'bcrypt';
import { users } from '../../src/db/schema';

export async function seedUser(email: string, password: string, role?: Role) {
  const hashed = await bcrypt.hash(password, 4);
  const [u] = await db
    .insert(users)
    .values({ email, password: hashed, role: role ?? 'USER' })
    .returning({ userId: users.userId, role: users.role });
  return u;
}
export const bearer = (uid: number, role: Role) =>
  `Bearer ${signAccessToken({ userId: uid, role: role })}`;
