import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../core/models/paging.model';
import { EmployeeApiService } from './employee-api.service';
import { EmployeeModel } from './employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeFacade {
  private readonly api = inject(EmployeeApiService);

  //#region //@ METHODS

  create(dto: EmployeeModel) {
    return this.api.create(dto);
  }

  update(dto: EmployeeModel) {
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
