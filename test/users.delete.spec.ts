import request from 'supertest';
import { seedUser, bearer } from './utils/user.util';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { createApp } from '../src/app';
import { eq } from 'drizzle-orm';
const app = createApp();

async function getDeletedAndRT(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: { deletedAt: true, refreshToken: true },
  });
}

describe('DELETE /users/me (soft delete)', () => {
  it('204: 소프트 삭제 + RT 무효화 + 쿠키 제거', async () => {
    const { userId, role } = await seedUser('del@test.com', 'pw');

    // refreshToken 컬럼에 값 채워두고 시작(무효화 검증용)
    await db.update(users).set({ refreshToken: 'dummyhash' }).where(eq(users.userId, userId));

    const res = await request(app)
      .delete('/users/me')
      .set('Authorization', bearer(userId, role))
      .expect(204);

    // 쿠키 제거 확인 (Set-Cookie 헤더에 refresh 쿠키 만료)
    const setCookies = res.get('Set-Cookie') ?? [];
    const refresh = setCookies.find((c) => c.startsWith('refreshToken='));
    expect(refresh).toBeDefined();

    // 삭제 지시가 들어있어야 한다
    expect(refresh).toMatch(/Max-Age=0|Expires=/i);

    // DB: deletedAt 설정 + refreshToken NULL
    const row = await getDeletedAndRT(userId);
    expect(row).toBeTruthy();
    expect(row!.deletedAt).not.toBeNull();
    expect(row!.refreshToken).toBeNull();
  });

  it('멱등성: 두 번 호출해도 둘 다 204', async () => {
    const { userId, role } = await seedUser('idem@test.com', 'pw');

    await request(app).delete('/users/me').set('Authorization', bearer(userId, role)).expect(204);

    // 재호출도 204 (정책상 멱등)
    await request(app).delete('/users/me').set('Authorization', bearer(userId, role)).expect(204);

    const row = await getDeletedAndRT(userId);
    expect(row!.deletedAt).not.toBeNull();
  });

  it('401: 토큰 없음', async () => {
    await request(app).delete('/users/me').expect(401);
  });
});
