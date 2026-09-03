import { Injectable } from '@angular/core';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { PagingRequest, PagingResult } from '../../../../core/models/paging.model';
import { API_CONSTANTS } from '../../../../core/constants/api.constants';
import { Result } from '../../../../core/models/common.model';
import { CountryModel } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class CountryApiService extends BaseApiService {
  create(data: CountryModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.country.create, data);
  }

  update(data: CountryModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.country.update, data);
  }

  softDelete(ids: string) {
    return this.deleteHttp<Result<boolean>>(`${API_CONSTANTS.country.softDelete}?ids=${ids}`);
  }

  hardDelete(ids: string) {
    return this.deleteHttp<Result<boolean>>(`${API_CONSTANTS.country.hardDelete}?ids=${ids}`);
  }

  getById(id: string) {
    return this.getHttp<Result<CountryModel>>(API_CONSTANTS.country.getById, id);
  }

  getPaging(data: PagingRequest) {
    return this.postHttp<Result<PagingResult<CountryModel>>>(
      API_CONSTANTS.country.getPaging,
      data,
    );
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postHttp<Result<boolean>>(API_CONSTANTS.country.import, formData);
  }

  export(data: PagingRequest) {
    return this.postBlobHttp(API_CONSTANTS.country.export, data);
  }
}