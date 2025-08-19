import { db } from '../db';
import { MclassRepository } from '../repository/mclass.repository';
import type { MclassUpdateReqDto } from '../dto/mclassDto';
import {
  type MclassDeleteDto,
  toMclassResDto,
  type MclassCreateServiceDto,
  type MclassResListDto,
} from '../dto/mclassDto';
import { AppError } from '../errors/appError';
import type { mclass } from '../db/schema';

export function requireDateWithUndefined(
  name: string,
  v: unknown,
  undefinedFilter?: boolean,
): Date | undefined {
  if (undefinedFilter === true && v === undefined) return undefined;
  return requireDate(name, v);
}

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

  async readAll(): Promise<MclassResListDto> {
    return db.transaction(async (tx) => {
      const dto = await MclassRepository.readAll(tx);
      return dto.map((d) => toMclassResDto(d));
    });
  },
  async delete(dto: MclassDeleteDto): Promise<number> {
    const deletedMclassId = await db.transaction(async (tx) => {
      if (await MclassRepository.isExistByIdAndUserId(tx, dto.mclassId, dto.userId)) {
        const [deltedMclass] = await MclassRepository.delete(tx, dto);
        return deltedMclass.mclassId;
      }
      return false;
    });
    if (!deletedMclassId) throw AppError.notFound();
    return deletedMclassId;
  },

  async update(dto: MclassUpdateReqDto & { userId: number }): Promise<number> {
    const applyDeadline = requireDateWithUndefined('applyDeadline', dto.applyDeadline, true);
    const startDate = requireDateWithUndefined('startDate', dto.startDate, true);
    const endDate = requireDateWithUndefined('endDate', dto.endDate, true);

    // 유효성
    if (dto.capacity !== undefined && (!Number.isInteger(dto.capacity) || dto.capacity < 1)) {
      throw AppError.badRequest();
    }
    if (startDate && endDate && startDate > endDate) {
      throw AppError.badRequest();
    }
    if (applyDeadline && startDate && applyDeadline > startDate) {
      throw AppError.badRequest();
    }

    // set에 정의된 값만 모으기
    const set: Partial<typeof mclass.$inferInsert> = {};
    if (dto.title !== undefined) set.title = dto.title.trim();
    if (dto.description !== undefined) set.description = dto.description.trim() || null; // 빈문자 → null
    if (dto.capacity !== undefined) set.capacity = dto.capacity;
    if (applyDeadline !== undefined) set.applyDeadline = applyDeadline;
    if (startDate !== undefined) set.startDate = startDate;
    if (endDate !== undefined) set.endDate = endDate;

    if (Object.keys(set).length === 0) {
      // 아무 것도 바꿀 게 없으면 204가 맞지만, 서비스 레벨에선 no-op을 404로 볼 수도 있음.
      throw AppError.badRequest();
    }

    const updatedMclassId = await db.transaction(async (tx) => {
      if (await MclassRepository.isExistByIdAndUserId(tx, dto.mclassId, dto.userId)) {
        const [updatedMclass] = await MclassRepository.update(tx, {
          mclassId: dto.mclassId,
          ownerId: dto.userId,
          set,
        });
        return updatedMclass.mclassId;
      }
      return false;
    });

    if (!updatedMclassId) throw AppError.notFound();
    return updatedMclassId;
  },
};
