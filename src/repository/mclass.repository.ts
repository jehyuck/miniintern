import { and, eq, isNull } from 'drizzle-orm';
import type { db } from '../db';
import { mclass } from '../db/schema';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = Tx | typeof db;

export const MclassRepository = {
  create(
    ex: Executor,
    input: Omit<typeof mclass.$inferInsert, 'classId' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
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
};
