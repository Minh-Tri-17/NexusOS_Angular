export interface RoleModel {
  id: string;
  roleCode?: string | null;
  roleName: string;
  isSystemRole?: boolean | null;
  isActive?: boolean | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const RoleFields: Record<keyof RoleModel, string> = {
  id: 'Id',
  roleCode: 'RoleCode',
  roleName: 'RoleName',
  isSystemRole: 'IsSystemRole',
  isActive: 'IsActive',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};
