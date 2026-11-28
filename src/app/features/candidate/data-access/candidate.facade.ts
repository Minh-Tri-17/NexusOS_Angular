import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../core/models/paging.model';
import { CandidateApiService } from './candidate-api.service';
import { CandidateModel } from './candidate.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateFacade {
  private readonly api = inject(CandidateApiService);

  //#region //@ METHODS

  create(dto: CandidateModel) {
    return this.api.create(dto);
  }

  update(dto: CandidateModel) {
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
