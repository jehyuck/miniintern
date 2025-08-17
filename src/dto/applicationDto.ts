export type ApplicationResDto = {
  applicationId: number;
  mclassId: number;
  title: string;
  description: string | undefined;
  capacity: number;
  applyDeadline: string;
  startDate: string;
  endDate: string;
  appliedAt: string;
};

export type ApplicationResListDto = ApplicationResDto[];
