import { ApprovalStatus, ContractStatus } from './contract.enum';

export interface ContractModel {
  id: string;
  contractCode?: string | null;
  contractName?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  contractTypeId?: string | null;
  contractTypeName?: string | null;
  contractStatus?: ContractStatus | string | null;
  approvalStatus?: ApprovalStatus | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  baseSalary?: number | null;
  salaryUnit?: string | null;
  workingHoursPerWeek?: number | null;
  otrate?: number | null;
  allowanceAmount?: number | null;
  insuranceContribution?: number | null;
  signedDate?: Date | string | null;
  signedBy?: string | null;
  isDelete?: boolean | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const ContractFields: Record<keyof ContractModel, string> = {
  id: 'Id',
  contractCode: 'ContractCode',
  contractName: 'ContractName',
  employeeId: 'EmployeeId',
  employeeName: 'EmployeeName',
  contractTypeId: 'ContractTypeId',
  contractTypeName: 'ContractTypeName',
  contractStatus: 'ContractStatus',
  approvalStatus: 'ApprovalStatus',
  startDate: 'StartDate',
  endDate: 'EndDate',
  baseSalary: 'BaseSalary',
  salaryUnit: 'SalaryUnit',
  workingHoursPerWeek: 'WorkingHoursPerWeek',
  otrate: 'Otrate',
  allowanceAmount: 'AllowanceAmount',
  insuranceContribution: 'InsuranceContribution',
  signedDate: 'SignedDate',
  signedBy: 'SignedBy',
  isDelete: 'IsDelete',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};

