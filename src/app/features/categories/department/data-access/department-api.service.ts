import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../../core/constants/api.constants';
import { Result } from '../../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../../core/models/paging.model';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { DepartmentModel } from './department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: DepartmentModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.department.create, data);
  }

  update(data: DepartmentModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.department.update, data);
  }

  getById(id: string) {
    return this.getHttp<Result<DepartmentModel>>(API_CONSTANTS.department.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<DepartmentModel>>>(
      API_CONSTANTS.department.getPaging,
      data,
    );
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.department.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.department.hardDelete, ids);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.department.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.department.export, data);
  }

  //#endregion
}

