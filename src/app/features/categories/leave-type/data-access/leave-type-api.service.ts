import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../../core/constants/api.constants';
import { Result } from '../../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../../core/models/paging.model';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { LeaveTypeModel } from './leave-type.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveTypeApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: LeaveTypeModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.leaveType.create, data);
  }

  update(data: LeaveTypeModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.leaveType.update, data);
  }

  getById(id: string) {
    return this.getHttp<Result<LeaveTypeModel>>(API_CONSTANTS.leaveType.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<LeaveTypeModel>>>(API_CONSTANTS.leaveType.getPaging, data);
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.leaveType.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.leaveType.hardDelete, ids);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.leaveType.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.leaveType.export, data);
  }

  //#endregion
}

