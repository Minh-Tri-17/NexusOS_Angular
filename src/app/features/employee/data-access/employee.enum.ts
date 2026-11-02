export enum EmploymentStatus {
  active = 'Active',
  remote = 'Remote',
  leave = 'Leave',
  probation = 'Probation',
  resigned = 'Resigned',
}

export enum Gender {
  male = 'Male',
  female = 'Female',
  other = 'Other',
}

export enum EducationLevel {
  highSchool = 'HighSchool',
  associate = 'Associate',
  bachelor = 'Bachelor',
  master = 'Master',
  doctorate = 'Doctorate',
}

export interface StatusConfig {
  label: string;
  cssClass: string;
  icon?: string;
}

export const EMPLOYMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  [EmploymentStatus.active]: {
    label: 'employee.active',
    icon: 'fa-circle-check',
    cssClass: 'badge-green',
  },
  [EmploymentStatus.remote]: {
    label: 'employee.remote',
    icon: 'fa-laptop-house',
    cssClass: 'badge-purple',
  },
  [EmploymentStatus.leave]: {
    label: 'employee.leave',
    icon: 'fa-baby',
    cssClass: 'badge-cyan',
  },
  [EmploymentStatus.probation]: {
    label: 'employee.probation',
    icon: 'fa-hourglass-half',
    cssClass: 'badge-amber',
  },
  [EmploymentStatus.resigned]: {
    label: 'employee.resigned',
    icon: 'fa-circle-xmark',
    cssClass: 'badge-red',
  },
};

export const GENDER_CONFIG: Record<string, StatusConfig> = {
  [Gender.male]: {
    label: 'common.male',
    icon: 'fa-mars text-blue-600',
    cssClass: 'badge-blue',
  },
  [Gender.female]: {
    label: 'common.female',
    icon: 'fa-venus text-purple-600',
    cssClass: 'badge-purple',
  },
  [Gender.other]: {
    label: 'common.other',
    icon: 'fa-genderless text-amber-600',
    cssClass: 'badge-amber',
  },
};

export const EDUCATION_LEVEL_CONFIG: Record<string, StatusConfig> = {
  [EducationLevel.highSchool]: {
    label: 'employee.highSchool',
    cssClass: 'badge-cyan',
  },
  [EducationLevel.associate]: {
    label: 'employee.associate',
    cssClass: 'badge-indigo',
  },
  [EducationLevel.bachelor]: {
    label: 'employee.bachelor',
    cssClass: 'badge-blue',
  },
  [EducationLevel.master]: {
    label: 'employee.master',
    cssClass: 'badge-purple',
  },
  [EducationLevel.doctorate]: {
    label: 'employee.doctorate',
    cssClass: 'badge-teal',
  },
};

export const EMPLOYMENT_STATUS_OPTIONS = Object.values(EmploymentStatus).map((value) => ({
  value,
  label: EMPLOYMENT_STATUS_CONFIG[value]?.label ?? `employee.${value.toLowerCase()}`,
  cssClass: EMPLOYMENT_STATUS_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: EMPLOYMENT_STATUS_CONFIG[value]?.icon,
}));

export const GENDER_OPTIONS = Object.values(Gender).map((value) => ({
  value,
  label: GENDER_CONFIG[value]?.label ?? `common.${value.toLowerCase()}`,
  cssClass: GENDER_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: GENDER_CONFIG[value]?.icon,
}));

export const EDUCATION_LEVEL_OPTIONS = Object.values(EducationLevel).map((value) => ({
  value,
  label: EDUCATION_LEVEL_CONFIG[value]?.label ?? `employee.${value.toLowerCase()}`,
  cssClass: EDUCATION_LEVEL_CONFIG[value]?.cssClass ?? 'badge-secondary',
}));
