export interface WardModel {
  id: string;
  provinceId?: string | null;
  wardCode?: string | null;
  wardName: string;
  isDelete?: boolean | null;

  provinceName?: string | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const WardFields: Record<keyof WardModel, string> = {
  id: 'Id',
  provinceId: 'ProvinceId',
  wardCode: 'WardCode',
  wardName: 'WardName',
  isDelete: 'IsDelete',

  provinceName: 'ProvinceName',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};
