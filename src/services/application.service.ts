import { db } from '../db';
import type { ApplicationResListDto } from '../dto/applicationDto';
import { AppError } from '../errors/appError';
import { ApplicationRepository } from '../repository/application.repository';
import { MclassRepository } from '../repository/mclass.repository';

export const applicationService = {
  async apply(userId: number, mclassId: number): Promise<number> {
    const appId = await db.transaction(async (tx) => {
      const target = await MclassRepository.findById(tx, mclassId);

      if (target === undefined) throw AppError.notFound();
      // 2) 마감 확인
      const now = new Date();
      if (now > new Date(target.applyDeadline)) {
        throw AppError.conflict();
      }

      // 3) 중복 신청 차단
      const dup = await ApplicationRepository.exists(tx, userId, mclassId);
      if (dup) throw AppError.conflict();

      // 4) 정원 확인
      const n = await ApplicationRepository.countByMclass(tx, mclassId);
      if (n >= target.capacity) throw AppError.conflict();

      // (경합 대비: 실서비스에선 행 잠금/카운트락 권장)
      const newId = await ApplicationRepository.create(tx, userId, mclassId);
      return newId;
    });

    return appId;
  },

  async listMine(userId: number): Promise<ApplicationResListDto> {
    const rows = await ApplicationRepository.getUserApplications(db, userId);
    return rows.map((r) => ({
      applicationId: Number(r.applicationId),
      mclassId: Number(r.mclassId),
      title: r.title,
      description: r.description ?? undefined,
      capacity: r.capacity,
      applyDeadline: toIso(r.applyDeadline),
      startDate: toIso(r.startDate),
      endDate: toIso(r.endDate),
      appliedAt: toIso(r.appliedAt),
    }));
  },
};

function toIso(d: Date | string) {
  return typeof d === 'string' ? new Date(d).toISOString() : d.toISOString();
}
