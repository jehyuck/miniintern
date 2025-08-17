import { db } from '../db';
import { MclassRepository } from '../repository/mclass.repository';
import type { MclassCreateServiceDto } from '../dto/mclassDto';
import { AppError } from '../errors/appError';

export function requireDate(name: string, v: unknown): Date {
  if (v === undefined || v === null || v === '') {
    throw AppError.badRequest(`${name}는(은) 필수입니다.`);
  }
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) {
    throw AppError.badRequest(`${name}는(은) ISO 8601 날짜/시간이어야 합니다.`);
  }
  return d;
}

/** applyDeadline ≤ startDate < endDate */
export function assertDateOrderStrict(applyDeadline: Date, startDate: Date, endDate: Date) {
  if (applyDeadline > startDate) {
    throw AppError.badRequest('applyDeadline은 startDate보다 이후일 수 없습니다.');
  }
  if (startDate >= endDate) {
    throw AppError.badRequest('startDate는 endDate보다 이전이어야 합니다.');
  }
}

export const mclassService = {
  async create(input: MclassCreateServiceDto): Promise<number> {
    if (!input.title?.trim()) throw AppError.badRequest('title은 필수입니다.');
    if (!(input.capacity > 0)) throw AppError.badRequest('capacity는 1 이상이어야 합니다.');
    const applyDeadline = requireDate('applyDeadline', input.applyDeadline);
    const startDate = requireDate('startDate', input.startDate);
    const endDate = requireDate('endDate', input.endDate);

    const dto = {
      userId: input.userId,
      title: input.title.trim(),
      description: input.description?.trim(),
      capacity: input.capacity,
      applyDeadline: applyDeadline,
      startDate: startDate,
      endDate: endDate,
    };

    assertDateOrderStrict(applyDeadline, startDate, endDate);
    return await db.transaction(async (tx) => {
      if (await MclassRepository.isExist(tx, dto.userId, dto.title)) throw AppError.conflict();
      const [r] = await MclassRepository.create(tx, dto);
      return r.mclassId;
    });
  },
};
