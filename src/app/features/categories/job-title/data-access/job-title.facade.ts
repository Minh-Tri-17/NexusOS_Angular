import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../../core/models/paging.model';
import { JobTitleApiService } from './job-title-api.service';
import { JobTitleModel } from './job-title.model';

@Injectable({
  providedIn: 'root',
})
export class JobTitleFacade {
  private readonly api = inject(JobTitleApiService);

  //#region //@ METHODS

  create(dto: JobTitleModel) {
    return this.api.create(dto);
  }

  update(dto: JobTitleModel) {
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

