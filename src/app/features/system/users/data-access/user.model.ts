import { UserStatus, UserType } from './user.enum';

export interface UserModel {
  id: string;
  userCode?: string | null;
  username?: string | null;
  password?: string | null;
  roleIds?: string[] | null;
  employeeName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  userStatus?: UserStatus | string | null;
  userType?: UserType | string | null;

  storeId?: string | null;
  employeeId?: string | null;
  passwordHash?: string | null;
  passwordSalt?: string | null;
  lastLoginAt?: Date | null;
  failedLoginCount?: number | null;
  passwordExpiredAt?: Date | null;
  requirePasswordChange?: boolean | null;
  twoFactorEnabled?: boolean | null;
  isDelete?: boolean | null;
  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const UserFields: Record<keyof UserModel, string> = {
  id: 'Id',
  userCode: 'UserCode',
  username: 'Username',
  password: 'Password',
  roleIds: 'RoleIds',
  employeeName: 'EmployeeName',
  email: 'Email',
  phoneNumber: 'PhoneNumber',
  userStatus: 'UserStatus',
  userType: 'UserType',

  storeId: 'StoreId',
  employeeId: 'EmployeeId',
  passwordHash: 'PasswordHash',
  passwordSalt: 'PasswordSalt',
  lastLoginAt: 'LastLoginAt',
  failedLoginCount: 'FailedLoginCount',
  passwordExpiredAt: 'PasswordExpiredAt',
  requirePasswordChange: 'RequirePasswordChange',
  twoFactorEnabled: 'TwoFactorEnabled',
  isDelete: 'IsDelete',
  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};
