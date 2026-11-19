import { LeaveTypeModel } from '../../categories/leave-type/data-access/leave-type.model';
import { EmployeeModel } from '../../employee/data-access/employee.model';
import { LeaveApprovalStatus } from './leave-request.enum';

export interface LeaveRequestModel {
  id: string;
  leaveRequestCode?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  employee?: EmployeeModel | null;
  leaveTypeId?: string | null;
  leaveTypeName?: string | null;
  leaveType?: LeaveTypeModel | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  totalDays?: number | null;
  reason?: string | null;
  fileAttach?: string | null;
  approvalStatus?: LeaveApprovalStatus | string | null;
  isDelete?: boolean | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const LeaveRequestFields: Record<keyof LeaveRequestModel, string> = {
  id: 'Id',
  leaveRequestCode: 'LeaveRequestCode',
  employeeId: 'EmployeeId',
  employeeName: 'EmployeeName',
  employee: 'Employee',
  leaveTypeId: 'LeaveTypeId',
  leaveTypeName: 'LeaveTypeName',
  leaveType: 'LeaveType',
  startDate: 'StartDate',
  endDate: 'EndDate',
  totalDays: 'TotalDays',
  reason: 'Reason',
  fileAttach: 'FileAttach',
  approvalStatus: 'ApprovalStatus',
  isDelete: 'IsDelete',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};
