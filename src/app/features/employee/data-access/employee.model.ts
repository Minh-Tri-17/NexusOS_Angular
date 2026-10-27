import { EmploymentStatus, Gender } from './employee.enum';

export interface EmployeeModel {
  id: string;
  employeeCode?: string | null;
  employeeName: string;
  departmentId?: string | null;
  departmentName?: string | null;
  jobTitleId?: string | null;
  jobTitleName?: string | null;
  storeId?: string | null;
  storeName?: string | null;
  countryId?: string | null;
  countryName?: string | null;
  provinceId?: string | null;
  provinceName?: string | null;
  wardId?: string | null;
  wardName?: string | null;
  gender?: Gender | string | null;
  dateOfBirth?: Date | null;
  phoneNumber?: string | null;
  email?: string | null;
  identityNumber?: string | null;
  address?: string | null;
  hireDate?: Date | null;
  terminationDate?: Date | null;
  employmentStatus?: EmploymentStatus | string | null;
  isMultiStore?: boolean | null;
  photo?: string | null;
  healthInsuranceNumber?: string | null;
  socialInsuranceNumber?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  educationLevel?: string | null;
  taxCode?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const EmployeeFields: Record<keyof EmployeeModel, string> = {
  id: 'Id',
  employeeCode: 'EmployeeCode',
  employeeName: 'EmployeeName',
  departmentId: 'DepartmentId',
  departmentName: 'DepartmentName',
  jobTitleId: 'JobTitleId',
  jobTitleName: 'JobTitleName',
  storeId: 'StoreId',
  storeName: 'StoreName',
  countryId: 'CountryId',
  countryName: 'CountryName',
  provinceId: 'ProvinceId',
  provinceName: 'ProvinceName',
  wardId: 'WardId',
  wardName: 'WardName',
  gender: 'Gender',
  dateOfBirth: 'DateOfBirth',
  phoneNumber: 'PhoneNumber',
  email: 'Email',
  identityNumber: 'IdentityNumber',
  address: 'Address',
  hireDate: 'HireDate',
  terminationDate: 'TerminationDate',
  employmentStatus: 'EmploymentStatus',
  isMultiStore: 'IsMultiStore',
  photo: 'Photo',
  healthInsuranceNumber: 'HealthInsuranceNumber',
  socialInsuranceNumber: 'SocialInsuranceNumber',
  bankAccountNumber: 'BankAccountNumber',
  bankName: 'BankName',
  educationLevel: 'EducationLevel',
  taxCode: 'TaxCode',
  emergencyContactName: 'EmergencyContactName',
  emergencyContactPhone: 'EmergencyContactPhone',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};
