import request from 'supertest';
import { seedUser, bearer } from './utils/user.util';
import { createApp } from '../src/app';
import { sha256 } from '../src/lib/hash';
import { getCookie } from './utils/cookie';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const app = createApp();

describe('POST /users/me/host', () => {
  it('200: HOST 승격 + AT 헤더 + RT 쿠키', async () => {
    const { userId, role } = await seedUser('u@test.com', 'pw', 'USER');
    const res = await request(app)
      .post('/users/me/host')
      .set('Authorization', bearer(userId, role))
      .expect(200);

    expect(res.header['authorization']).toMatch(/^Bearer\s.+/);
    const refreshToken = sha256(getCookie(res, 'refreshToken') ?? '');
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .then((rows) => rows[0]);
    expect(user.refreshToken).toBe(refreshToken);
  });

  it('400: 이미 HOST/ADMIN', async () => {
    const { userId, role } = await seedUser('h@test.com', 'pw', 'HOST');
    await request(app)
      .post('/users/me/host')
      .set('Authorization', bearer(userId, role))
      .expect(400);
  });

  it('멱등/경합: 동시에 2번 호출해도 1번만 성공', async () => {
    const { userId, role } = await seedUser('c@test.com', 'pw', 'USER');
    const [r1, r2] = await Promise.allSettled([
      request(app).post('/users/me/host').set('Authorization', bearer(userId, role)),
      request(app).post('/users/me/host').set('Authorization', bearer(userId, role)),
    ]);
    const codes = [r1, r2].map((r) => (r.status === 'fulfilled' ? r.value.status : 500));
    expect(codes.sort()).toEqual([200, 400]); // 한쪽만 성공
  });

  it('401: 토큰 없음', async () => {
    await request(app).post('/users/me/host').expect(401);
  });
});
