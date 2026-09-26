export interface CountryModel {
  id: string;
  countryCode?: string;
  countryName: string;
  capital: string;
  region: string;
  note?: string;

  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
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
