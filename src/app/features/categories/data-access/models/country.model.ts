export interface CountryModel {
  id: string;
  countryName?: string | null;
  countryCode?: string | null;
  note?: string | null;

  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export const CountryFields: Record<keyof CountryModel, string> = {
  id: 'Id',
  countryCode: 'CountryCode',
  countryName: 'CountryName',
  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};
