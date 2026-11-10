import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, Injector, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { BASE_CONSTANTS } from '../../../core/constants/base.constant';
import { FilterOperator, FilterType } from '../../../core/constants/filter.enum';
import { PagingRequest } from '../../../core/models/paging.model';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { Export } from '../../../shared/components/export/export';
import { Import } from '../../../shared/components/import/import';
import {
  EXPORT_MODAL_CONTEXT,
  IMPORT_MODAL_CONTEXT,
} from '../../../shared/components/modal/modal-context';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Placeholder } from '../../../shared/components/placeholder/placeholder';
import { Summary } from '../../../shared/components/summary/summary';
import { Table } from '../../../shared/components/table/table';
import { Toolbar } from '../../../shared/components/toolbar/toolbar';
import { EmptyFallbackPipe } from '../../../shared/pipes/empty-fallback.pipe';
import { MaskPipe } from '../../../shared/pipes/mask.pipe';
import {
  EDUCATION_LEVEL_CONFIG,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_CONFIG,
  EMPLOYMENT_STATUS_OPTIONS,
  Gender,
  GENDER_CONFIG,
  GENDER_OPTIONS,
} from '../data-access/employee.enum';
import { EmployeeFacade } from '../data-access/employee.facade';
import { EmployeeFields, EmployeeModel } from '../data-access/employee.model';
import { EmployeeModal } from './editor-modal/employee-modal';

@Component({
  selector: 'app-employee',
  imports: [
    Pagination,
    Summary,
    Toolbar,
    Table,
    DatePipe,
    Placeholder,
    FormsModule,
    TranslatePipe,
    EmptyFallbackPipe,
    MaskPipe,
  ],
  templateUrl: './employee.html',
  styleUrl: './employee.scss',
})
export class Employee {
  private readonly facade = inject(EmployeeFacade);
  private readonly modal = inject(NgbModal);
  private readonly injector = inject(Injector);
  private readonly dialogService = inject(DialogService);

  //#region //@ PROPS

  readonly Gender = Gender;

  readonly employmentStatuses = EMPLOYMENT_STATUS_OPTIONS;
  readonly employmentStatusConfig = EMPLOYMENT_STATUS_CONFIG;
  readonly genders = GENDER_OPTIONS;
  readonly genderConfig = GENDER_CONFIG;
  readonly educationLevels = EDUCATION_LEVEL_OPTIONS;
  readonly educationLevelConfig = EDUCATION_LEVEL_CONFIG;

  readonly employeeColumns = Object.keys(EmployeeFields).filter(
    (key) =>
      key !== 'departmentId' &&
      key !== 'jobTitleId' &&
      key !== 'storeId' &&
      key !== 'countryId' &&
      key !== 'provinceId' &&
      key !== 'wardId' &&
      key !== 'id' &&
      key !== 'note' &&
      key !== 'createdAt' &&
      key !== 'createdBy' &&
      key !== 'updatedAt' &&
      key !== 'updatedBy',
  );

  //#endregion

  //#region //@ STATE

  readonly pageSize = signal(20);
  readonly fromRecord = signal(1);
  readonly toRecord = signal(20);
  readonly recordRange = signal('');
  readonly totalRecord = signal(0);
  readonly pageCount = signal(0);
  readonly employees = signal<EmployeeModel[]>([]);
  readonly searchText = signal('');
  readonly filterEmploymentStatus = signal('');
  readonly filterGender = signal('');
  readonly filterEducationLevel = signal('');
  readonly filterIsDelete = signal(false);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly isLoading = signal(false);
  readonly isCardView = signal(true);

  readonly pageIndex = linkedSignal({
    source: () => ({
      search: this.searchText(),
      status: this.filterEmploymentStatus(),
      gender: this.filterGender(),
      educationLevel: this.filterEducationLevel(),
      isDelete: this.filterIsDelete(),
      pageSize: this.pageSize(),
    }),
    computation: () => 1,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly isSelectedAll = computed(() => {
    const list = this.employees();
    const ids = this.selectedIds();
    return list.length > 0 && list.every((item) => ids.has(item.id));
  });

  //#endregion

  constructor() {
    effect(() => {
      this.loadListData();
    });
  }

  //#region //@ HELPERS

  private buildFilter(): PagingRequest {
    const filter: PagingRequest = {
      allowPaging: true,
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    };

    const filterText = this.searchText().trim();
    const filterIsDeleted = this.filterIsDelete();
    const filterEmploymentStatus = this.filterEmploymentStatus().trim();

    filter.filters = [];

    filter.filters.push({
      filterName: BASE_CONSTANTS.isDelete,
      filterValue: filterIsDeleted.toString(),
      filterType: FilterType.boolean,
    });

    if (filterText)
      filter.filters.push({
        filterName: `${EmployeeFields.employeeCode},${EmployeeFields.employeeName}`,
        filterValue: filterText,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });

    if (filterEmploymentStatus)
      filter.filters.push({
        filterName: EmployeeFields.employmentStatus,
        filterValue: filterEmploymentStatus,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });

    const filterGender = this.filterGender().trim();
    if (filterGender)
      filter.filters.push({
        filterName: EmployeeFields.gender,
        filterValue: filterGender,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });

    const filterEducationLevel = this.filterEducationLevel().trim();
    if (filterEducationLevel)
      filter.filters.push({
        filterName: EmployeeFields.educationLevel,
        filterValue: filterEducationLevel,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });

    return filter;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //#endregion

  //#region //@ METHODS

  async loadListData() {
    this.isLoading.set(true);
    const filter = this.buildFilter();

    try {
      //* Chạy song song cả API và timer tối thiểu 300ms
      const [res] = await Promise.all([this.facade.getPaging(filter), this.delay(300)]);

      this.employees.set(res.result?.items || []);
      this.totalRecord.set(res.result?.totalRecord || 0);
      this.recordRange.set(res.result?.recordRange || '');
      this.fromRecord.set(res.result?.fromRecord || 0);
      this.toRecord.set(res.result?.toRecord || 0);
      this.pageCount.set(res.result?.pageCount || 0);
      this.selectedIds.set(new Set());
    } catch {
    } finally {
      this.isLoading.set(false);
    }
  }

  handleViewCard() {
    this.isCardView.set(true);
  }

  handleViewList() {
    this.isCardView.set(false);
  }

  handleClearFilter() {
    this.filterIsDelete.set(false);
    this.searchText.set('');
    this.filterEmploymentStatus.set('');
    this.filterGender.set('');
    this.filterEducationLevel.set('');
    this.pageIndex.set(1);
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
      const list = this.employees();

      if (allSelected) list.forEach((item) => next.delete(item.id));
      else list.forEach((item) => next.add(item.id));

      return next;
    });
  }

  async handleDeleteSelected() {
    const idsArray = Array.from(this.selectedIds());
    if (idsArray.length === 0) return;

    const confirmed = await this.dialogService.confirm({
      title: 'common.confirmDelete',
      message:
        idsArray.length === 1 ? 'common.messageConfirmDelete' : 'common.messageConfirmDeleteMany',
      messageParams: { count: idsArray.length },
      type: 'danger',
      confirmText: 'common.confirm',
      cancelText: 'common.cancel',
    });

    if (!confirmed) return;

    try {
      if (!this.filterIsDelete()) await this.facade.softDelete(idsArray);
      else await this.facade.hardDelete(idsArray);

      await this.loadListData();
    } catch {}
  }

  handleOpenCreate() {
    const modalRef = this.modal.open(EmployeeModal, {
      size: 'lg',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
    //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
    modalRef.componentInstance.saveSuccess.subscribe(() => this.loadListData());
    modalRef.componentInstance.initCreateForm();
  }

  handleOpenUpdate() {
    const item = this.getSelectedItem();
    if (!item) return;

    const modalRef = this.modal.open(EmployeeModal, {
      size: 'lg',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
    //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
    modalRef.componentInstance.saveSuccess.subscribe(() => this.loadListData());
    modalRef.componentInstance.initUpdateForm(item);
  }

  getSelectedItem(): EmployeeModel | null {
    const idsArray = Array.from(this.selectedIds());
    if (idsArray.length !== 1) return null;

    return this.employees().find((item) => item.id === idsArray[0]) ?? null;
  }

  exportFn = (filter: PagingRequest): Promise<Blob> => this.facade.export(filter);

  importFn = (file: File): Promise<any> => this.facade.import(file);

  openImportModal() {
    const modalRef = this.modal.open(Import, {
      size: 'lg',
      centered: true,
      windowClass: 'custom-modal',
      injector: Injector.create({
        parent: this.injector,
        providers: [{ provide: IMPORT_MODAL_CONTEXT, useValue: { importFn: this.importFn } }],
      }),
    });
    //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
    modalRef.componentInstance.importSuccess.subscribe(() => this.loadListData());
  }

  openExportModal() {
    this.modal.open(Export, {
      size: 'lg',
      centered: true,
      windowClass: 'custom-modal',
      injector: Injector.create({
        parent: this.injector,
        providers: [
          {
            provide: EXPORT_MODAL_CONTEXT,
            useValue: {
              exportFn: this.exportFn,
              currentFilter: this.buildFilter(),
              totalRecord: this.totalRecord(),
              fromRecord: this.fromRecord(),
              toRecord: this.toRecord(),
              selectedIds: this.selectedIds(),
              fileName: 'countries',
            },
          },
        ],
      }),
    });
  }

  //#endregion
}
