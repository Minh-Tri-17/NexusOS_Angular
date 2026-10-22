export interface EmployeeModel {
  id: string;
  employeeCode: string;
  employeeName: string;
  departmentCatId?: string | null;
  jobTitleCatId?: string | null;
  storeId?: string | null;
  countryCatId?: string | null;
  provinceCatId?: string | null;
  wardCatId?: string | null;
  gender: string;
  dateOfBirth: Date;
  phoneNumber: string;
  email: string;
  identityNumber: string;
  address: string;
  hireDate: Date;
  terminationDate: Date;
  employmentStatus: string;
  isMultiStore: boolean;
  photo: string;
  healthInsuranceNumber: string;
  socialInsuranceNumber: string;
  bankAccountNumber: string;
  bankName: string;
  educationLevel: string;
  taxCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  note?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export const EmployeeFields: Record<keyof EmployeeModel, string> = {
  id: 'Id',
  employeeCode: 'EmployeeCode',
  employeeName: 'EmployeeName',
  departmentCatId: 'DepartmentCatId',
  jobTitleCatId: 'JobTitleCatId',
  storeId: 'StoreId',
  countryCatId: 'CountryCatId',
  provinceCatId: 'ProvinceCatId',
  wardCatId: 'WardCatId',
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
