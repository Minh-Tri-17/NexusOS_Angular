import { Component, computed, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { PagingRequest } from '../../../../../core/models/paging.model';
import { BaseService } from '../../../../../core/services/base.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { SelectLoadingDirective } from '../../../../../shared/directives/select-loading.directive';
import { AutoTrimDirective } from '../../../../../shared/directives/auto-trim.directive';
import { UppercaseDirective } from '../../../../../shared/directives/uppercase.directive';
import { NumberOnlyDirective } from '../../../../../shared/directives/number-only.directive';
import { EmployeeFacade } from '../../../../employee/data-access/employee.facade';
import { EmployeeModel } from '../../../../employee/data-access/employee.model';
import { RoleFacade } from '../../../roles/data-access/role.facade';
import { RoleModel } from '../../../roles/data-access/role.model';
import {
  USER_STATUS_OPTIONS,
  USER_TYPE_OPTIONS,
  UserStatus,
  UserType,
} from '../../data-access/user.enum';
import { UserFacade } from '../../data-access/user.facade';
import { UserModel } from '../../data-access/user.model';

@Component({
  selector: 'app-user-modal',
  imports: [
    Modal,
    ReactiveFormsModule,
    TranslatePipe,
    SelectLoadingDirective,
    AutoTrimDirective,
    UppercaseDirective,
    NumberOnlyDirective,
  ],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.scss',
})
export class UserModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(UserFacade);
  private readonly employeeFacade = inject(EmployeeFacade);
  private readonly roleFacade = inject(RoleFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();
  readonly userStatuses = USER_STATUS_OPTIONS;
  readonly userTypes = USER_TYPE_OPTIONS;

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly isLoadingEmployee = signal(false);
  readonly showPassword = signal(false);
  readonly employees = signal<EmployeeModel[]>([]);
  readonly roles = signal<RoleModel[]>([]);

  readonly userForm = new FormGroup({
    id: new FormControl<string | null>(null),
    employeeId: new FormControl<string>('', { nonNullable: true }),
    userCode: new FormControl<string | null>(null),
    username: new FormControl<string | null>(null, Validators.required),
    password: new FormControl<string | null>(null),
    roleIds: new FormControl<string[]>([], { nonNullable: true }),
    email: new FormControl<string | null>(null, Validators.email),
    phoneNumber: new FormControl<string | null>(null),
    userStatus: new FormControl<string>(UserStatus.Active, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    userType: new FormControl<string>(UserType.Employee, {
      nonNullable: true,
      validators: [Validators.required],
    }),
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
  readonly isEditMode = computed(() => !!this.currentId());

  //#endregion

  //#region //@ HELPERS

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

  private async loadRoles() {
    if (this.roles().length > 0) return;

    try {
      const filter: PagingRequest = { allowPaging: false };
      const res = await this.roleFacade.getPaging(filter);
      this.roles.set(res.result?.items || []);
    } catch {
      this.roles.set([]);
    }
  }

  async loadComboboxData() {
    await Promise.allSettled([this.loadEmployees(), this.loadRoles()]);
  }

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.userForm.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.controls.password.updateValueAndValidity();

    this.userForm.reset({
      id: null,
      employeeId: '',
      userCode: null,
      username: null,
      password: null,
      roleIds: [],
      email: null,
      phoneNumber: null,
      userStatus: UserStatus.Active,
      userType: UserType.Employee,
      requirePasswordChange: false,
      twoFactorEnabled: false,
      note: null,
    });
    this.showPassword.set(false);
    this.loadComboboxData();
  }

  initUpdateForm(item: UserModel) {
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();

    this.userForm.patchValue({
      id: item.id,
      employeeId: item.employeeId || '',
      userCode: item.userCode,
      username: item.username,
      password: null,
      roleIds: item.roleIds || [],
      email: item.email,
      phoneNumber: item.phoneNumber,
      userStatus: item.userStatus || '',
      userType: item.userType || '',
      requirePasswordChange: item.requirePasswordChange || false,
      twoFactorEnabled: item.twoFactorEnabled || false,
      note: item.note,
    });
    this.showPassword.set(false);
    this.loadComboboxData();
  }

  toggleShowPassword() {
    this.showPassword.update((val) => !val);
  }

  toggleRole(roleId: string) {
    const current = this.userForm.controls.roleIds.value || [];
    const index = current.indexOf(roleId);
    let updated: string[];

    if (index >= 0) {
      updated = current.filter((id) => id !== roleId);
    } else {
      updated = [...current, roleId];
    }

    this.userForm.controls.roleIds.setValue(updated);
    //* Chỉ đánh dấu control hiện tại, không làm bẩn form cha
    this.userForm.controls.roleIds.markAsDirty();
  }

  isRoleSelected(roleId: string): boolean {
    return (this.userForm.controls.roleIds.value || []).includes(roleId);
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
    if (!payload.employeeId) payload.employeeId = null;

    if (payload.id && !payload.password?.trim()) payload.password = null;

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
