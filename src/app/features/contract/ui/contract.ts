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
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { EmptyFallbackPipe } from '../../../shared/pipes/empty-fallback.pipe';
import { EmployeeFacade } from '../../employee/data-access/employee.facade';
import { EmployeeModel } from '../../employee/data-access/employee.model';
import {
  APPROVAL_STATUS_CONFIG,
  APPROVAL_STATUS_OPTIONS,
  CONTRACT_STATUS_CONFIG,
  CONTRACT_STATUS_OPTIONS,
  SALARY_UNIT_CONFIG,
  SALARY_UNIT_OPTIONS,
} from '../data-access/contract.enum';
import { ContractFacade } from '../data-access/contract.facade';
import { ContractFields, ContractModel } from '../data-access/contract.model';
import { ContractModal } from './editor-modal/contract-modal';
import { PERMISSIONS } from '../../../core/constants/permission.constant';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-contract',
  imports: [
    Summary,
    Toolbar,
    Pagination,
    Table,
    DatePipe,
    FormsModule,
    Placeholder,
    TranslatePipe,
    CurrencyFormatPipe,
    EmptyFallbackPipe,
  ],
  templateUrl: './contract.html',
  styleUrl: './contract.scss',
})
export class Contract {
  private readonly facade = inject(ContractFacade);
  private readonly employeeFacade = inject(EmployeeFacade);
  private readonly modal = inject(NgbModal);
  private readonly injector = inject(Injector);
  private readonly dialogService = inject(DialogService);
  protected readonly authService = inject(AuthService);
  protected readonly permissions = PERMISSIONS.contract;

  //#region //@ PROPS

  readonly contractStatuses = CONTRACT_STATUS_OPTIONS;
  readonly contractStatusConfig = CONTRACT_STATUS_CONFIG;
  readonly approvalStatuses = APPROVAL_STATUS_OPTIONS;
  readonly approvalStatusConfig = APPROVAL_STATUS_CONFIG;
  readonly salaryUnitConfig = SALARY_UNIT_CONFIG;

  readonly contractColumns = Object.keys(ContractFields).filter(
    (key) =>
      key !== 'id' &&
      key !== 'employeeId' &&
      key !== 'contractTypeId' &&
      key !== 'isDelete' &&
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
  readonly contracts = signal<ContractModel[]>([]);
  readonly employees = signal<EmployeeModel[]>([]);
  readonly searchText = signal('');
  readonly filterContractStatus = signal('');
  readonly filterApprovalStatus = signal('');
  readonly filterIsDelete = signal(false);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly isLoading = signal(false);

  readonly pageIndex = linkedSignal({
    source: () => ({
      search: this.searchText(),
      contractStatus: this.filterContractStatus(),
      approvalStatus: this.filterApprovalStatus(),
      isDelete: this.filterIsDelete(),
      pageSize: this.pageSize(),
    }),
    computation: () => 1,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly isSelectedAll = computed(() => {
    const list = this.contracts();
    const ids = this.selectedIds();
    return list.length > 0 && list.every((item) => ids.has(item.id));
  });

  readonly employeeMap = computed(() => {
    const map = new Map<string, string>();
    for (const emp of this.employees()) {
      map.set(emp.id, emp.employeeName);
    }
    return map;
  });

  //#endregion

  constructor() {
    this.loadComboboxData();
    effect(() => {
      this.loadListData();
    });
  }

  //#region //@ HELPERS

  private async loadComboboxData() {
    try {
      const empRes = await this.employeeFacade.getPaging({ allowPaging: false });
      this.employees.set(empRes.result?.items || []);
    } catch {
      this.employees.set([]);
    }
  }

  private buildFilter(): PagingRequest {
    const filter: PagingRequest = {
      allowPaging: true,
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    };

    const filterText = this.searchText().trim();
    const filterIsDeleted = this.filterIsDelete();
    const filterStatus = this.filterContractStatus().trim();
    const filterApproval = this.filterApprovalStatus().trim();

    filter.filters = [];

    filter.filters.push({
      filterName: BASE_CONSTANTS.isDelete,
      filterValue: filterIsDeleted.toString(),
      filterType: FilterType.boolean,
    });

    if (filterText)
      filter.filters.push({
        filterName: `${ContractFields.contractCode},${ContractFields.contractName}`,
        filterValue: filterText,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });

    if (filterStatus)
      filter.filters.push({
        filterName: ContractFields.contractStatus,
        filterValue: filterStatus,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });

    if (filterApproval)
      filter.filters.push({
        filterName: ContractFields.approvalStatus,
        filterValue: filterApproval,
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

      this.contracts.set(res.result?.items || []);
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

  handleClearFilter() {
    this.filterIsDelete.set(false);
    this.searchText.set('');
    this.filterContractStatus.set('');
    this.filterApprovalStatus.set('');
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
      const list = this.contracts();

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
    const modalRef = this.modal.open(ContractModal, {
      size: 'xl',
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

    const modalRef = this.modal.open(ContractModal, {
      size: 'xl',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
    //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
    modalRef.componentInstance.saveSuccess.subscribe(() => this.loadListData());
    modalRef.componentInstance.initUpdateForm(item);
  }

  getSelectedItem(): ContractModel | null {
    const idsArray = Array.from(this.selectedIds());
    if (idsArray.length !== 1) return null;

    return this.contracts().find((item) => item.id === idsArray[0]) ?? null;
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
              fileName: 'contracts',
            },
          },
        ],
      }),
    });
  }

  //#endregion
}
