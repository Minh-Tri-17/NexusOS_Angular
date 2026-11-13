import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../../core/models/paging.model';
import { RoleApiService } from './role-api.service';
import { RoleModel } from './role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleFacade {
  private readonly api = inject(RoleApiService);

  //#region //@ METHODS

  create(dto: RoleModel) {
    return this.api.create(dto);
  }

  update(dto: RoleModel) {
    return this.api.update(dto);
  }

  getById(id: string) {
    return this.api.getById(id);
  }

  getPaging(filter: PagingRequest) {
    return this.api.getPaging(filter);
  }

  softDelete(ids: string[]) {
    return this.api.softDelete(ids);
  }

  hardDelete(ids: string[]) {
    return this.api.hardDelete(ids);
  }

  import(file: File) {
    return this.api.import(file);
  }

  export(filter: PagingRequest) {
    return this.api.export(filter);
  }

  async getPermission(): Promise<string[]> {
    try {
      const res = await this.api.getPermission();
      if (Array.isArray(res)) return res;

      if (res && typeof res === 'object' && Array.isArray((res as any).result))
        return (res as any).result;

      return [];
    } catch {
      return [];
    }
  }

  async getPermissionsByRoleIds(roleIds: string[]): Promise<string[]> {
    if (!roleIds || roleIds.length === 0) return [];

    try {
      const res = await this.api.getPermissionsByRoleIds(roleIds);
      const items = res?.result?.items || [];

      const grantedCodes = items.map((item) =>
        item.permissionValue
          ? `${item.permissionCode}.${item.permissionValue}`
          : item.permissionCode,
      );

      //* Gộp và khử trùng lặp quyền từ nhiều vai trò
      return Array.from(new Set(grantedCodes));
    } catch {
      return [];
    }
  }

  //#endregion
}
