import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../../core/constants/api.constants';
import { Result } from '../../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../../core/models/paging.model';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { WardModel } from './ward.model';

@Injectable({
  providedIn: 'root',
})
export class WardApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: WardModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.ward.create, data);
  }
  update(data: WardModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.ward.update, data);
  }
  getById(id: string) {
    return this.getHttp<Result<WardModel>>(API_CONSTANTS.ward.getById, { id });
  }
  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<WardModel>>>(API_CONSTANTS.ward.getPaging, data);
  }
  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.ward.softDelete, ids);
  }
  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.ward.hardDelete, ids);
  }
  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.ward.import, formData);
  }
  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.ward.export, data);
  }

  //#endregion
}
