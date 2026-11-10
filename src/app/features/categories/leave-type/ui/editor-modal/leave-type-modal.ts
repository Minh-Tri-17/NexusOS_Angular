import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { BaseService } from '../../../../../core/services/base.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { AutoTrimDirective } from '../../../../../shared/directives/auto-trim.directive';
import { UppercaseDirective } from '../../../../../shared/directives/uppercase.directive';
import { LeaveTypeFacade } from '../../data-access/leave-type.facade';
import { LeaveTypeModel } from '../../data-access/leave-type.model';

@Component({
  selector: 'app-leave-type-modal',
  imports: [
    Modal,
    ReactiveFormsModule,
    TranslatePipe,
    AutoTrimDirective,
    UppercaseDirective,
  ],
  templateUrl: './leave-type-modal.html',
  styleUrl: './leave-type-modal.scss',
})
export class LeaveTypeModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(LeaveTypeFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);

  readonly leaveTypeForm = new FormGroup({
    id: new FormControl<string | null>(null),
    leaveTypeCode: new FormControl<string | null>(null),
    leaveTypeName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.leaveTypeForm.controls.id.valueChanges, {
    initialValue: this.leaveTypeForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.leaveTypeForm.reset({
      id: null,
      leaveTypeCode: null,
      leaveTypeName: null,
      note: null,
    });
  }

  initUpdateForm(item: LeaveTypeModel) {
    this.leaveTypeForm.patchValue({
      id: item.id || null,
      leaveTypeCode: item.leaveTypeCode || null,
      leaveTypeName: item.leaveTypeName || null,
      note: item.note || null,
    });
  }

  async handleSave() {
    if (this.leaveTypeForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.leaveTypeForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const payload = this.leaveTypeForm.getRawValue() as unknown as LeaveTypeModel;

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

