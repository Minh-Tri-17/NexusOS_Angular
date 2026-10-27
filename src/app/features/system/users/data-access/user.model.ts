import { UserStatus, UserType } from './user.enum';

export interface UserModel {
  id: string;
  storeId?: string | null;
  employeeId?: string | null;
  userCode?: string | null;
  username?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  passwordHash?: string | null;
  passwordSalt?: string | null;
  userStatus?: UserStatus | string | null;
  userType?: UserType | string | null;
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
  storeId: 'StoreId',
  employeeId: 'EmployeeId',
  userCode: 'UserCode',
  username: 'Username',
  email: 'Email',
  phoneNumber: 'PhoneNumber',
  passwordHash: 'PasswordHash',
  passwordSalt: 'PasswordSalt',
  userStatus: 'UserStatus',
  userType: 'UserType',
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
