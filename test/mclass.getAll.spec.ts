import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/db';
import { mclass, users } from '../src/db/schema';
import type { Role } from '../src/lib/jwt';

describe('MClass 읽기', () => {
  const app = createApp();

  let hostId: number;
  let createdMclassId: number;

  beforeAll(async () => {
    await db.delete(mclass);
    await db.delete(users);

    // (옵션) FK 대비: HOST 유저 하나 생성
    const [u] = await db
      .insert(users)
      .values({
        email: 'host@example.com',
        password: 'hashed',
        role: 'HOST' as Role,
      })
      .returning({ userId: users.userId });

    hostId = Number(u.userId);

    // mclass 한 개 생성 (deleted=false 기본값 가정)
    const now = Date.now();
    const [mc] = await db
      .insert(mclass)
      .values({
        userId: hostId, // FK 없으면 이 줄 제거
        title: '테스트 클래스',
        description: '조회 테스트',
        capacity: 20,
        applyDeadline: new Date(now + 60 * 60 * 1000), // +1h
        startDate: new Date(now + 24 * 60 * 60 * 1000), // +1d
        endDate: new Date(now + 2 * 24 * 60 * 60 * 1000), // +2d
        // createdAt/deleted 는 DB 기본값
      })
      .returning({ mclassId: mclass.mclassId });

    createdMclassId = Number(mc.mclassId);
  });

  afterAll(async () => {
    await db.delete(mclass);
    await db.delete(users);
  });

  it('GET /mclass → 200, 배열이며 방금 생성한 항목을 포함', async () => {
    const res = await request(app).get('/mclass').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    const item = res.body.data.find((it: any) => it.mclassId === createdMclassId);
    expect(item).toBeDefined();
    expect(item).toMatchObject({
      mclassId: createdMclassId,
      title: '테스트 클래스',
      description: '조회 테스트',
      capacity: 20,
    });

    // 날짜 문자열(ISO)로 나오는지 확인
    for (const k of ['applyDeadline', 'startDate', 'endDate'] as const) {
      expect(typeof item[k]).toBe('string');
      expect(new Date(item[k]).toString()).not.toBe('Invalid Date');
    }
  });

  //   it('GET /mclass/:id → 200, 정확히 단건 반환', async () => {
  //     const res = await request(app).get(`/mclass/${createdMclassId}`).expect(200);
  //     expect(res.body.mclassId).toBe(createdMclassId);
  //     expect(res.body.title).toBe('테스트 클래스');
  //     expect(res.body.capacity).toBe(20);
  //   });

  //   it('GET /mclass/999999 → 404 (없는 id)', async () => {
  //     await request(app).get('/mclass/999999').expect(404);
  //   });
});
