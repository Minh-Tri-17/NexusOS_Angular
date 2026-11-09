import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../../core/constants/api.constants';
import { Result } from '../../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../../core/models/paging.model';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { JobTitleModel } from './job-title.model';

@Injectable({
  providedIn: 'root',
})
export class JobTitleApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: JobTitleModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.jobTitle.create, data);
  }

  update(data: JobTitleModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.jobTitle.update, data);
  }

  getById(id: string) {
    return this.getHttp<Result<JobTitleModel>>(API_CONSTANTS.jobTitle.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<JobTitleModel>>>(
      API_CONSTANTS.jobTitle.getPaging,
      data,
    );
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.jobTitle.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.jobTitle.hardDelete, ids);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.jobTitle.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.jobTitle.export, data);
  }

  //#endregion
}

