import { EnumOption, EnumOptionConfig } from '../../../core/models/enum.model';

export type { EnumOption, EnumOptionConfig };

export enum LeaveApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
}

export const LEAVE_APPROVAL_STATUS_CONFIG: Record<string, EnumOptionConfig> = {
  [LeaveApprovalStatus.Pending]: {
    label: 'leaveRequest.pending',
    icon: 'fa-hourglass-half',
    cssClass: 'badge-amber',
  },
  [LeaveApprovalStatus.Approved]: {
    label: 'leaveRequest.approved',
    icon: 'fa-check-double',
    cssClass: 'badge-teal',
  },
  [LeaveApprovalStatus.Rejected]: {
    label: 'leaveRequest.rejected',
    icon: 'fa-xmark',
    cssClass: 'badge-rose',
  },
  [LeaveApprovalStatus.Cancelled]: {
    label: 'leaveRequest.cancelled',
    icon: 'fa-ban',
    cssClass: 'badge-slate',
  },
};

export const LEAVE_APPROVAL_STATUS_OPTIONS: EnumOption<LeaveApprovalStatus>[] = Object.values(
  LeaveApprovalStatus,
).map((value) => ({
  value,
  label: LEAVE_APPROVAL_STATUS_CONFIG[value]?.label ?? `leaveRequest.${value.toLowerCase()}`,
  cssClass: LEAVE_APPROVAL_STATUS_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: LEAVE_APPROVAL_STATUS_CONFIG[value]?.icon,
}));
