export interface PermissionModel {
  permissionCode: string;
  permissionValue: string;
  permissionScope: string | null;
  isGranted: boolean;
}

export const PermissionFields: Record<keyof PermissionModel, string> = {
  permissionCode: 'PermissionCode',
  permissionValue: 'PermissionValue',
  permissionScope: 'PermissionScope',
  isGranted: 'IsGranted',
};

export interface PermissionMatrixRow {
  scope: string;
  displayName: string;
  actions: Record<string, PermissionModel | null>;
}
