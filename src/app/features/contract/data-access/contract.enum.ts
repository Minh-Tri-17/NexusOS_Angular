import { EnumOption, EnumOptionConfig } from '../../../core/models/enum.model';

export type { EnumOption, EnumOptionConfig };

export enum ContractStatus {
  Canceled = 'Canceled',
  Active = 'Active',
  Expired = 'Expired',
  Terminated = 'Terminated',
  Renewed = 'Renewed',
}

export enum ApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
}

export enum SalaryUnit {
  VND = 'VND',
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
  CNY = 'CNY',
}

export const CONTRACT_STATUS_CONFIG: Record<string, EnumOptionConfig> = {
  [ContractStatus.Canceled]: {
    label: 'contract.canceled',
    icon: 'fa-ban',
    cssClass: 'badge-rose',
  },
  [ContractStatus.Active]: {
    label: 'contract.active',
    icon: 'fa-circle-check',
    cssClass: 'badge-green',
  },
  [ContractStatus.Expired]: {
    label: 'contract.expired',
    icon: 'fa-clock',
    cssClass: 'badge-amber',
  },
  [ContractStatus.Terminated]: {
    label: 'contract.terminated',
    icon: 'fa-circle-xmark',
    cssClass: 'badge-red',
  },
  [ContractStatus.Renewed]: {
    label: 'contract.renewed',
    icon: 'fa-arrows-rotate',
    cssClass: 'badge-blue',
  },
};

export const APPROVAL_STATUS_CONFIG: Record<string, EnumOptionConfig> = {
  [ApprovalStatus.Pending]: {
    label: 'contract.pending',
    icon: 'fa-hourglass-half',
    cssClass: 'badge-amber',
  },
  [ApprovalStatus.Approved]: {
    label: 'contract.approved',
    icon: 'fa-check-double',
    cssClass: 'badge-teal',
  },
  [ApprovalStatus.Rejected]: {
    label: 'contract.rejected',
    icon: 'fa-xmark',
    cssClass: 'badge-rose',
  },
  [ApprovalStatus.Cancelled]: {
    label: 'contract.cancelled',
    icon: 'fa-ban',
    cssClass: 'badge-slate',
  },
};

export const CONTRACT_STATUS_OPTIONS: EnumOption<ContractStatus>[] = Object.values(
  ContractStatus,
).map((value) => ({
  value,
  label: CONTRACT_STATUS_CONFIG[value]?.label ?? `contract.${value.toLowerCase()}`,
  cssClass: CONTRACT_STATUS_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: CONTRACT_STATUS_CONFIG[value]?.icon,
}));

export const APPROVAL_STATUS_OPTIONS: EnumOption<ApprovalStatus>[] = Object.values(
  ApprovalStatus,
).map((value) => ({
  value,
  label: APPROVAL_STATUS_CONFIG[value]?.label ?? `contract.${value.toLowerCase()}`,
  cssClass: APPROVAL_STATUS_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: APPROVAL_STATUS_CONFIG[value]?.icon,
}));

export const SALARY_UNIT_CONFIG: Record<string, EnumOptionConfig> = {
  [SalaryUnit.VND]: {
    label: 'VND',
    cssClass: 'badge-blue',
  },
  [SalaryUnit.USD]: {
    label: 'USD',
    cssClass: 'badge-teal',
  },
  [SalaryUnit.EUR]: {
    label: 'EUR',
    cssClass: 'badge-indigo',
  },
  [SalaryUnit.JPY]: {
    label: 'JPY',
    cssClass: 'badge-amber',
  },
  [SalaryUnit.CNY]: {
    label: 'CNY',
    cssClass: 'badge-rose',
  },
};

export const SALARY_UNIT_OPTIONS: EnumOption<SalaryUnit>[] = Object.values(SalaryUnit).map(
  (value) => ({
    value,
    label: SALARY_UNIT_CONFIG[value]?.label ?? value,
    cssClass: SALARY_UNIT_CONFIG[value]?.cssClass ?? 'badge-secondary',
  }),
);


