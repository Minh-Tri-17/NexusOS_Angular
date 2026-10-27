import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../../core/models/paging.model';
import { UserApiService } from './user-api.service';
import { UserModel } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserFacade {
  private readonly api = inject(UserApiService);

  //#region //@ METHODS

  create(dto: UserModel) {
    return this.api.create(dto);
  }

  update(dto: UserModel) {
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
