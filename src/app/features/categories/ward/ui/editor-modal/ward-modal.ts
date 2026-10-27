import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { PagingRequest } from '../../../../../core/models/paging.model';
import { BaseService } from '../../../../../core/services/base.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ProvinceFacade } from '../../../province/data-access/province.facade';
import { ProvinceModel } from '../../../province/data-access/province.model';
import { WardFacade } from '../../data-access/ward.facade';
import { WardModel } from '../../data-access/ward.model';

@Component({
  selector: 'app-ward-modal',
  imports: [Modal, ReactiveFormsModule, TranslatePipe],
  templateUrl: './ward-modal.html',
  styleUrl: './ward-modal.scss',
})
export class WardModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(WardFacade);
  private readonly provinceFacade = inject(ProvinceFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly provinces = signal<ProvinceModel[]>([]);

  readonly wardForm = new FormGroup({
    id: new FormControl<string | null>(null),
    provinceId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    wardCode: new FormControl<string | null>(null),
    wardName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.wardForm.controls.id.valueChanges, {
    initialValue: this.wardForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ HELPERS

  private buildFilter(): PagingRequest {
    const filter: PagingRequest = {
      allowPaging: false,
    };

    return filter;
  }

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.wardForm.reset({
      id: null,
      provinceId: null,
      wardCode: null,
      wardName: null,
      note: null,
    });
  }

  initUpdateForm(item: WardModel) {
    this.wardForm.patchValue({
      id: item.id || null,
      provinceId: item.provinceId || null,
      wardCode: item.wardCode || null,
      wardName: item.wardName || null,
      note: item.note || null,
    });
  }

  async handleSave() {
    if (this.wardForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.wardForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const payload = this.wardForm.getRawValue() as unknown as WardModel;

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

  async loadComboboxData() {
    await Promise.allSettled([this.loadProvinces()]);
  }

  private async loadProvinces() {
    if (this.provinces().length > 0) return;

    try {
      const filter = this.buildFilter();
      const res = await this.provinceFacade.getPaging(filter);
      this.provinces.set(res.result?.items || []);
    } catch {
      this.provinces.set([]);
    }
  }

  //#endregion
}
