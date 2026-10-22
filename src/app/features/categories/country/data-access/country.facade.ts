import { inject, Injectable } from '@angular/core';
import { PagingRequest } from '../../../../core/models/paging.model';
import { CountryApiService } from './country-api.service';
import { CountryModel } from './country.model';

@Injectable({
  providedIn: 'root',
})
export class CountryFacade {
  private readonly api = inject(CountryApiService);

  //#region //@ METHODS

  create(dto: CountryModel) {
    return this.api.create(dto);
  }

  update(dto: CountryModel) {
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
