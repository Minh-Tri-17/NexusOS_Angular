import { Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Summary } from '../../../../shared/components/summary/summary';
import { Toolbar } from '../../../../shared/components/toolbar/toolbar';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { Table } from '../../../../shared/components/table/table';
import { Import } from '../../../../shared/components/import/import';
import { Export } from '../../../../shared/components/export/export';
import { EditorModal } from './editor-modal/editor-modal';
import { CountryFacade } from '../data-access/country.facade';
import { PagingRequest } from '../../../../core/models/paging.model';
import { BASE_CONSTANTS } from '../../../../core/constants/base.constant';
import { FilterOperator, FilterType } from '../../../../core/constants/filter.enum';
import { CountryFields, CountryModel } from '../data-access/models/country.model';

@Component({
  selector: 'app-country',
  imports: [Summary, Toolbar, Pagination, Table, Import, Export, EditorModal, DatePipe],
  templateUrl: './country.html',
  styleUrl: './country.scss',
})
export class Country {
  private facade = inject(CountryFacade);

  //#region //@ STATE

  protected readonly badgeColors = [
    'badge-blue',
    'badge-green',
    'badge-amber',
    'badge-purple',
    'badge-rose',
    'badge-cyan',
    'badge-orange',
    'badge-red',
    'badge-slate',
    'badge-indigo',
    'badge-teal',
  ];

  pageIndex = signal<number>(1);
  pageSize = signal<number>(20);
  fromRecord = signal<number>(1);
  toRecord = signal<number>(20);
  recordRange = signal<string>('');
  totalRecord = signal<number>(0);
  pageCount = signal<number>(0);
  countries = signal<CountryModel[]>([]);

  //#endregion

  constructor() {
    effect(() => {
      this.loadListData();
    });
  }

  //#region //@ HELPERS

  buildFilter(): PagingRequest {
    const filter: PagingRequest = {
      allowPaging: true,
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    };

    const searchVal = '';
    const searchCodeVal = '';
    const searchIsDeleted = false;

    filter.filters = [];

    filter.filters.push({
      filterName: BASE_CONSTANTS.isDelete,
      filterValue: searchIsDeleted.toString(),
      filterType: FilterType.Boolean,
    });

    if (searchVal)
      filter.filters.push({
        filterName: CountryFields.countryName,
        filterValue: searchVal,
        filterType: FilterType.String,
        filterOperator: FilterOperator.Like,
      });

    if (searchCodeVal)
      filter.filters.push({
        filterName: CountryFields.countryCode,
        filterValue: searchCodeVal,
        filterType: FilterType.String,
        filterOperator: FilterOperator.Like,
      });

    return filter;
  }

  returnZero() {
    return 0;
  }

  //#endregion

  //#region //@ METHODS

  loadListData() {
    const filter = this.buildFilter();
    this.facade.getPaging(filter).then((res) => {
      this.countries.set(res.result?.items || []);
      this.fromRecord.set(res.result?.fromRecord || 1);
      this.totalRecord.set(res.result?.totalRecord || 0);
      this.recordRange.set(res.result?.recordRange || '');
      this.fromRecord.set(res.result?.fromRecord || 0);
      this.toRecord.set(res.result?.toRecord || 0);
      this.pageCount.set(res.result?.pageCount || 0);
    });
  }

  //#endregion
}
