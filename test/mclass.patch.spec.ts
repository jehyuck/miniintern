import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/db';
import { mclass } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { bearer, seedUser } from './utils/user.util';
import type { MclassResListDto } from '../src/dto/mclassDto';

describe('MClass Update (PATCH /mclass)', () => {
  const app = createApp();

  async function seed() {
    const host = await seedUser('ex@ex.com', '1234', 'HOST');

    const user = await seedUser('ex@e2x.com', '1234', 'USER');

    const hostAuth = bearer(Number(host.userId), host.role);
    const userAuth = bearer(Number(user.userId), user.role);

    const t0 = Date.now();
    const [mc] = await db
      .insert(mclass)
      .values({
        userId: Number(host.userId),
        title: '원래 제목',
        description: '원래 설명',
        capacity: 30,
        applyDeadline: new Date(t0 + 60 * 60 * 1000), // +1h
        startDate: new Date(t0 + 24 * 60 * 60 * 1000), // +1d
        endDate: new Date(t0 + 2 * 24 * 60 * 60 * 1000), // +2d
      })
      .returning({ mclassId: mclass.mclassId });

    return { id: Number(mc.mclassId), hostAuth, userAuth };
  }

  it('PATCH /mclass 401 (토큰 없음)', async () => {
    const { id } = await seed();
    await request(app).patch('/mclass').send({ mclassId: id, title: '바뀐 제목' }).expect(401);
  });

  it('PATCH /mclass 403 (USER 권한)', async () => {
    const { id, userAuth } = await seed();
    await request(app)
      .patch('/mclass')
      .set('Authorization', userAuth)
      .send({ mclassId: id, title: 'USER가 수정 시도' })
      .expect(403);
  });

  it('PATCH /mclass 201 (HOST, 부분 수정 성공) & GET으로 값 확인', async () => {
    const { id, hostAuth } = await seed();

    const payload = { mclassId: id, title: '수정된 제목' };
    await request(app).patch('/mclass').set('Authorization', hostAuth).send(payload).expect(201);

    const get = await request(app).get(`/mclass`).expect(200);
    const list = get.body.data as MclassResListDto;
    const target = list.find((e) => e.mclassId === id);

    expect(target).toBeTruthy();
    if (!target) throw new Error('target not found');
    expect(target.mclassId).toBe(id);
    expect(target.title).toBe('수정된 제목');
    expect(target.capacity).toBe(30);
  });

  it('PATCH /mclass 201 (날짜/용량 함께 수정) & ISO 문자열 확인', async () => {
    const { id, hostAuth } = await seed();
    const now = Date.now();

    const body = {
      mclassId: id,
      capacity: 50,
      applyDeadline: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
    };

    await request(app).patch('/mclass').set('Authorization', hostAuth).send(body).expect(201);

    const get = await request(app).get(`/mclass`).expect(200);
    const list = get.body.data as MclassResListDto;
    const target = list.find((e) => e.mclassId === id);

    expect(target).toBeTruthy();
    if (!target) throw new Error('target not found');

    expect(target.capacity).toBe(50);

    for (const k of ['applyDeadline', 'startDate', 'endDate'] as const) {
      const v = target[k];
      expect(typeof v).toBe('string');
      expect(new Date(v).toString()).not.toBe('Invalid Date');
    }
  });

  it('PATCH /mclass 404 (없는 id)', async () => {
    const { hostAuth } = await seed();
    await request(app)
      .patch('/mclass')
      .set('Authorization', hostAuth)
      .send({ mclassId: 999999, title: '없음' })
      .expect(404);
  });

  it('PATCH /mclass 404 (이미 삭제된 항목)', async () => {
    const { id, hostAuth } = await seed();

    await db.update(mclass).set({ deleted: true }).where(eq(mclass.mclassId, id));

    await request(app)
      .patch('/mclass')
      .set('Authorization', hostAuth)
      .send({ mclassId: id, title: '삭제된 항목 수정 시도' })
      .expect(404);
  });

  it('PATCH /mclass  400 (유효성: capacity는 양의 정수)', async () => {
    const { id, hostAuth } = await seed();
    await request(app)
      .patch('/mclass')
      .set('Authorization', hostAuth)
      .send({ mclassId: id, capacity: 0 })
      .expect(400);
  });

  it('PATCH /mclass  400 (유효성: 날짜 순서 위반)', async () => {
    const { id, hostAuth } = await seed();
    const now = Date.now();
    await request(app)
      .patch('/mclass')
      .set('Authorization', hostAuth)
      .send({
        mclassId: id,
        applyDeadline: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      })
      .expect(400);
  });
});
