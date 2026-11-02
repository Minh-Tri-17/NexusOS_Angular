export enum UserStatus {
  active = 'Active',
  inactive = 'Inactive',
  locked = 'Locked',
}

export enum UserType {
  employee = 'Employee',
  external = 'External',
  system = 'System',
}

export interface StatusConfig {
  label: string;
  cssClass: string;
}

export const USER_STATUS_CONFIG: Record<string, StatusConfig> = {
  [UserStatus.active]: {
    label: 'common.active',
    cssClass: 'badge-teal',
  },
  [UserStatus.inactive]: {
    label: 'common.inactive',
    cssClass: 'badge-orange',
  },
  [UserStatus.locked]: {
    label: 'user.locked',
    cssClass: 'badge-rose',
  },
};

export const USER_TYPE_CONFIG: Record<string, StatusConfig> = {
  [UserType.employee]: {
    label: 'common.employee',
    cssClass: 'badge-indigo',
  },
  [UserType.external]: {
    label: 'user.external',
    cssClass: 'badge-purple',
  },
  [UserType.system]: {
    label: 'user.system',
    cssClass: 'badge-cyan',
  },
};

export const USER_STATUS_OPTIONS = Object.values(UserStatus).map((value) => ({
  value,
  label: USER_STATUS_CONFIG[value]?.label ?? `user.${value.toLowerCase()}`,
  cssClass: USER_STATUS_CONFIG[value]?.cssClass ?? 'badge-secondary',
}));

export const USER_TYPE_OPTIONS = Object.values(UserType).map((value) => ({
  value,
  label: USER_TYPE_CONFIG[value]?.label ?? `user.${value.toLowerCase()}`,
  cssClass: USER_TYPE_CONFIG[value]?.cssClass ?? 'badge-secondary',
}));
