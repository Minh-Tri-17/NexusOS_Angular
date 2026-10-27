export interface ProvinceModel {
  id: string;
  countryId?: string | null;
  provinceCode?: string | null;
  provinceName: string;
  isDelete?: boolean | null;

  countryName?: string | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const ProvinceFields: Record<keyof ProvinceModel, string> = {
  id: 'Id',
  countryId: 'CountryId',
  provinceCode: 'ProvinceCode',
  provinceName: 'ProvinceName',
  isDelete: 'IsDelete',

  countryName: 'CountryName',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};
