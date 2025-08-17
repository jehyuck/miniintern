import type { mclass } from '../db/schema';

type MclassRow = typeof mclass.$inferSelect;

export type MclassCreateReqDto = {
  title: string;
  description: string | null | undefined;
  capacity: number;
  applyDeadline: string;
  startDate: string;
  endDate: string;
};

export interface MclassCreateServiceDto extends MclassCreateReqDto {
  userId: number;
}

export type MclassResDto = {
  mclassId: number;
  title: string;
  description: string | null | undefined;
  capacity: number;
  applyDeadline: string;
  startDate: string;
  endDate: string;
};
export type MclassResListDto = MclassResDto[];

export type MclassDeleteReqDto = {
  mclassId: number;
};

export type MclassDeleteDto = {
  userId: number;
  mclassId: number;
};

export function toMclassResDto(
  r: Pick<
    MclassRow,
    'mclassId' | 'title' | 'description' | 'capacity' | 'applyDeadline' | 'startDate' | 'endDate'
  >,
): MclassResDto {
  return {
    mclassId: Number(r.mclassId), // bigint 대응 시 안전하게 number 캐스팅
    title: r.title,
    description: r.description ?? undefined, // null → undefined 정규화(선호에 따라)
    capacity: r.capacity,
    applyDeadline: toIso(r.applyDeadline),
    startDate: toIso(r.startDate),
    endDate: toIso(r.endDate),
  };
}
function toIso(d: Date | string): string {
  return typeof d === 'string' ? new Date(d).toISOString() : d.toISOString();
}
