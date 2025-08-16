import request from 'supertest';
import { createApp } from '../src/app';
import type { Express } from 'express';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { sha256 } from '../src/lib/hash';
import { getCookie } from './utils/cookie';
let app: Express;

const testUser = {
  email: 'test12@example.com',
  password: 'secret12',
};
let testUserId: number;

beforeAll(async () => {
  app = await createApp();
  testUserId = (await request(app).post('/users').send(testUser)).body.data.userId;
});

describe('POST /auth/token', () => {
  it('200 + 액세스 토큰과 리프레시 토큰을 응답 헤더와 쿠키로 받는다', async () => {
    const payload = testUser;
    const res = await request(app).post('/auth/token').send(payload);
    expect(res.status).toBe(200);

    const refreshToken = sha256(getCookie(res, 'refreshToken') ?? '');
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userId, testUserId))
      .then((rows) => rows[0]);
    expect(user.refreshToken).toBe(refreshToken);
  });

  it('400 이메일이 비어있음', async () => {
    const payload = { password: testUser.password };
    const res = await request(app).post('/auth/token').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 비밀번호가 비어있음', async () => {
    const payload = { email: testUser.email };
    const res = await request(app).post('/auth/token').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('401 비밀번호가 틀림', async () => {
    const payload = { email: testUser.email, password: 'wrongpassword' };
    const res = await request(app).post('/auth/token').send(payload);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('401 없는 이메일', async () => {
    const payload = { email: testUser.email + '.or', password: testUser.password };
    const res = await request(app).post('/auth/token').send(payload);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
