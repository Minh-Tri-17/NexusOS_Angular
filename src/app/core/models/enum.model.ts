export interface EnumOptionConfig {
  label: string;
  cssClass: string;
  icon?: string;
}

export interface EnumOption<T = string> {
  value: T;
  label: string;
  cssClass: string;
  icon?: string;
}

