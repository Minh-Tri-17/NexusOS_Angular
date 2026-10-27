import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, Injector, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { BASE_CONSTANTS } from '../../../../core/constants/base.constant';
import { FilterOperator, FilterType } from '../../../../core/constants/filter.enum';
import { PagingRequest } from '../../../../core/models/paging.model';
import { DialogService } from '../../../../shared/components/dialog/dialog.service';
import { Export } from '../../../../shared/components/export/export';
import { Import } from '../../../../shared/components/import/import';
import {
  EXPORT_MODAL_CONTEXT,
  IMPORT_MODAL_CONTEXT,
} from '../../../../shared/components/modal/modal-context';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { Placeholder } from '../../../../shared/components/placeholder/placeholder';
import { Summary } from '../../../../shared/components/summary/summary';
import { Table } from '../../../../shared/components/table/table';
import { Toolbar } from '../../../../shared/components/toolbar/toolbar';
import { UserFacade } from '../data-access/user.facade';
import { UserFields, UserModel } from '../data-access/user.model';
import { UserModal } from './editor-modal/user-modal';

@Component({
  selector: 'app-user',
  imports: [Summary, Toolbar, Pagination, Table, DatePipe, FormsModule, Placeholder, TranslatePipe],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User {
  private readonly facade = inject(UserFacade);
  private readonly modal = inject(NgbModal);
  private readonly injector = inject(Injector);
  private readonly dialogService = inject(DialogService);

  //#region //@ PROPS

  readonly userColumns = ['userCode', 'username', 'email', 'phoneNumber', 'userStatus', 'userType'];

  //#endregion

  //#region //@ STATE

  readonly pageSize = signal(20);
  readonly fromRecord = signal(1);
  readonly recordRange = signal('');
  readonly totalRecord = signal(0);
  readonly pageCount = signal(0);
  readonly users = signal<UserModel[]>([]);
  readonly searchText = signal('');
  readonly filterIsDelete = signal(false);
  readonly filterUserStatus = signal<string | null>(null);
  readonly filterUserType = signal<string | null>(null);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly isLoading = signal(false);

  readonly pageIndex = linkedSignal({
    source: () => ({
      search: this.searchText(),
      isDelete: this.filterIsDelete(),
      pageSize: this.pageSize(),
      status: this.filterUserStatus(),
      type: this.filterUserType(),
    }),
    computation: () => 1,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly isSelectedAll = computed(() => {
    const list = this.users();
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
      filters: [],
    };
    filter.filters!.push({
      filterName: BASE_CONSTANTS.isDelete,
      filterValue: this.filterIsDelete().toString(),
      filterType: FilterType.boolean,
    });
    const text = this.searchText().trim();
    if (text)
      filter.filters!.push({
        filterName: `${UserFields.userCode},${UserFields.username},${UserFields.email}`,
        filterValue: text,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });
    if (this.filterUserStatus())
      filter.filters!.push({
        filterName: UserFields.userStatus,
        filterValue: this.filterUserStatus(),
        filterType: FilterType.string,
        filterOperator: FilterOperator.equal,
      });
    if (this.filterUserType())
      filter.filters!.push({
        filterName: UserFields.userType,
        filterValue: this.filterUserType(),
        filterType: FilterType.string,
        filterOperator: FilterOperator.equal,
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

      this.users.set(res.result?.items || []);
      this.totalRecord.set(res.result?.totalRecord || 0);
      this.recordRange.set(res.result?.recordRange || '');
      this.fromRecord.set(res.result?.fromRecord || 0);
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
    this.filterUserStatus.set(null);
    this.filterUserType.set(null);
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
      this.users().forEach((item) => {
        allSelected ? next.delete(item.id) : next.add(item.id);
      });
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
    const modalRef = this.modal.open(UserModal, {
      size: 'lg',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
    modalRef.componentInstance.saveSuccess.subscribe(() => this.loadListData());
    modalRef.componentInstance.initCreateForm();
  }

  handleOpenUpdate() {
    const item = this.getSelectedItem();
    if (!item) return;

    const modalRef = this.modal.open(UserModal, {
      size: 'lg',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
    modalRef.componentInstance.saveSuccess.subscribe(() => this.loadListData());
    modalRef.componentInstance.initUpdateForm(item);
  }

  getSelectedItem(): UserModel | null {
    const idsArray = Array.from(this.selectedIds());
    if (idsArray.length !== 1) return null;

    return this.users().find((item) => item.id === idsArray[0]) ?? null;
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
              toRecord: 0,
              selectedIds: this.selectedIds(),
              fileName: 'users',
            },
          },
        ],
      }),
    });
  }

  //#endregion
}
