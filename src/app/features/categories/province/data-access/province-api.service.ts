import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../../core/constants/api.constants';
import { Result } from '../../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../../core/models/paging.model';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { ProvinceModel } from './province.model';

@Injectable({
  providedIn: 'root',
})
export class ProvinceApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: ProvinceModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.province.create, data);
  }
  update(data: ProvinceModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.province.update, data);
  }
  getById(id: string) {
    return this.getHttp<Result<ProvinceModel>>(API_CONSTANTS.province.getById, { id });
  }
  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<ProvinceModel>>>(
      API_CONSTANTS.province.getPaging,
      data,
    );
  }
  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.province.softDelete, ids);
  }
  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.province.hardDelete, ids);
  }
  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.province.import, formData);
  }
  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.province.export, data);
  }

  //#endregion
}
