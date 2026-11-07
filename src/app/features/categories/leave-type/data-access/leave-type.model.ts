export interface LeaveTypeModel {
  id: string;
  leaveTypeCode?: string | null;
  leaveTypeName: string;
  isDelete?: boolean | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const LeaveTypeFields: Record<keyof LeaveTypeModel, string> = {
  id: 'Id',
  leaveTypeCode: 'LeaveTypeCode',
  leaveTypeName: 'LeaveTypeName',
  isDelete: 'IsDelete',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};

