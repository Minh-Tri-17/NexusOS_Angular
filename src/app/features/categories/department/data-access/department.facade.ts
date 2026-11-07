import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../../core/models/paging.model';
import { DepartmentApiService } from './department-api.service';
import { DepartmentModel } from './department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentFacade {
  private readonly api = inject(DepartmentApiService);

  //#region //@ METHODS

  create(dto: DepartmentModel) {
    return this.api.create(dto);
  }

  update(dto: DepartmentModel) {
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

