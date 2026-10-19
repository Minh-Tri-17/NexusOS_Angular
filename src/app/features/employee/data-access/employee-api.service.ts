import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../core/constants/api.constants';
import { Result } from '../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../core/models/paging.model';
import { BaseApiService } from '../../../core/services/base-api.service';
import { EmployeeModel } from './employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeApiService extends BaseApiService {
  create(data: EmployeeModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.employee.create, data);
  }

  update(data: EmployeeModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.employee.update, data);
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.employee.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.employee.hardDelete, ids);
  }

  getById(id: string) {
    return this.getHttp<Result<EmployeeModel>>(API_CONSTANTS.employee.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<EmployeeModel>>>(
      API_CONSTANTS.employee.getPaging,
      data,
    );
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.employee.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.employee.export, data);
  }
}
