import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../core/constants/api.constants';
import { Result } from '../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../core/models/paging.model';
import { BaseApiService } from '../../../core/services/base-api.service';
import { CandidateModel } from './candidate.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: CandidateModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.candidate.create, data);
  }

  update(data: CandidateModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.candidate.update, data);
  }

  getById(id: string) {
    return this.getHttp<Result<CandidateModel>>(API_CONSTANTS.candidate.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<CandidateModel>>>(
      API_CONSTANTS.candidate.getPaging,
      data,
    );
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.candidate.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.candidate.hardDelete, ids);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.candidate.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.candidate.export, data);
  }

  //#endregion
}
