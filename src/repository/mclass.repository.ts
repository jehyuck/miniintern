import { and, eq, ne } from 'drizzle-orm';
import type { db } from '../db';
import { mclass } from '../db/schema';
import type { MclassDeleteDto } from '../dto/mclassDto';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = Tx | typeof db;

export const MclassRepository = {
  create(
    ex: Executor,
    input: Omit<typeof mclass.$inferInsert, 'classId' | 'createdAt' | 'deleted'>,
  ) {
    return ex.insert(mclass).values(input).returning({ mclassId: mclass.mclassId });
  },

  async isExist(ex: Executor, userId: number, title: string): Promise<boolean> {
    const row = await ex.query.mclass.findFirst({
      where: and(
        eq(mclass.userId, userId),
        eq(mclass.title, title),
        eq(mclass.deleted, false), // 소프트 삭제 제외
      ),
      columns: { mclassId: true }, // 최소 컬럼만
    });
    return !!row;
  },
  async isExistById(ex: Executor, mclassId: number): Promise<boolean> {
    const row = await ex.query.mclass.findFirst({
      where: and(
        eq(mclass.mclassId, mclassId),
        eq(mclass.deleted, false), // 소프트 삭제 제외
      ),
      columns: { mclassId: true }, // 최소 컬럼만
    });
    return !!row;
  },

  readAll(ex: Executor) {
    return ex
      .select({
        mclassId: mclass.mclassId,
        title: mclass.title,
        description: mclass.description,
        capacity: mclass.capacity,
        applyDeadline: mclass.applyDeadline,
        startDate: mclass.startDate,
        endDate: mclass.endDate,
      })
      .from(mclass)
      .where(eq(mclass.deleted, false));
  },

  delete(ex: Executor, input: MclassDeleteDto) {
    return ex
      .update(mclass)
      .set({ deleted: true })
      .where(and(eq(mclass.mclassId, input.mclassId), eq(mclass.deleted, false)))
      .returning({ mclassId: mclass.mclassId });
  },
};
