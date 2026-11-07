import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../../core/constants/api.constants';
import { Result } from '../../../../core/models/common.model';
import { PagingRequest, PagingResult } from '../../../../core/models/paging.model';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { ContractTypeModel } from './contract-type.model';

@Injectable({
  providedIn: 'root',
})
export class ContractTypeApiService extends BaseApiService {
  //#region //@ METHODS

  create(data: ContractTypeModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.contractType.create, data);
  }

  update(data: ContractTypeModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.contractType.update, data);
  }

  getById(id: string) {
    return this.getHttp<Result<ContractTypeModel>>(API_CONSTANTS.contractType.getById, { id });
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<ContractTypeModel>>>(
      API_CONSTANTS.contractType.getPaging,
      data,
    );
  }

  softDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.contractType.softDelete, ids);
  }

  hardDelete(ids: string[]) {
    return this.deleteHttp<Result<boolean>>(API_CONSTANTS.contractType.hardDelete, ids);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.contractType.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.contractType.export, data);
  }

  //#endregion
}

