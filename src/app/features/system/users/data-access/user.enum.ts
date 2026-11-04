import { EnumOption, EnumOptionConfig } from '../../../../core/models/enum.model';

export type { EnumOption, EnumOptionConfig };

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Locked = 'Locked',
}

export enum UserType {
  Employee = 'Employee',
  External = 'External',
  System = 'System',
}

export const USER_STATUS_CONFIG: Record<string, EnumOptionConfig> = {
  [UserStatus.Active]: {
    label: 'common.active',
    icon: 'fa-circle-check',
    cssClass: 'badge-teal',
  },
  [UserStatus.Inactive]: {
    label: 'common.inactive',
    icon: 'fa-circle-pause',
    cssClass: 'badge-orange',
  },
  [UserStatus.Locked]: {
    label: 'user.locked',
    icon: 'fa-lock',
    cssClass: 'badge-rose',
  },
};

export const USER_TYPE_CONFIG: Record<string, EnumOptionConfig> = {
  [UserType.Employee]: {
    label: 'common.employee',
    icon: 'fa-user-tie',
    cssClass: 'badge-indigo',
  },
  [UserType.External]: {
    label: 'user.external',
    icon: 'fa-user-group',
    cssClass: 'badge-purple',
  },
  [UserType.System]: {
    label: 'user.system',
    icon: 'fa-gear',
    cssClass: 'badge-cyan',
  },
};

export const USER_STATUS_OPTIONS: EnumOption<UserStatus>[] = Object.values(UserStatus).map(
  (value) => ({
    value,
    label: USER_STATUS_CONFIG[value]?.label ?? `user.${value.toLowerCase()}`,
    cssClass: USER_STATUS_CONFIG[value]?.cssClass ?? 'badge-secondary',
    icon: USER_STATUS_CONFIG[value]?.icon,
  })
);

export const USER_TYPE_OPTIONS: EnumOption<UserType>[] = Object.values(UserType).map((value) => ({
  value,
  label: USER_TYPE_CONFIG[value]?.label ?? `user.${value.toLowerCase()}`,
  cssClass: USER_TYPE_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: USER_TYPE_CONFIG[value]?.icon,
}));
