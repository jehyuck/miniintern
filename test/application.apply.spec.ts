// src/__tests__/application.apply.spec.ts
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/db';
import { mclass, users } from '../src/db/schema';
import { bearer } from './utils/user.util';

describe('MClass 신청', () => {
  const app = createApp();

  async function seedMclass({ capacity = 1, deadlineOffsetH = 1 } = {}) {
    const [host] = await db
      .insert(users)
      .values({
        email: `host@ex.com`,
        password: 'hashed',
        role: 'HOST',
      })
      .returning({ userId: users.userId });

    const now = Date.now();
    const [mc] = await db
      .insert(mclass)
      .values({
        userId: Number(host.userId),
        title: `클래스-${Date.now()}`,
        description: '신청 테스트',
        capacity,
        applyDeadline: new Date(now + deadlineOffsetH * 3600_000),
        startDate: new Date(now + 24 * 3600_000),
        endDate: new Date(now + 48 * 3600_000),
      })
      .returning({ mclassId: mclass.mclassId });

    return Number(mc.mclassId);
  }

  async function seedUserWithToken(role: 'USER' | 'HOST' | 'ADMIN' = 'USER') {
    const [u] = await db
      .insert(users)
      .values({
        email: `${role.toLowerCase()}+${Date.now()}@ex.com`,
        password: 'hashed',
        role,
      })
      .returning({ userId: users.userId, role: users.role });
    return { id: Number(u.userId), auth: bearer(Number(u.userId), u.role as any) };
  }

  it('POST /mclass/:id/apply 201 (성공) & GET /users/applications에서 보임', async () => {
    const mclassId = await seedMclass({ capacity: 2 });
    const user = await seedUserWithToken('USER');

    const apply = await request(app)
      .post(`/applications/mclass/${mclassId}`)
      .set('Authorization', user.auth)
      .expect(201);

    expect(apply.body?.data?.applicationId).toEqual(expect.any(Number));

    const my = await request(app)
      .get('/applications/me')
      .set('Authorization', user.auth)
      .expect(200);

    expect(Array.isArray(my.body.data)).toBe(true);
    expect(my.body.data.find((x: any) => x.mclassId === mclassId)).toBeTruthy();
  });

  it('중복 신청  409', async () => {
    const mclassId = await seedMclass({ capacity: 2 });
    const user = await seedUserWithToken();

    await request(app)
      .post(`/applications/mclass/${mclassId}`)
      .set('Authorization', user.auth)
      .expect(201);
    await request(app)
      .post(`/applications/mclass/${mclassId}`)
      .set('Authorization', user.auth)
      .expect(409);
  });

  it('마감 이후 신청  409', async () => {
    const mclassId = await seedMclass({ deadlineOffsetH: -1 }); // 이미 지남
    const user = await seedUserWithToken();

    await request(app)
      .post(`/applications/mclass/${mclassId}`)
      .set('Authorization', user.auth)
      .expect(409);
  });

  it('정원 초과  409', async () => {
    const mclassId = await seedMclass({ capacity: 1 });
    const u1 = await seedUserWithToken();
    const u2 = await seedUserWithToken();

    await request(app)
      .post(`/applications/mclass/${mclassId}`)
      .set('Authorization', u1.auth)
      .expect(201);
    await request(app)
      .post(`/applications/mclass/${mclassId}`)
      .set('Authorization', u2.auth)
      .expect(409);
  });

  it('토큰 없음  401', async () => {
    const mclassId = await seedMclass();
    await request(app).post(`/applications/mclass/${mclassId}`).expect(401);
  });
});
