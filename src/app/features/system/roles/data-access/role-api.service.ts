import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../../core/constants/api.constants';
import { Result } from '../../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../../core/models/paging.model';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { RoleModel } from './role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: RoleModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.role.create, data);
  }

  update(data: RoleModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.role.update, data);
  }

  getById(id: string) {
    return this.getHttp<Result<RoleModel>>(API_CONSTANTS.role.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<RoleModel>>>(API_CONSTANTS.role.getPaging, data);
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.role.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.role.hardDelete, ids);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.role.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.role.export, data);
  }

  //#endregion
}
