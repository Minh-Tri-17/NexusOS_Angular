import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../../core/models/paging.model';
import { ProvinceApiService } from './province-api.service';
import { ProvinceModel } from './province.model';

@Injectable({
  providedIn: 'root',
})
export class ProvinceFacade {
  private readonly api = inject(ProvinceApiService);

  //#region //@ METHODS

  create(dto: ProvinceModel) {
    return this.api.create(dto);
  }
  update(dto: ProvinceModel) {
    return this.api.update(dto);
  }
  getById(id: string) {
    return this.api.getById(id);
  }
  getPaging(filter: PagingRequest) {
    return this.api.getPaging(filter);
  }
  softDelete(ids: string[]) {
    return this.api.softDelete(ids);
  }
  hardDelete(ids: string[]) {
    return this.api.hardDelete(ids);
  }
  import(file: File) {
    return this.api.import(file);
  }
  export(filter: PagingRequest) {
    return this.api.export(filter);
  }

  //#endregion
}
