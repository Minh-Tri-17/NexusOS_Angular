import { EnumOption, EnumOptionConfig } from '../../../../core/models/enum.model';

export type { EnumOption, EnumOptionConfig };

export enum Region {
  Asia = 'Asia',
  Americas = 'Americas',
  Europe = 'Europe',
  Oceania = 'Oceania',
  Africa = 'Africa',
}

export const REGION_CONFIG: Record<string, EnumOptionConfig> = {
  [Region.Asia]: {
    label: 'country.asia',
    icon: 'fa-earth-asia',
    cssClass: 'badge-teal',
  },
  [Region.Africa]: {
    label: 'country.africa',
    icon: 'fa-earth-africa',
    cssClass: 'badge-purple',
  },
  [Region.Americas]: {
    label: 'country.americas',
    icon: 'fa-earth-americas',
    cssClass: 'badge-cyan',
  },
  [Region.Europe]: {
    label: 'country.europe',
    icon: 'fa-earth-europe',
    cssClass: 'badge-rose',
  },
  [Region.Oceania]: {
    label: 'country.oceania',
    icon: 'fa-earth-oceania',
    cssClass: 'badge-indigo',
  },
};

export const REGION_OPTIONS: EnumOption<Region>[] = Object.values(Region).map((value) => ({
  value,
  label: REGION_CONFIG[value]?.label ?? `country.${value.toLowerCase()}`,
  cssClass: REGION_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: REGION_CONFIG[value]?.icon,
}));
