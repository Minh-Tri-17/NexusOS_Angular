import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseService } from '../../../../core/services/base.service';
import { Modal } from '../../../../shared/components/modal/modal';
import { EmployeeStatus } from '../../data-access/employee.enum';
import { EmployeeFacade } from '../../data-access/employee.facade';
import { EmployeeModel } from '../../data-access/employee.model';

@Component({
  selector: 'app-country-modal',
  imports: [Modal, ReactiveFormsModule, TranslatePipe],
  templateUrl: './employee-modal.html',
  styleUrl: './employee-modal.scss',
})
export class EmployeeModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(EmployeeFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly employeeStatus = Object.values(EmployeeStatus);

  readonly employeeForm = new FormGroup({
    id: new FormControl('', { nonNullable: true }),
    employeeCode: new FormControl('', { nonNullable: true }),
    employeeName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    employeeStatus: new FormControl<EmployeeStatus | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    note: new FormControl('', { nonNullable: true }),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.employeeForm.controls.id.valueChanges, {
    initialValue: this.employeeForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.employeeForm.reset();
  }

  initUpdateForm(item: EmployeeModel) {
    this.employeeForm.patchValue({
      ...item,
      employeeStatus: (item.employmentStatus as EmployeeStatus) ?? '',
    });
  }

  async handleSave() {
    // if (this.employeeForm.invalid) return;
    // this.isSaving.set(true);
    // //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    // const rawValues: EmployeeModel = this.employeeForm.getRawValue();
    // try {
    //   if (rawValues.id) {
    //     await this.facade.update(rawValues);
    //   } else {
    //     rawValues.id = NIL_GUID;
    //     await this.facade.create(rawValues);
    //   }
    //   this.saveSuccess.emit();
    //   this.initCreateForm();
    //   this.baseService.closeModal();
    // } catch {
    // } finally {
    //   this.isSaving.set(false);
    // }
  }

  //#endregion
}
