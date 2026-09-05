import { inject, Injectable, signal } from '@angular/core';
import { CountryApiService } from './services/country-api.service';
import { CountryModel } from './models/country.model';
import { PagingRequest } from '../../../../core/models/paging.model';

@Injectable({
  providedIn: 'root',
})
export class CountryFacade {
  private readonly api = inject(CountryApiService);

  create(dto: CountryModel) {
    return this.api.create(dto);
  }

  update(dto: CountryModel) {
    return this.api.update(dto);
  }

  softDelete(ids: string) {
    return this.api.softDelete(ids);
  }

  hardDelete(ids: string) {
    return this.api.hardDelete(ids);
  }

  getById(id: string) {
    return this.api.getById(id);
  }

  getPaging(filter: PagingRequest) {
    return this.api.getPaging(filter);
  }

  import(file: File) {
    return this.api.import(file);
  }

  export(filter: PagingRequest) {
    return this.api.export(filter);
  }
}
