import { Component, computed, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { PagingRequest } from '../../../../core/models/paging.model';
import { BaseService } from '../../../../core/services/base.service';
import { Modal } from '../../../../shared/components/modal/modal';
import { AutoTrimDirective } from '../../../../shared/directives/auto-trim.directive';
import { NumberOnlyDirective } from '../../../../shared/directives/number-only.directive';
import { SelectLoadingDirective } from '../../../../shared/directives/select-loading.directive';
import { UppercaseDirective } from '../../../../shared/directives/uppercase.directive';
import { LeaveTypeFacade } from '../../../categories/leave-type/data-access/leave-type.facade';
import { LeaveTypeModel } from '../../../categories/leave-type/data-access/leave-type.model';
import { EmployeeFacade } from '../../../employee/data-access/employee.facade';
import { EmployeeModel } from '../../../employee/data-access/employee.model';
import {
  LEAVE_APPROVAL_STATUS_OPTIONS,
  LeaveApprovalStatus,
} from '../../data-access/leave-request.enum';
import { LeaveRequestFacade } from '../../data-access/leave-request.facade';
import { LeaveRequestModel } from '../../data-access/leave-request.model';

@Component({
  selector: 'app-leave-request-modal',
  imports: [
    Modal,
    ReactiveFormsModule,
    TranslatePipe,
    SelectLoadingDirective,
    AutoTrimDirective,
    UppercaseDirective,
    NumberOnlyDirective,
  ],
  templateUrl: './leave-request-modal.html',
  styleUrl: './leave-request-modal.scss',
})
export class LeaveRequestModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(LeaveRequestFacade);
  private readonly employeeFacade = inject(EmployeeFacade);
  private readonly leaveTypeFacade = inject(LeaveTypeFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileAttachInput');

  readonly approvalStatuses = LEAVE_APPROVAL_STATUS_OPTIONS;

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly isLoadingEmployee = signal(false);
  readonly isLoadingLeaveType = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly employees = signal<EmployeeModel[]>([]);
  readonly leaveTypes = signal<LeaveTypeModel[]>([]);

  readonly leaveRequestForm = new FormGroup({
    id: new FormControl<string | null>(null),
    leaveRequestCode: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(50)],
    }),
    employeeId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    leaveTypeId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    endDate: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    totalDays: new FormControl<number | string | null>(null, {
      validators: [Validators.min(0), Validators.max(999.99)],
    }),
    reason: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(500)],
    }),
    fileAttach: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(500)],
    }),
    approvalStatus: new FormControl<LeaveApprovalStatus | string>(LeaveApprovalStatus.Pending, {
      validators: [Validators.maxLength(50)],
    }),
    note: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(500)],
    }),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.leaveRequestForm.controls.id.valueChanges, {
    initialValue: this.leaveRequestForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ HELPERS

  onDateRangeChange() {
    const start = this.leaveRequestForm.controls.startDate.value;
    const end = this.leaveRequestForm.controls.endDate.value;
    if (!start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs >= 0) {
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      this.leaveRequestForm.controls.totalDays.setValue(diffDays);
    }
  }

  async loadComboboxData() {
    await Promise.allSettled([this.loadEmployees(), this.loadLeaveTypes()]);
  }

  private async loadEmployees() {
    if (this.employees().length > 0) return;

    this.isLoadingEmployee.set(true);
    try {
      const filter: PagingRequest = { allowPaging: false };
      const res = await this.employeeFacade.getPaging(filter);
      this.employees.set(res.result?.items || []);
    } catch {
      this.employees.set([]);
    } finally {
      this.isLoadingEmployee.set(false);
    }
  }

  private async loadLeaveTypes() {
    if (this.leaveTypes().length > 0) return;

    this.isLoadingLeaveType.set(true);
    try {
      const filter: PagingRequest = { allowPaging: false };
      const res = await this.leaveTypeFacade.getPaging(filter);
      this.leaveTypes.set(res.result?.items || []);
    } catch {
      this.leaveTypes.set([]);
    } finally {
      this.isLoadingLeaveType.set(false);
    }
  }

  //#endregion

  //#region //@ METHODS

  handleFileSelect(event: Event) {
    const file = this.baseService.getSelectedFile(event);
    if (!file) return;

    this.selectedFile.set(file);
    this.leaveRequestForm.controls.fileAttach.setValue(file.name);
  }

  handleRemoveFile() {
    this.selectedFile.set(null);
    this.baseService.clearFileField(this.leaveRequestForm.controls.fileAttach, this.fileInput());
  }

  initCreateForm() {
    this.selectedFile.set(null);
    this.baseService.resetFileInput(this.fileInput());
    this.leaveRequestForm.reset({
      id: null,
      leaveRequestCode: null,
      employeeId: '',
      leaveTypeId: '',
      startDate: null,
      endDate: null,
      totalDays: null,
      reason: null,
      fileAttach: null,
      approvalStatus: LeaveApprovalStatus.Pending,
      note: null,
    });
    this.loadComboboxData();
  }

  initUpdateForm(item: LeaveRequestModel) {
    this.selectedFile.set(null);
    this.baseService.resetFileInput(this.fileInput());
    this.leaveRequestForm.patchValue({
      id: item.id || null,
      leaveRequestCode: item.leaveRequestCode || null,
      employeeId: item.employeeId || '',
      leaveTypeId: item.leaveTypeId || '',
      startDate: this.baseService.formatDateForInput(item.startDate),
      endDate: this.baseService.formatDateForInput(item.endDate),
      totalDays: item.totalDays ?? null,
      reason: item.reason || null,
      fileAttach: item.fileAttach || null,
      approvalStatus: (item.approvalStatus as LeaveApprovalStatus) || LeaveApprovalStatus.Pending,
      note: item.note || null,
    });
    this.loadComboboxData();
  }

  async handleSave() {
    if (this.leaveRequestForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.leaveRequestForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const formValue = this.leaveRequestForm.getRawValue();
    const payload: LeaveRequestModel = {
      ...(formValue as unknown as LeaveRequestModel),
      totalDays:
        formValue.totalDays !== null && formValue.totalDays !== ''
          ? Number(formValue.totalDays)
          : null,
      employeeId: formValue.employeeId || null,
      leaveTypeId: formValue.leaveTypeId || null,
    };

    try {
      if (payload.id) {
        await this.facade.update(payload);
      } else {
        payload.id = NIL_GUID;
        await this.facade.create(payload);
      }
      this.saveSuccess.emit();
      this.initCreateForm();
      this.baseService.closeModal();
    } catch {
    } finally {
      this.isSaving.set(false);
    }
  }

  //#endregion
}
