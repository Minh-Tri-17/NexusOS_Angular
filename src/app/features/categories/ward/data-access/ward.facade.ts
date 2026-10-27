import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../../core/models/paging.model';
import { WardApiService } from './ward-api.service';
import { WardModel } from './ward.model';

@Injectable({
  providedIn: 'root',
})
export class WardFacade {
  private readonly api = inject(WardApiService);

  //#region //@ METHODS

  create(dto: WardModel) {
    return this.api.create(dto);
  }
  update(dto: WardModel) {
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
