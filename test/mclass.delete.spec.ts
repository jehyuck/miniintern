import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/db';
import { mclass, users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { bearer, seedUser } from './utils/user.util';

describe('MClass Delete ', () => {
  const app = createApp();

  async function seed() {
    // 매 it 앞은 setup에서 TRUNCATE된 상태
    const host = await seedUser('ex@ex.com', '1234', 'HOST');

    const user = await seedUser('ex@e2x.com', '1234', 'USER');

    const hostAuth = bearer(Number(host.userId), host.role);
    const userAuth = bearer(Number(user.userId), user.role);

    const now = Date.now();
    const [mc] = await db
      .insert(mclass)
      .values({
        userId: Number(host.userId),
        title: '삭제 대상',
        description: 'soft delete 대상',
        capacity: 30,
        applyDeadline: new Date(now + 60 * 60 * 1000),
        startDate: new Date(now + 24 * 60 * 60 * 1000),
        endDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
      })
      .returning({ mclassId: mclass.mclassId });

    return { hostAuth, userAuth, id: Number(mc.mclassId) };
  }

  it('DELETE /mclass → 401 (토큰 없음)', async () => {
    const { id } = await seed();
    await request(app).delete('/mclass').send({ mclassId: id }).expect(401);
  });

  it('DELETE /mclass → 403 (USER 권한)', async () => {
    const { id, userAuth } = await seed();
    await request(app)
      .delete('/mclass')
      .set('Authorization', userAuth)
      .send({ mclassId: id })
      .expect(403); // 네 정책에 맞춰 401이면 401로 바꿔
  });

  it('DELETE /mclass → 204 (HOST) & 목록에서 제외', async () => {
    const { id, hostAuth } = await seed();

    await request(app)
      .delete('/mclass')
      .set('Authorization', hostAuth)
      .send({ mclassId: id })
      .expect(204); // 204에는 바디 보내지 마라(컨트롤러도 sendStatus(204))

    const row = await db.query.mclass.findFirst({
      where: eq(mclass.mclassId, id),
      columns: { deleted: true },
    });
    expect(row?.deleted).toBe(true);

    const list = await request(app).get('/mclass').expect(200);
    expect(list.body.data.find((it: any) => it.mclassId === id)).toBeUndefined();
  });

  it('DELETE /mclass → 404 (이미 삭제됨 재시도)', async () => {
    const { id, hostAuth } = await seed();

    await request(app)
      .delete('/mclass')
      .set('Authorization', hostAuth)
      .send({ mclassId: id })
      .expect(204);

    await request(app)
      .delete('/mclass')
      .set('Authorization', hostAuth)
      .send({ mclassId: id })
      .expect(404); // 레포 where에 deleted=false가 있어야 자연스럽게 404
  });
});
