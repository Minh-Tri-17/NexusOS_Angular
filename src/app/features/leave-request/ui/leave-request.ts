import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, Injector, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { BASE_CONSTANTS } from '../../../core/constants/base.constant';
import { FilterOperator, FilterType } from '../../../core/constants/filter.enum';
import { PERMISSIONS } from '../../../core/constants/permission.constant';
import { PagingRequest } from '../../../core/models/paging.model';
import { AuthService } from '../../../core/services/auth.service';
import { BaseService } from '../../../core/services/base.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { Export } from '../../../shared/components/export/export';
import { Import } from '../../../shared/components/import/import';
import {
  EXPORT_MODAL_CONTEXT,
  IMPORT_MODAL_CONTEXT,
} from '../../../shared/components/modal/modal-context';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Summary } from '../../../shared/components/summary/summary';
import { Table } from '../../../shared/components/table/table';
import { Toolbar } from '../../../shared/components/toolbar/toolbar';
import { EmptyFallbackPipe } from '../../../shared/pipes/empty-fallback.pipe';
import { LeaveTypeFacade } from '../../categories/leave-type/data-access/leave-type.facade';
import { LeaveTypeModel } from '../../categories/leave-type/data-access/leave-type.model';
import { Gender } from '../../employee/data-access/employee.enum';
import { EmployeeFacade } from '../../employee/data-access/employee.facade';
import { EmployeeModel } from '../../employee/data-access/employee.model';
import {
  LEAVE_APPROVAL_STATUS_CONFIG,
  LEAVE_APPROVAL_STATUS_OPTIONS,
} from '../data-access/leave-request.enum';
import { LeaveRequestFacade } from '../data-access/leave-request.facade';
import { LeaveRequestFields, LeaveRequestModel } from '../data-access/leave-request.model';
import { LeaveRequestModal } from './editor-modal/leave-request-modal';

interface CalendarDay {
  day: number;
  dayName: string;
  isWeekend: boolean;
  isToday: boolean;
}

interface ScheduleCell {
  key: string;
  colspan: number;
  isWeekend: boolean;
  isToday: boolean;
  request?: LeaveRequestModel;
  leaveTypeName?: string;
  pillClass?: string;
  dateRangeLabel?: string;
}

interface ScheduleRow {
  employeeKey: string;
  employeeName: string;
  employeeSub: string;
  avatarUrl: string;
  cells: ScheduleCell[];
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

@Component({
  selector: 'app-leave-request',
  imports: [
    Summary,
    Toolbar,
    Pagination,
    Table,
    DatePipe,
    FormsModule,
    TranslatePipe,
    EmptyFallbackPipe,
  ],
  templateUrl: './leave-request.html',
  styleUrl: './leave-request.scss',
})
export class LeaveRequest {
  private readonly facade = inject(LeaveRequestFacade);
  private readonly employeeFacade = inject(EmployeeFacade);
  private readonly leaveTypeFacade = inject(LeaveTypeFacade);
  private readonly modal = inject(NgbModal);
  private readonly injector = inject(Injector);
  private readonly dialogService = inject(DialogService);
  private readonly baseService = inject(BaseService);
  protected readonly authService = inject(AuthService);
  protected readonly permissions = PERMISSIONS.leaveRequest;

  //#region //@ PROPS

  readonly approvalStatuses = LEAVE_APPROVAL_STATUS_OPTIONS;
  readonly approvalStatusConfig = LEAVE_APPROVAL_STATUS_CONFIG;

  readonly leaveRequestColumns = Object.keys(LeaveRequestFields).filter(
    (key) =>
      key !== 'id' &&
      key !== 'employeeId' &&
      key !== 'employee' &&
      key !== 'leaveTypeId' &&
      key !== 'leaveType' &&
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
  readonly leaveRequests = signal<LeaveRequestModel[]>([]);
  readonly employees = signal<EmployeeModel[]>([]);
  readonly leaveTypes = signal<LeaveTypeModel[]>([]);
  readonly searchText = signal('');
  readonly filterEmployeeId = signal('');
  readonly filterLeaveTypeId = signal('');
  readonly filterApprovalStatus = signal('');
  readonly filterMonthYear = signal(this.getCurrentMonthYear());
  readonly filterIsDelete = signal(false);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly isLoading = signal(false);
  readonly isScheduleView = signal(true);

  readonly pageIndex = linkedSignal({
    source: () => ({
      search: this.searchText(),
      employeeId: this.filterEmployeeId(),
      leaveTypeId: this.filterLeaveTypeId(),
      approvalStatus: this.filterApprovalStatus(),
      isDelete: this.filterIsDelete(),
      isScheduleView: this.isScheduleView(),
      monthYear: this.filterMonthYear(),
      pageSize: this.pageSize(),
    }),
    computation: () => 1,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly isSelectedAll = computed(() => {
    const list = this.leaveRequests();
    const ids = this.selectedIds();
    return list.length > 0 && list.every((item) => ids.has(item.id));
  });

  readonly employeeDetailsMap = computed(() => {
    const map = new Map<string, EmployeeModel>();
    for (const emp of this.employees()) {
      map.set(emp.id, emp);
    }
    return map;
  });

  readonly employeeMap = computed(() => {
    const map = new Map<string, string>();
    for (const emp of this.employees()) {
      map.set(emp.id, emp.employeeName);
    }
    return map;
  });

  readonly leaveTypeMap = computed(() => {
    const map = new Map<string, string>();
    for (const lt of this.leaveTypes()) {
      map.set(lt.id, lt.leaveTypeName);
    }
    return map;
  });

  readonly selectedYearMonth = computed(() => {
    const val = this.filterMonthYear();
    const match = /^(\d{4})-(\d{2})$/.exec(val);
    if (match) {
      return { year: Number(match[1]), month: Number(match[2]) - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  readonly currentMonthLabel = computed(() => {
    const { year, month } = this.selectedYearMonth();
    const d = new Date(year, month, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  });

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const { year, month } = this.selectedYearMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();

    const days: CalendarDay[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dow = date.getDay();
      days.push({
        day,
        dayName: WEEKDAY_NAMES[dow],
        isWeekend: dow === 0 || dow === 6,
        isToday: isCurrentMonth && day === todayDate,
      });
    }
    return days;
  });

  readonly scheduleRows = computed<ScheduleRow[]>(() => {
    const requests = this.leaveRequests();
    const days = this.calendarDays();
    const daysInMonth = days.length;
    const { year, month } = this.selectedYearMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth, 23, 59, 59, 999);
    const empMap = this.employeeDetailsMap();
    const ltMap = this.leaveTypeMap();

    const grouped = new Map<string, LeaveRequestModel[]>();
    for (const req of requests) {
      if (!req.startDate) continue;
      const start = this.toDateOnly(req.startDate);
      const end = req.endDate ? this.toDateOnly(req.endDate) : start;
      if (!start || !end) continue;

      const key = req.employeeId || req.employeeName || req.id;
      const existing = grouped.get(key);
      if (existing) existing.push(req);
      else grouped.set(key, [req]);
    }

    const rows: ScheduleRow[] = [];
    for (const [employeeKey, empRequests] of grouped.entries()) {
      const firstReq = empRequests[0];
      const emp =
        (firstReq.employeeId ? empMap.get(firstReq.employeeId) : undefined) ??
        firstReq.employee ??
        undefined;
      const employeeName =
        firstReq.employeeName || firstReq.employee?.employeeName || emp?.employeeName || '—';
      const employeeSub = emp?.jobTitleName || emp?.employeeCode || '';
      const avatarUrl =
        emp?.gender === Gender.Male ? '/images/avatar-male.jpg' : '/images/avatar-female.jpg';

      const segments = empRequests
        .map((req) => {
          const rawStart = this.toDateOnly(req.startDate)!;
          const rawEnd = req.endDate ? this.toDateOnly(req.endDate)! : rawStart;
          const clampedStart = rawStart < monthStart ? 1 : rawStart.getDate();
          const clampedEnd = rawEnd > monthEnd ? daysInMonth : rawEnd.getDate();
          return {
            req,
            startDay: Math.max(1, Math.min(daysInMonth, clampedStart)),
            endDay: Math.max(1, Math.min(daysInMonth, Math.max(clampedStart, clampedEnd))),
            rawStart,
            rawEnd,
          };
        })
        .sort((a, b) => a.startDay - b.startDay);

      const cells: ScheduleCell[] = [];
      let day = 1;
      let segIdx = 0;

      while (day <= daysInMonth) {
        while (segIdx < segments.length && segments[segIdx].endDay < day) {
          segIdx++;
        }

        const seg = segments[segIdx];
        if (seg && seg.startDay <= day && seg.endDay >= day) {
          const span = seg.endDay - day + 1;
          const leaveTypeName =
            seg.req.leaveTypeName ||
            seg.req.leaveType?.leaveTypeName ||
            (seg.req.leaveTypeId ? ltMap.get(seg.req.leaveTypeId) : undefined) ||
            seg.req.leaveRequestCode ||
            '—';
          cells.push({
            key: `pill-${seg.req.id}-${day}`,
            colspan: span,
            isWeekend: false,
            isToday: false,
            request: seg.req,
            leaveTypeName,
            pillClass: this.getPillThemeClass(leaveTypeName),
            dateRangeLabel: this.formatDateRange(seg.rawStart, seg.rawEnd),
          });
          day += span;
          segIdx++;
        } else {
          const dayInfo = days[day - 1];
          cells.push({
            key: `empty-${employeeKey}-${day}`,
            colspan: 1,
            isWeekend: dayInfo.isWeekend,
            isToday: dayInfo.isToday,
          });
          day++;
        }
      }

      rows.push({
        employeeKey,
        employeeName,
        employeeSub,
        avatarUrl,
        cells,
      });
    }

    return rows;
  });

  //#endregion

  constructor() {
    this.loadComboboxData();
    effect(() => {
      this.loadListData();
    });
  }

  //#region //@ HELPERS

  private getCurrentMonthYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private toDateOnly(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private formatDateRange(start: Date, end: Date): string {
    const startLabel = `${MONTH_SHORT_NAMES[start.getMonth()]} ${start.getDate()}`;
    if (start.getTime() === end.getTime()) return startLabel;
    const endLabel = `${MONTH_SHORT_NAMES[end.getMonth()]} ${end.getDate()}`;
    return `${startLabel} – ${endLabel}`;
  }

  private getPillThemeClass(leaveTypeName: string): string {
    const normalized = leaveTypeName.toLowerCase();
    if (normalized.includes('annual') || normalized.includes('phép năm')) {
      return 'leave-pill-annual';
    }
    if (normalized.includes('sick') || normalized.includes('ốm') || normalized.includes('bệnh')) {
      return 'leave-pill-sick';
    }
    if (normalized.includes('maternity') || normalized.includes('thai sản')) {
      return 'leave-pill-maternity';
    }
    if (normalized.includes('personal') || normalized.includes('việc riêng')) {
      return 'leave-pill-personal';
    }
    if (
      normalized.includes('remote') ||
      normalized.includes('từ xa') ||
      normalized.includes('wfh')
    ) {
      return 'leave-pill-remote';
    }

    return 'leave-pill-other';
  }

  private async loadComboboxData() {
    const [empResult, leaveTypeResult] = await Promise.allSettled([
      this.employeeFacade.getPaging({ allowPaging: false }),
      this.leaveTypeFacade.getPaging({ allowPaging: false }),
    ]);

    if (empResult.status === BASE_CONSTANTS.promiseFulfilled) {
      this.employees.set(empResult.value.result?.items || []);
    } else {
      this.employees.set([]);
    }

    if (leaveTypeResult.status === BASE_CONSTANTS.promiseFulfilled) {
      this.leaveTypes.set(leaveTypeResult.value.result?.items || []);
    } else {
      this.leaveTypes.set([]);
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
    const filterEmployee = this.filterEmployeeId();
    const filterLeaveType = this.filterLeaveTypeId();
    const filterApproval = this.filterApprovalStatus().trim();

    filter.filters = [];

    filter.filters.push({
      filterName: BASE_CONSTANTS.isDelete,
      filterValue: filterIsDeleted.toString(),
      filterType: FilterType.boolean,
    });

    if (filterText)
      filter.filters.push({
        filterName: `${LeaveRequestFields.leaveRequestCode},${LeaveRequestFields.reason}`,
        filterValue: filterText,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });

    if (filterEmployee)
      filter.filters.push({
        filterName: LeaveRequestFields.employeeId,
        filterValue: filterEmployee,
        filterType: FilterType.guid,
        filterOperator: FilterOperator.contains,
      });

    if (filterLeaveType)
      filter.filters.push({
        filterName: LeaveRequestFields.leaveTypeId,
        filterValue: filterLeaveType,
        filterType: FilterType.guid,
        filterOperator: FilterOperator.contains,
      });

    if (filterApproval)
      filter.filters.push({
        filterName: LeaveRequestFields.approvalStatus,
        filterValue: filterApproval,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });

    if (this.filterMonthYear()) {
      const { year, month } = this.selectedYearMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthStr = String(month + 1).padStart(2, '0');
      const firstDay = `${year}-${monthStr}-01`;
      const lastDay = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

      filter.filters.push({
        filterName: LeaveRequestFields.startDate,
        filterValue: `${firstDay},${lastDay}`,
        filterType: FilterType.date,
        filterOperator: FilterOperator.between,
      });
    }

    return filter;
  }

  //#endregion

  //#region //@ METHODS

  async loadListData() {
    this.isLoading.set(true);
    const filter = this.buildFilter();

    try {
      //* Chạy song song cả API và timer tối thiểu 300ms
      const [res] = await Promise.all([this.facade.getPaging(filter), this.baseService.delay(300)]);

      this.leaveRequests.set(res.result?.items || []);
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

  handleViewSchedule() {
    this.isScheduleView.set(true);
    if (!this.filterMonthYear()) this.filterMonthYear.set(this.getCurrentMonthYear());
  }

  handleViewList() {
    this.isScheduleView.set(false);
    this.filterMonthYear.set('');
  }

  handleChangeMonth(delta: number) {
    const { year, month } = this.selectedYearMonth();
    const next = new Date(year, month + delta, 1);
    const nextYear = next.getFullYear();
    const nextMonth = String(next.getMonth() + 1).padStart(2, '0');
    this.filterMonthYear.set(`${nextYear}-${nextMonth}`);
  }

  handleGoToToday() {
    this.filterMonthYear.set(this.getCurrentMonthYear());
  }

  handleMonthYearChange(value: string) {
    this.filterMonthYear.set(value || (this.isScheduleView() ? this.getCurrentMonthYear() : ''));
  }

  handleClearFilter() {
    this.filterIsDelete.set(false);
    this.searchText.set('');
    this.filterEmployeeId.set('');
    this.filterLeaveTypeId.set('');
    this.filterApprovalStatus.set('');
    this.filterMonthYear.set(this.isScheduleView() ? this.getCurrentMonthYear() : '');
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

  handleSelectSchedulePill(request: LeaveRequestModel) {
    this.handleToggleSelect(request.id);
  }

  handleEditSchedulePill(request: LeaveRequestModel) {
    if (!this.authService.hasPermission(this.permissions.update)) return;
    this.selectedIds.set(new Set([request.id]));
    this.handleOpenUpdate();
  }

  handleToggleSelectAll() {
    const allSelected = this.isSelectedAll();

    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      const list = this.leaveRequests();

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
    const modalRef = this.modal.open(LeaveRequestModal, {
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

    const modalRef = this.modal.open(LeaveRequestModal, {
      size: 'lg',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
    //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
    modalRef.componentInstance.saveSuccess.subscribe(() => this.loadListData());
    modalRef.componentInstance.initUpdateForm(item);
  }

  getSelectedItem(): LeaveRequestModel | null {
    const idsArray = Array.from(this.selectedIds());
    if (idsArray.length !== 1) return null;

    return this.leaveRequests().find((item) => item.id === idsArray[0]) ?? null;
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
              fileName: 'leave-requests',
            },
          },
        ],
      }),
    });
  }

  //#endregion
}
