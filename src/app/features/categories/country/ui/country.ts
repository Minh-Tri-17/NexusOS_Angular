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
import { CountryFields, CountryModel } from '../data-access/country.model';
import { FormsModule } from '@angular/forms';
import { Region } from '../data-access/country.enum';

@Component({
  selector: 'app-country',
  imports: [
    Summary,
    Toolbar,
    Pagination,
    Table,
    Import,
    Export,
    EditorModal,
    DatePipe,
    FormsModule,
  ],
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

  regions = Object.values(Region);

  pageIndex = signal<number>(1);
  pageSize = signal<number>(20);
  fromRecord = signal<number>(1);
  toRecord = signal<number>(20);
  recordRange = signal<string>('');
  totalRecord = signal<number>(0);
  pageCount = signal<number>(0);
  countries = signal<CountryModel[]>([]);
  searchText = signal<string>('');
  filterRegion = signal<string>('');
  selectedIds = signal<Set<string>>(new Set());

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

    const filterText = this.searchText().trim();
    const filterIsDeleted = false;
    const filterRegion = this.filterRegion().trim();

    filter.filters = [];

    filter.filters.push({
      filterName: BASE_CONSTANTS.isDelete,
      filterValue: filterIsDeleted.toString(),
      filterType: FilterType.Boolean,
    });

    if (filterText)
      filter.filters.push({
        filterName: `${CountryFields.countryCode},${CountryFields.countryName}`,
        filterValue: filterText,
        filterType: FilterType.String,
        filterOperator: FilterOperator.Like,
      });

    if (filterRegion)
      filter.filters.push({
        filterName: CountryFields.region,
        filterValue: filterRegion,
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
    this.facade.getPaging(filter).then((res: any) => {
      this.countries.set(res.result?.items || []);
      this.fromRecord.set(res.result?.fromRecord || 1);
      this.totalRecord.set(res.result?.totalRecord || 0);
      this.recordRange.set(res.result?.recordRange || '');
      this.fromRecord.set(res.result?.fromRecord || 0);
      this.toRecord.set(res.result?.toRecord || 0);
      this.pageCount.set(res.result?.pageCount || 0);
    });
  }

  handleSearch(searchText: string) {
    this.searchText.set(searchText);
    this.pageIndex.set(1);
    this.loadListData();
  }

  handleClearFilter() {
    this.filterRegion.set('');
    this.pageIndex.set(1);
    this.loadListData();
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  handleToggleSelect(id: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const currentIds = new Set(this.selectedIds());

    checked ? currentIds.add(id) : currentIds.delete(id);

    this.selectedIds.set(currentIds);
  }

  isSelectedAll(): boolean {
    const list = this.countries();
    return list.length > 0 && list.every((item) => this.selectedIds().has(item.id));
  }

  handleToggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const currentIds = new Set(this.selectedIds());

    if (checked) this.countries().forEach((item) => currentIds.add(item.id));
    else this.countries().forEach((item) => currentIds.delete(item.id));

    this.selectedIds.set(currentIds);
  }

  exportFn = (filter: PagingRequest): Promise<Blob> => {
    return this.facade.export(filter);
  };

  importFn = (file: File): Promise<any> => {
    return this.facade.import(file);
  };

  //#endregion
}
