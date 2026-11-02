export enum Region {
  asia = 'Asia',
  americas = 'Americas',
  europe = 'Europe',
  oceania = 'Oceania',
  africa = 'Africa',
}

export interface StatusConfig {
  label: string;
  cssClass: string;
}

export const REGION_CONFIG: Record<string, StatusConfig> = {
  [Region.asia]: {
    label: 'country.asia',
    cssClass: 'badge-teal',
  },
  [Region.africa]: {
    label: 'country.africa',
    cssClass: 'badge-purple',
  },
  [Region.americas]: {
    label: 'country.americas',
    cssClass: 'badge-cyan',
  },
  [Region.europe]: {
    label: 'country.europe',
    cssClass: 'badge-rose',
  },
  [Region.oceania]: {
    label: 'country.oceania',
    cssClass: 'badge-indigo',
  },
};

export const REGION_OPTIONS = Object.values(Region).map((value) => ({
  value,
  label: REGION_CONFIG[value]?.label ?? `country.${value.toLowerCase()}`,
  cssClass: REGION_CONFIG[value]?.cssClass ?? 'badge-secondary',
}));
