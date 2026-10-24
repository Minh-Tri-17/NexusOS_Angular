import { Component, computed, inject, output, signal } from '@angular/core';
import { Modal } from '../../../../../shared/components/modal/modal';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { BaseService } from '../../../../../core/services/base.service';
import { RoleFacade } from '../../data-access/role.facade';
import { toSignal } from '@angular/core/rxjs-interop';
import { RoleModel } from '../../data-access/role.model';

@Component({
  selector: 'app-role-modal',
  imports: [Modal, ReactiveFormsModule, TranslatePipe],
  templateUrl: './role-modal.html',
  styleUrl: './role-modal.scss',
})
export class RoleModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(RoleFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);

  readonly roleForm = new FormGroup({
    id: new FormControl<string | null>(null),
    roleCode: new FormControl<string | null>(null),
    roleName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    isSystemRole: new FormControl<boolean | null>(null),
    isActive: new FormControl<boolean | null>(null),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.roleForm.controls.id.valueChanges, {
    initialValue: this.roleForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.roleForm.reset({
      id: null,
      roleCode: null,
      roleName: null,
      isSystemRole: null,
      isActive: null,
      note: null,
    });
  }

  initUpdateForm(item: RoleModel) {
    this.roleForm.patchValue({
      id: item.id || null,
      roleCode: item.roleCode || null,
      roleName: item.roleName || null,
      isSystemRole: item.isSystemRole || null,
      isActive: item.isActive || null,
      note: item.note || null,
    });
  }

  async handleSave() {
    if (this.roleForm.invalid) return;
    this.isSaving.set(true);

    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const rawValues = this.roleForm.getRawValue();

    const payload: RoleModel = {
      ...(rawValues as unknown as RoleModel),
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
