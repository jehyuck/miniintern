import request from 'supertest';
import { createApp } from '../src/app';
import { seedUser, bearer } from './utils/user.util';
import { db } from '../src/db';
import { mclass } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import type { MclassCreateReqDto } from '../src/dto/mclassDto';
const sampleData: MclassCreateReqDto = {
  title: '알고리즘',
  capacity: 50,
  description: '설명',
  applyDeadline: new Date().toISOString(), // 또는 Date.now()도 가능
  startDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 내일
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 모레
};
const app = createApp();
describe('POST /mclass (HOST only)', () => {
  // 각 테스트 고립: 클래스 테이블만 정리
  afterEach(async () => {
    await db.delete(mclass);
  });

  it('201: 클래스 생성 성공', async () => {
    const { userId, role } = await seedUser('admin1@test.com', 'pw', 'HOST');

    const res = await request(app)
      .post('/mclass')
      .set('Authorization', bearer(userId, role))
      .send(sampleData);
    expect(res.status).toBe(201);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data).toBeGreaterThan(0);

    // DB에 저장 확인 + userId 소유자 확인
    const row = await db.query.mclass.findFirst({
      where: eq(mclass.mclassId, res.body.data),
    });
    expect(row?.title).toBe('알고리즘');
    expect(row?.capacity).toBe(50);
    expect(row?.userId).toBe(userId);
  });

  it('409: 같은 유저가 같은 제목으로 중복 생성 시 충돌', async () => {
    const { userId, role } = await seedUser('admin2@test.com', 'pw', 'HOST');
    await request(app)
      .post('/mclass')
      .set('Authorization', bearer(userId, role))
      .send(sampleData)
      .expect(201);

    // 동일 (userId, title) 재시도 → 409 (unique 위반 => 23505 매핑)
    await request(app)
      .post('/mclass')
      .set('Authorization', bearer(userId, role))
      .send(sampleData)
      .expect(409);
  });

  it('201: 다른 유저는 같은 제목으로 생성 가능(유저 스코프 유니크)', async () => {
    const a = await seedUser('admin3a@test.com', 'pw', 'HOST');
    const b = await seedUser('admin3b@test.com', 'pw', 'HOST');

    await request(app)
      .post('/mclass')
      .set('Authorization', bearer(a.userId, a.role))
      .send(sampleData)
      .expect(201);

    // userId 다르면 같은 title 허용
    await request(app)
      .post('/mclass')
      .set('Authorization', bearer(b.userId, b.role))
      .send(sampleData)
      .expect(201);
  });

  it('403: 일반 유저는 생성 불가', async () => {
    const { userId, role } = await seedUser('user1@test.com', 'pw', 'USER');

    await request(app)
      .post('/mclass')
      .set('Authorization', bearer(userId, role))
      .send(sampleData)
      .expect(403);
  });

  it('400: 필드 검증 실패 (title 없음 / capacity<=0)', async () => {
    const { userId, role } = await seedUser('admin4@test.com', 'pw', 'HOST');

    await request(app)
      .post('/mclass')
      .set('Authorization', bearer(userId, role))
      .send({ capacity: 5 }) // title 없음
      .expect(400);

    await request(app)
      .post('/mclass')
      .set('Authorization', bearer(userId, role))
      .send({ title: '잘못된용량', capacity: 0 }) // 용량 0
      .expect(400);
  });
});
