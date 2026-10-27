import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../../core/constants/api.constants';
import { Result } from '../../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../../core/models/paging.model';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { UserModel } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: UserModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.user.create, data);
  }

  update(data: UserModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.user.update, data);
  }

  getById(id: string) {
    return this.getHttp<Result<UserModel>>(API_CONSTANTS.user.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<UserModel>>>(API_CONSTANTS.user.getPaging, data);
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.user.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.user.hardDelete, ids);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.user.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.user.export, data);
  }

  //#endregion
}
