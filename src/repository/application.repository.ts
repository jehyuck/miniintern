import { and, count, eq } from 'drizzle-orm';
import type { db } from '../db';
import { application, mclass } from '../db/schema';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = Tx | typeof db;

export const ApplicationRepository = {
  async exists(ex: Executor, userId: number, mclassId: number) {
    const row = await ex.query.application.findFirst({
      where: and(eq(application.userId, userId), eq(application.mclassId, mclassId)),
      columns: { applicationId: true },
    });
    return !!row;
  },

  async countByMclass(ex: Executor, mclassId: number) {
    const [row] = await ex
      .select({ n: count() })
      .from(application)
      .where(eq(application.mclassId, mclassId));
    return Number(row?.n ?? 0);
  },

  async create(ex: Executor, userId: number, mclassId: number) {
    const [row] = await ex
      .insert(application)
      .values({ userId, mclassId })
      .returning({ applicationId: application.applicationId });
    return Number(row.applicationId);
  },

  async getUserApplications(ex: Executor, userId: number) {
    // 조인해서 Mclass 주요 필드 함께 반환
    const rows = await ex
      .select({
        applicationId: application.applicationId,
        mclassId: mclass.mclassId,
        title: mclass.title,
        description: mclass.description,
        capacity: mclass.capacity,
        applyDeadline: mclass.applyDeadline,
        startDate: mclass.startDate,
        endDate: mclass.endDate,
        appliedAt: application.createdAt,
      })
      .from(application)
      .innerJoin(mclass, eq(application.mclassId, mclass.mclassId))
      .where(eq(application.userId, userId));
    return rows;
  },
};
