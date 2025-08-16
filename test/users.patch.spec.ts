import request from 'supertest';
import { signAccessToken } from '../src/lib/jwt';
import bcrypt from 'bcrypt';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { createApp } from '../src/app';
import { eq } from 'drizzle-orm';

const app = createApp();

async function seedUser(email: string, password: string) {
  const hashed = await bcrypt.hash(password, 4);
  const [u] = await db
    .insert(users)
    .values({ email, password: hashed, role: 'USER' })
    .returning({ userId: users.userId });
  return u.userId as number;
}
const bearer = (uid: number) => `Bearer ${signAccessToken({ userId: uid, role: 'USER' })}`;

describe('PATCH /users/me', () => {
  it('204: 비밀번호 변경 성공', async () => {
    const uid = await seedUser('p@test.com', 'oldpw');
    await request(app)
      .patch('/users/me')
      .set('Authorization', bearer(uid))
      .send({ currentPassword: 'oldpw', newPassword: 'newpw123' })
      .expect(204);

    const row = await db.query.users.findFirst({
      where: eq(users.userId, uid),
      columns: { password: true },
    });
    expect(await bcrypt.compare('newpw123', row!.password)).toBe(true);
  });

  it('400: currentPassword/newPassword 누락', async () => {
    const uid = await seedUser('q@test.com', 'pw');
    await request(app)
      .patch('/users/me')
      .set('Authorization', bearer(uid))
      .send({ currentPassword: 'pw' })
      .expect(400);
  });

  it('401: 현재 비밀번호 불일치', async () => {
    const uid = await seedUser('r@test.com', 'right');
    await request(app)
      .patch('/users/me')
      .set('Authorization', bearer(uid))
      .send({ currentPassword: 'wrong', newPassword: 'next' })
      .expect(401);
  });

  it('401: 토큰 없음', async () => {
    await request(app)
      .patch('/users/me')
      .send({ currentPassword: 'a', newPassword: 'b' })
      .expect(401);
  });
});
