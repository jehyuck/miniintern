import request from 'supertest';
import { createApp } from '../src/app';
import type { Express } from 'express';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

let app: Express;

beforeAll(async () => {
  app = await createApp(); // ✅ 한 번만 생성, 모든 it에서 재사용
});

describe('POST /users', () => {
  it('201 + 반환받은 userId으로 값 검증', async () => {
    const payload = { email: 'test@example.com', password: 'secret12' };
    const res = await request(app).post('/users').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      data: { userId: expect.any(Number) },
    });

    const createdId = res.body.data.userId as number;
    expect(typeof createdId).toBe('number');
    expect(createdId).toBeGreaterThan(0);

    const rows = await db.select().from(users).where(eq(users.userId, createdId));
    expect(rows.length).toBe(1);
    expect(rows[0].email).toBe(payload.email);
  });

  it('400 필수값 미입력 (이메일)', async () => {
    const payload = { password: 'secret12' };

    await request(app).post('/users').send(payload);
    const res = await request(app).post('/users').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 필수값 미입력 (비밀번호)', async () => {
    const payload = { email: 'test@example.com' };

    await request(app).post('/users').send(payload);
    const res = await request(app).post('/users').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('동시에 같은 이메일 가입 → [201, 409]', async () => {
    const payload = { email: 'race@example.com', password: 'secret12' };
    const arr = await Promise.all(
      [...Array(5)].map(() => request(app).post('/users').send(payload)),
    );
    expect(arr.filter((r) => r.status === 201)).toHaveLength(1);
    expect(arr.filter((r) => r.status === 409)).toHaveLength(4);
    expect(arr.filter((r) => ![201, 409].includes(r.status))).toHaveLength(0);
  });

  it('이메일이 빈 문자열이면 400', async () => {
    const res = await request(app).post('/users').send({ email: '', password: 'secret12' });
    expect(res.status).toBe(400);
  });

  it('비밀번호가 빈 문자열이면 400', async () => {
    const res = await request(app).post('/users').send({ email: 'x@y.com', password: '' });
    expect(res.status).toBe(400);
  });
});
