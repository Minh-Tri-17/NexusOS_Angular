import { EnumOption, EnumOptionConfig } from '../../../core/models/enum.model';

export type { EnumOption, EnumOptionConfig };

export enum EmploymentStatus {
  Active = 'Active',
  Remote = 'Remote',
  Leave = 'Leave',
  Probation = 'Probation',
  Resigned = 'Resigned',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum EducationLevel {
  HighSchool = 'HighSchool',
  Associate = 'Associate',
  Bachelor = 'Bachelor',
  Master = 'Master',
  Doctorate = 'Doctorate',
}

export const EMPLOYMENT_STATUS_CONFIG: Record<string, EnumOptionConfig> = {
  [EmploymentStatus.Active]: {
    label: 'employee.active',
    icon: 'fa-circle-check',
    cssClass: 'badge-green',
  },
  [EmploymentStatus.Remote]: {
    label: 'employee.remote',
    icon: 'fa-laptop-house',
    cssClass: 'badge-purple',
  },
  [EmploymentStatus.Leave]: {
    label: 'employee.leave',
    icon: 'fa-plane-departure',
    cssClass: 'badge-cyan',
  },
  [EmploymentStatus.Probation]: {
    label: 'employee.probation',
    icon: 'fa-hourglass-half',
    cssClass: 'badge-amber',
  },
  [EmploymentStatus.Resigned]: {
    label: 'employee.resigned',
    icon: 'fa-circle-xmark',
    cssClass: 'badge-red',
  },
};

export const GENDER_CONFIG: Record<string, EnumOptionConfig> = {
  [Gender.Male]: {
    label: 'common.male',
    icon: 'fa-mars',
    cssClass: 'badge-blue',
  },
  [Gender.Female]: {
    label: 'common.female',
    icon: 'fa-venus',
    cssClass: 'badge-purple',
  },
  [Gender.Other]: {
    label: 'common.other',
    icon: 'fa-genderless',
    cssClass: 'badge-amber',
  },
};

export const EDUCATION_LEVEL_CONFIG: Record<string, EnumOptionConfig> = {
  [EducationLevel.HighSchool]: {
    label: 'employee.highSchool',
    icon: 'fa-school',
    cssClass: 'badge-cyan',
  },
  [EducationLevel.Associate]: {
    label: 'employee.associate',
    icon: 'fa-certificate',
    cssClass: 'badge-indigo',
  },
  [EducationLevel.Bachelor]: {
    label: 'employee.bachelor',
    icon: 'fa-user-graduate',
    cssClass: 'badge-blue',
  },
  [EducationLevel.Master]: {
    label: 'employee.master',
    icon: 'fa-graduation-cap',
    cssClass: 'badge-purple',
  },
  [EducationLevel.Doctorate]: {
    label: 'employee.doctorate',
    icon: 'fa-award',
    cssClass: 'badge-teal',
  },
};

export const EMPLOYMENT_STATUS_OPTIONS: EnumOption<EmploymentStatus>[] = Object.values(
  EmploymentStatus
).map((value) => ({
  value,
  label: EMPLOYMENT_STATUS_CONFIG[value]?.label ?? `employee.${value.toLowerCase()}`,
  cssClass: EMPLOYMENT_STATUS_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: EMPLOYMENT_STATUS_CONFIG[value]?.icon,
}));

export const GENDER_OPTIONS: EnumOption<Gender>[] = Object.values(Gender).map((value) => ({
  value,
  label: GENDER_CONFIG[value]?.label ?? `common.${value.toLowerCase()}`,
  cssClass: GENDER_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: GENDER_CONFIG[value]?.icon,
}));

export const EDUCATION_LEVEL_OPTIONS: EnumOption<EducationLevel>[] = Object.values(
  EducationLevel
).map((value) => ({
  value,
  label: EDUCATION_LEVEL_CONFIG[value]?.label ?? `employee.${value.toLowerCase()}`,
  cssClass: EDUCATION_LEVEL_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: EDUCATION_LEVEL_CONFIG[value]?.icon,
}));
