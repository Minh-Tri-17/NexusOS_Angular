export interface JobTitleModel {
  id: string;
  jobTitleCode?: string | null;
  jobTitleName: string;
  isDelete?: boolean | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const JobTitleFields: Record<keyof JobTitleModel, string> = {
  id: 'Id',
  jobTitleCode: 'JobTitleCode',
  jobTitleName: 'JobTitleName',
  isDelete: 'IsDelete',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};

