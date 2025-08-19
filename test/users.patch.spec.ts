import request from 'supertest';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { createApp } from '../src/app';
import { eq } from 'drizzle-orm';
import { seedUser, bearer } from './utils/user.util';
import bcrypt from 'bcrypt';

const app = createApp();

describe('PATCH /users/me', () => {
  it('204: 비밀번호 변경 성공', async () => {
    const { userId, role } = await seedUser('p@test.com', 'oldpw');
    await request(app)
      .patch('/users/me')
      .set('Authorization', bearer(userId, role))
      .send({ currentPassword: 'oldpw', newPassword: 'newpw123' })
      .expect(204);

    const row = await db.query.users.findFirst({
      where: eq(users.userId, userId),
      columns: { password: true },
    });
    expect(await bcrypt.compare('newpw123', row!.password)).toBe(true);
  });

  it('400: currentPassword/newPassword 누락', async () => {
    const { userId, role } = await seedUser('q@test.com', 'pw');
    await request(app)
      .patch('/users/me')
      .set('Authorization', bearer(userId, role))
      .send({ currentPassword: 'pw' })
      .expect(400);
  });

  it('401: 현재 비밀번호 불일치', async () => {
    const { userId, role } = await seedUser('r@test.com', 'right');
    await request(app)
      .patch('/users/me')
      .set('Authorization', bearer(userId, role))
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
