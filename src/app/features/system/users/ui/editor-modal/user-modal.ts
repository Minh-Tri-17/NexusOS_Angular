import { Component, computed, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { BaseService } from '../../../../../core/services/base.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { UserFacade } from '../../data-access/user.facade';
import { UserModel } from '../../data-access/user.model';

@Component({
  selector: 'app-user-modal',
  imports: [Modal, ReactiveFormsModule, TranslatePipe],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.scss',
})
export class UserModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(UserFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly userForm = new FormGroup({
    id: new FormControl<string | null>(null),
    userCode: new FormControl<string | null>(null),
    username: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>(null, Validators.email),
    phoneNumber: new FormControl<string | null>(null),
    userStatus: new FormControl<string | null>('Active', Validators.required),
    userType: new FormControl<string | null>('Employee', Validators.required),
    requirePasswordChange: new FormControl<boolean | null>(false),
    twoFactorEnabled: new FormControl<boolean | null>(false),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.userForm.controls.id.valueChanges, {
    initialValue: this.userForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.userForm.reset({
      id: null,
      userCode: null,
      username: null,
      email: null,
      phoneNumber: null,
      userStatus: 'Active',
      userType: 'Employee',
      requirePasswordChange: false,
      twoFactorEnabled: false,
      note: null,
    });
  }

  initUpdateForm(item: UserModel) {
    this.userForm.patchValue({
      id: item.id,
      userCode: item.userCode,
      username: item.username,
      email: item.email,
      phoneNumber: item.phoneNumber,
      userStatus: item.userStatus || 'Active',
      userType: item.userType || 'Employee',
      requirePasswordChange: item.requirePasswordChange || false,
      twoFactorEnabled: item.twoFactorEnabled || false,
      note: item.note,
    });
  }

  async handleSave() {
    if (this.userForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const payload = this.userForm.getRawValue() as unknown as UserModel;

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
