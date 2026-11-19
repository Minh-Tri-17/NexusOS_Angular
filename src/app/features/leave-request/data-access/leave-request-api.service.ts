import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../core/constants/api.constants';
import { Result } from '../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../core/models/paging.model';
import { BaseApiService } from '../../../core/services/base-api.service';
import { LeaveRequestModel } from './leave-request.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveRequestApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: LeaveRequestModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.leaveRequest.create, data);
  }

  update(data: LeaveRequestModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.leaveRequest.update, data);
  }

  getById(id: string) {
    return this.getHttp<Result<LeaveRequestModel>>(API_CONSTANTS.leaveRequest.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<LeaveRequestModel>>>(
      API_CONSTANTS.leaveRequest.getPaging,
      data,
    );
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.leaveRequest.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.leaveRequest.hardDelete, ids);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.leaveRequest.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.leaveRequest.export, data);
  }

  //#endregion
}
