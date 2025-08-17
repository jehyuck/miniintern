import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/db';
import { users, mclass, application } from '../src/db/schema';
import { bearer } from './utils/user.util';
import { count, eq } from 'drizzle-orm';
import { getApi, setupServer, teardownServer } from './_server';

describe('동시성: 500명의 유저가 100명의 정원에 신청함', () => {
  const app = createApp();
  beforeAll(setupServer);
  afterAll(teardownServer);
  jest.setTimeout(100_000);
  it('100개 성공', async () => {
    // 1) mclass(정원=100) 시드
    const api = getApi();
    const [host] = await db
      .insert(users)
      .values({
        email: `host+${Date.now()}@ex.com`,
        password: 'hashed',
        role: 'HOST',
      })
      .returning({ userId: users.userId });

    const now = Date.now();
    const [mc] = await db
      .insert(mclass)
      .values({
        userId: Number(host.userId),
        title: '동시성-정원100',
        description: 'concurrency test',
        capacity: 100,
        applyDeadline: new Date(now + 60 * 60 * 1000), // +1h
        startDate: new Date(now + 24 * 60 * 60 * 1000),
        endDate: new Date(now + 48 * 60 * 60 * 1000),
      })
      .returning({ mclassId: mclass.mclassId });

    const mclassId = Number(mc.mclassId);

    // 2) 500명 사용자 시드 (배치 insert)
    const usersPayload = Array.from({ length: 500 }, (_, i) => ({
      email: `user${i}+${Date.now()}@ex.com`,
      password: 'hashed',
    }));
    const inserted = await db
      .insert(users)
      .values(usersPayload)
      .returning({ userId: users.userId, role: users.role });

    const tokens = inserted.map((u) => bearer(Number(u.userId), 'USER'));

    // 3) 동시 신청 (각 요청의 상태코드만 수집; expect는 개별 요청에 안 건다)
    const promises = tokens.map((auth) =>
      api.post(`/applications/mclass/${mclassId}`).set('Authorization', auth),
    );

    const settled = await Promise.allSettled(promises);
    const statuses = settled.map(
      (s) => (s.status === 'fulfilled' ? s.value.status : 0), // rejected면 0으로 표기
    );

    const ok201 = statuses.filter((s) => s === 201).length;

    // 4) 기대값: 성공 100, 나머지 409, 기타 상태 0
    expect(ok201).toBe(100);

    // 5) DB 실제 신청 수 검증 (정원 초과 방지)
    const [agg] = await db
      .select({ n: count() })
      .from(application)
      .where(eq(application.mclassId, mclassId));
    expect(Number(agg.n)).toBe(100);
  });
});
