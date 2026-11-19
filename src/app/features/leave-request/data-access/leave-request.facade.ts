import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../core/models/paging.model';
import { LeaveRequestApiService } from './leave-request-api.service';
import { LeaveRequestModel } from './leave-request.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveRequestFacade {
  private readonly api = inject(LeaveRequestApiService);

  //#region //@ METHODS

  create(dto: LeaveRequestModel) {
    return this.api.create(dto);
  }

  update(dto: LeaveRequestModel) {
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
