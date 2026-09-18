export interface CountryModel {
  id: string;
  countryCode?: string | null;
  countryName: string;
  capital: string;
  region: string;
  note?: string | null;

  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const CountryFields: Record<keyof CountryModel, string> = {
  id: 'Id',
  countryCode: 'CountryCode',
  countryName: 'CountryName',
  capital: 'Capital',
  region: 'Region',
  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};
