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

  //#endregion
}
