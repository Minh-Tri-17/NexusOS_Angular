import { Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { BaseService } from '../../../../../core/services/base.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { Table } from '../../../../../shared/components/table/table';
import { PermissionModel } from '../../data-access/permission.model';
import { RoleFacade } from '../../data-access/role.facade';
import { RoleModel } from '../../data-access/role.model';

export interface PermissionMatrixScopeRow {
  scope: string;
  displayName: string;
  description?: string;
  actions: Record<string, string | null>; //* actionName -> permissionCode (vd: "CatCountry.View")
}

const SCOPE_DISPLAY_INFO: Record<string, { name: string; icon: string }> = {
  CatCountry: { name: 'common.country', icon: 'fa-solid fa-earth-americas' },
  CatProvince: { name: 'common.province', icon: 'fa-solid fa-map-location-dot' },
  CatWard: { name: 'common.ward', icon: 'fa-solid fa-tree-city' },
  Employee: { name: 'common.employee', icon: 'fa-solid fa-users-gear' },
  User: { name: 'common.user', icon: 'fa-solid fa-user-shield' },
  Role: { name: 'common.role', icon: 'fa-solid fa-shield-halved' },
};

@Component({
  selector: 'app-role-modal',
  imports: [Modal, Table, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './role-modal.html',
  styleUrl: './role-modal.scss',
})
export class RoleModal implements OnInit {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(RoleFacade);
  private readonly translate = inject(TranslateService);

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

  readonly isLoadingPermissions = signal(false);
  readonly filterKeyword = signal('');

  //* Danh sách raw string permission codes từ API (ví dụ: ["CatCountry.View", ...])
  readonly rawPermissions = signal<string[]>([]);

  //* Trạng thái quyền: key là permissionCode (vd "CatCountry.View") -> true / false
  readonly permissionStates = signal<Record<string, boolean>>({});

  //* Danh sách actions được trích xuất động từ toàn bộ rawPermissions trả về từ API
  readonly availableActions = computed<string[]>(() => {
    const list = this.rawPermissions();
    const actionSet = new Set<string>();

    for (const code of list) {
      const parts = code.split('.');
      if (parts.length >= 2) actionSet.add(parts[1]);
    }

    //* Thứ tự ưu tiên hiển thị các action cơ bản quen thuộc nếu có trong danh sách
    const standardOrder = ['View', 'Create', 'Update', 'Delete', 'Import', 'Export'];
    const result: string[] = [];

    for (const act of standardOrder) {
      if (actionSet.has(act)) {
        result.push(act);
        actionSet.delete(act);
      }
    }

    //* Các action nghiệp vụ đặc thù khác (Tính toán, Duyệt phiếu, Từ chối, Hủy...)
    for (const act of actionSet) {
      result.push(act);
    }

    return result;
  });

  //* Gom nhóm permissions theo scope để hiển thị ma trận
  readonly matrixRows = computed<PermissionMatrixScopeRow[]>(() => {
    const list = this.rawPermissions();
    const actions = this.availableActions();
    const map = new Map<string, PermissionMatrixScopeRow>();

    for (const code of list) {
      const [scope, action] = code.split('.');
      if (!scope || !action) continue;

      if (!map.has(scope)) {
        const initialActions: Record<string, string | null> = {};
        for (const act of actions) {
          initialActions[act] = null;
        }

        map.set(scope, {
          scope,
          displayName: SCOPE_DISPLAY_INFO[scope]?.name || scope,
          actions: initialActions,
        });
      }

      const row = map.get(scope)!;
      row.actions[action] = code;
    }

    return Array.from(map.values());
  });

  //* Danh sách rows sau khi áp dụng bộ lọc từ khóa
  readonly filteredRows = computed<PermissionMatrixScopeRow[]>(() => {
    const kw = this.filterKeyword().trim().toLowerCase();
    const rows = this.matrixRows();
    if (!kw) return rows;

    return rows.filter((r) => r.scope.toLowerCase().includes(kw));
  });

  //* Thống kê số lượng quyền được grant
  readonly grantedCount = computed(() => {
    const states = this.permissionStates();
    const raw = this.rawPermissions();
    return raw.filter((code) => !!states[code]).length;
  });

  readonly totalCount = computed(() => this.rawPermissions().length);

  readonly isAllSelected = computed(() => {
    const total = this.totalCount();
    return total > 0 && this.grantedCount() === total;
  });

  readonly isAllIndeterminate = computed(() => {
    const granted = this.grantedCount();
    const total = this.totalCount();
    return granted > 0 && granted < total;
  });

  //* Độ rộng tối thiểu cho table co giãn theo số lượng cột action thực tế
  readonly minTableWidth = computed(() => {
    const actionCount = this.availableActions().length;
    return `${Math.max(760, 264 + actionCount * 90)}px`;
  });

  //#endregion

  //#region //@ HELPERS

  //* Cập nhật hàng loạt trạng thái quyền
  private setPermissionStates(codes: string[], isGranted: boolean) {
    this.permissionStates.update((prev) => {
      const next = { ...prev };
      for (const code of codes) {
        next[code] = isGranted;
      }
      return next;
    });
  }

  //* Lấy danh sách tất cả mã quyền hợp lệ của một hàng
  private getRowCodes(row: PermissionMatrixScopeRow): string[] {
    return Object.values(row.actions).filter((c): c is string => !!c);
  }

  //* Lấy danh sách tất cả mã quyền hợp lệ của một cột thao tác
  private getColumnCodes(action: string): string[] {
    return this.matrixRows()
      .map((r) => r.actions[action])
      .filter((c): c is string => !!c);
  }

  //* Kiểm tra mã quyền cụ thể đã được cấp hay chưa
  isGranted(code: string | null): boolean {
    if (!code) return false;
    return !!this.permissionStates()[code];
  }

  //* Kiểm tra tất cả quyền trong hàng đã được chọn hết chưa
  isRowAllSelected(row: PermissionMatrixScopeRow): boolean {
    const codes = this.getRowCodes(row);
    if (codes.length === 0) return false;

    const states = this.permissionStates();
    return codes.every((code) => !!states[code]);
  }

  //* Kiểm tra hàng chỉ mới được chọn một phần quyền
  isRowIndeterminate(row: PermissionMatrixScopeRow): boolean {
    const codes = this.getRowCodes(row);
    if (codes.length === 0) return false;

    const states = this.permissionStates();
    const checkedCount = codes.filter((code) => !!states[code]).length;
    return checkedCount > 0 && checkedCount < codes.length;
  }

  //* Kiểm tra tất cả quyền trong cột thao tác đã được chọn hết chưa
  isColumnAllSelected(action: string): boolean {
    const codes = this.getColumnCodes(action);
    if (codes.length === 0) return false;
    const states = this.permissionStates();
    return codes.every((code) => !!states[code]);
  }

  //* Kiểm tra cột thao tác chỉ mới được chọn một phần quyền
  isColumnIndeterminate(action: string): boolean {
    const codes = this.getColumnCodes(action);
    if (codes.length === 0) return false;
    const states = this.permissionStates();
    const checkedCount = codes.filter((code) => !!states[code]).length;
    return checkedCount > 0 && checkedCount < codes.length;
  }

  getScopeIcon(scope: string): string {
    return SCOPE_DISPLAY_INFO[scope]?.icon || 'fa-solid fa-layer-group';
  }

  getActionLabel(action: string): string {
    const key = `role.${action.toLowerCase()}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : action;
  }

  //#endregion

  //#region //@ METHODS

  ngOnInit() {
    this.loadPermissions();
  }

  initCreateForm() {
    this.roleForm.reset({
      id: null,
      roleCode: null,
      roleName: null,
      isSystemRole: null,
      isActive: null,
      note: null,
    });
    this.permissionStates.set({});
    this.filterKeyword.set('');
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
    this.filterKeyword.set('');

    const newStates: Record<string, boolean> = {};
    if (item.permissions && Array.isArray(item.permissions)) {
      item.permissions.forEach((p) => {
        if (p.permissionCode && p.permissionValue) {
          const fullCode = `${p.permissionCode}.${p.permissionValue}`;
          newStates[fullCode] = !!p.isGranted;
        } else if (p.permissionCode) {
          newStates[p.permissionCode] = !!p.isGranted;
        }
      });
    }
    this.permissionStates.set(newStates);
  }

  async handleSave() {
    if (this.roleForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const payload = this.roleForm.getRawValue() as unknown as RoleModel;

    //* Đính kèm permissions theo format PermissionModel (vd: CatCountry.View -> Code: CatCountry, Value: View, Scope: null)
    const states = this.permissionStates();
    payload.permissions = this.rawPermissions().map((code) => {
      const lastDot = code.lastIndexOf('.');
      const permissionCode = lastDot > 0 ? code.substring(0, lastDot) : code;
      const permissionValue = lastDot > 0 ? code.substring(lastDot + 1) : '';

      return {
        permissionCode,
        permissionValue,
        permissionScope: null,
        isGranted: !!states[code],
      };
    });

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

  async loadPermissions() {
    this.isLoadingPermissions.set(true);
    try {
      const permissions = await this.facade.getPermission();
      this.rawPermissions.set(permissions || []);
    } finally {
      this.isLoadingPermissions.set(false);
    }
  }

  togglePermission(code: string | null) {
    if (!code) return;
    this.permissionStates.update((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  }

  toggleRow(row: PermissionMatrixScopeRow) {
    const codes = this.getRowCodes(row);
    if (codes.length === 0) return;
    const targetState = !this.isRowAllSelected(row);
    this.setPermissionStates(codes, targetState);
  }

  toggleColumn(action: string) {
    const codes = this.getColumnCodes(action);
    if (codes.length === 0) return;
    const targetState = !this.isColumnAllSelected(action);
    this.setPermissionStates(codes, targetState);
  }

  toggleAll() {
    const targetState = !this.isAllSelected();
    this.setPermissionStates(this.rawPermissions(), targetState);
  }

  //#endregion
}
