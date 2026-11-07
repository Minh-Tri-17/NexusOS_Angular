export interface ContractTypeModel {
  id: string;
  contractTypeCode?: string | null;
  contractTypeName: string;
  isDelete?: boolean | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const ContractTypeFields: Record<keyof ContractTypeModel, string> = {
  id: 'Id',
  contractTypeCode: 'ContractTypeCode',
  contractTypeName: 'ContractTypeName',
  isDelete: 'IsDelete',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};

