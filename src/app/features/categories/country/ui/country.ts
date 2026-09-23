import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BASE_CONSTANTS } from '../../../../core/constants/base.constant';
import { FilterOperator, FilterType } from '../../../../core/constants/filter.enum';
import { PagingRequest } from '../../../../core/models/paging.model';
import { Export } from '../../../../shared/components/export/export';
import { Import } from '../../../../shared/components/import/import';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { Placeholder } from '../../../../shared/components/placeholder/placeholder';
import { Summary } from '../../../../shared/components/summary/summary';
import { Table } from '../../../../shared/components/table/table';
import { Toolbar } from '../../../../shared/components/toolbar/toolbar';
import { Region } from '../data-access/country.enum';
import { CountryFacade } from '../data-access/country.facade';
import { CountryFields, CountryModel } from '../data-access/country.model';
import { CountryModal } from './editor-modal/country-modal';

@Component({
  selector: 'app-country',
  imports: [
    Summary,
    Toolbar,
    Pagination,
    Table,
    Import,
    Export,
    CountryModal,
    DatePipe,
    FormsModule,
    Placeholder,
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

  pageIndex = signal(1);
  pageSize = signal(20);
  fromRecord = signal(1);
  toRecord = signal(20);
  recordRange = signal('');
  totalRecord = signal(0);
  pageCount = signal(0);
  countries = signal([] as CountryModel[]);
  searchText = signal('');
  filterRegion = signal('');
  selectedIds = signal<Set<string>>(new Set());
  filterIsDelete = signal(false);
  isLoading = signal(true);

  readonly isSelectedAll = computed(() => {
    const list = this.countries();
    const ids = this.selectedIds();
    return list.length > 0 && list.every((item) => ids.has(item.id));
  });

  //#endregion

  regions = Object.values(Region);
  modalRef = viewChild.required(CountryModal);

  constructor() {
    effect(() => {
      this.searchText();
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
    const filterIsDeleted = this.filterIsDelete();
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
      this.totalRecord.set(res.result?.totalRecord || 0);
      this.recordRange.set(res.result?.recordRange || '');
      this.fromRecord.set(res.result?.fromRecord || 0);
      this.toRecord.set(res.result?.toRecord || 0);
      this.pageCount.set(res.result?.pageCount || 0);
      this.selectedIds.set(new Set());
      this.isLoading.set(false);
    });
  }

  handleSearch(searchText: string) {
    this.searchText.set(searchText);
    this.pageIndex.set(1);
    this.loadListData();
  }

  handleClearFilter() {
    this.filterIsDelete.set(false);
    this.searchText.set('');
    this.filterRegion.set('');
    this.pageIndex.set(1);
    this.loadListData();
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  handleToggleSelect(id: string) {
    this.selectedIds.update((prev) => {
      const next = new Set(prev);

      next.has(id) ? next.delete(id) : next.add(id);

      return next;
    });
  }

  handleToggleSelectAll() {
    const allSelected = this.isSelectedAll();

    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      const list = this.countries();

      if (allSelected) list.forEach((item) => next.delete(item.id));
      else list.forEach((item) => next.add(item.id));

      return next;
    });
  }

  handleDeleteSelected() {
    const idsArray = Array.from(this.selectedIds());
    if (idsArray.length === 0) return;

    if (!this.filterIsDelete())
      this.facade.softDelete(idsArray.join(',')).then(() => {
        this.loadListData();
      });
    else
      this.facade.hardDelete(idsArray.join(',')).then(() => {
        this.loadListData();
      });
  }

  handleOpenCreate() {
    this.modalRef().initCreateForm();
  }

  handleOpenUpdate() {
    this.modalRef().initUpdateForm(this.getSelectedItem());
  }

  getSelectedItem(): CountryModel {
    const idsArray = Array.from(this.selectedIds());
    if (idsArray.length !== 1) return {} as CountryModel;

    const selectedId = idsArray[0];
    return this.countries().find((item) => item.id === selectedId) || ({} as CountryModel);
  }

  exportFn = (filter: PagingRequest): Promise<Blob> => {
    return this.facade.export(filter);
  };

  importFn = (file: File): Promise<any> => {
    return this.facade.import(file);
  };

  //#endregion
}
