export type MclassCreateReqDto = {
  title: string;
  description: string;
  capacity: number;
  applyDeadline: string;
  startDate: string;
  endDate: string;
};

export interface MclassCreateServiceDto extends MclassCreateReqDto {
  userId: number;
}
