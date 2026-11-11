import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { PagingRequest } from '../../../../../core/models/paging.model';
import { BaseService } from '../../../../../core/services/base.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { AutoTrimDirective } from '../../../../../shared/directives/auto-trim.directive';
import { SelectLoadingDirective } from '../../../../../shared/directives/select-loading.directive';
import { UppercaseDirective } from '../../../../../shared/directives/uppercase.directive';
import { EmployeeFacade } from '../../../../employee/data-access/employee.facade';
import { EmployeeModel } from '../../../../employee/data-access/employee.model';
import { DepartmentFacade } from '../../data-access/department.facade';
import { DepartmentModel } from '../../data-access/department.model';

@Component({
  selector: 'app-department-modal',
  imports: [
    Modal,
    ReactiveFormsModule,
    TranslatePipe,
    SelectLoadingDirective,
    AutoTrimDirective,
    UppercaseDirective,
  ],
  templateUrl: './department-modal.html',
  styleUrl: './department-modal.scss',
})
export class DepartmentModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(DepartmentFacade);
  private readonly employeeFacade = inject(EmployeeFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly isLoadingManager = signal(false);
  readonly employees = signal<EmployeeModel[]>([]);

  readonly departmentForm = new FormGroup({
    id: new FormControl<string | null>(null),
    departmentCode: new FormControl<string | null>(null),
    departmentName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    managerId: new FormControl<string>('', { nonNullable: true }),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.departmentForm.controls.id.valueChanges, {
    initialValue: this.departmentForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ HELPERS

  async loadComboboxData() {
    await Promise.allSettled([this.loadEmployees()]);
  }

  private async loadEmployees() {
    if (this.employees().length > 0) return;

    this.isLoadingManager.set(true);
    try {
      const filter: PagingRequest = {
        allowPaging: false,
      };
      const res = await this.employeeFacade.getPaging(filter);
      this.employees.set(res.result?.items || []);
    } catch {
      this.employees.set([]);
    } finally {
      this.isLoadingManager.set(false);
    }
  }

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.departmentForm.reset({
      id: null,
      departmentCode: null,
      departmentName: null,
      managerId: '',
      note: null,
    });
    this.loadComboboxData();
  }

  initUpdateForm(item: DepartmentModel) {
    this.departmentForm.patchValue({
      id: item.id || null,
      departmentCode: item.departmentCode || null,
      departmentName: item.departmentName || null,
      managerId: item.managerId || '',
      note: item.note || null,
    });
    this.loadComboboxData();
  }

  async handleSave() {
    if (this.departmentForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const payload = this.departmentForm.getRawValue() as unknown as DepartmentModel;
    if (!payload.managerId) {
      payload.managerId = null;
    }

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

