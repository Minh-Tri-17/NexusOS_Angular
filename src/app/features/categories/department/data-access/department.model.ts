export interface DepartmentModel {
  id: string;
  departmentCode?: string | null;
  departmentName: string;
  managerId?: string | null;
  managerName?: string | null;
  isDelete?: boolean | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const DepartmentFields: Record<keyof DepartmentModel, string> = {
  id: 'Id',
  departmentCode: 'DepartmentCode',
  departmentName: 'DepartmentName',
  managerId: 'ManagerId',
  managerName: 'ManagerName',
  isDelete: 'IsDelete',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};

