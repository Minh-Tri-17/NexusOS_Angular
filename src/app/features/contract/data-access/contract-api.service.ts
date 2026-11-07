import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../core/constants/api.constants';
import { Result } from '../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../core/models/paging.model';
import { BaseApiService } from '../../../core/services/base-api.service';
import { ContractModel } from './contract.model';

@Injectable({
  providedIn: 'root',
})
export class ContractApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: ContractModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.contract.create, data);
  }

  update(data: ContractModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.contract.update, data);
  }

  getById(id: string) {
    return this.getHttp<Result<ContractModel>>(API_CONSTANTS.contract.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<ContractModel>>>(
      API_CONSTANTS.contract.getPaging,
      data,
    );
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.contract.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.contract.hardDelete, ids);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.contract.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.contract.export, data);
  }

  //#endregion
}

