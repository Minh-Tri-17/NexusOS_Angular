import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { PagingRequest } from '../../../../../core/models/paging.model';
import { BaseService } from '../../../../../core/services/base.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { CountryFacade } from '../../../country/data-access/country.facade';
import { CountryModel } from '../../../country/data-access/country.model';
import { ProvinceFacade } from '../../data-access/province.facade';
import { ProvinceModel } from '../../data-access/province.model';

@Component({
  selector: 'app-province-modal',
  imports: [Modal, ReactiveFormsModule, TranslatePipe],
  templateUrl: './province-modal.html',
  styleUrl: './province-modal.scss',
})
export class ProvinceModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(ProvinceFacade);
  private readonly countryFacade = inject(CountryFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly countries = signal<CountryModel[]>([]);

  readonly provinceForm = new FormGroup({
    id: new FormControl<string | null>(null),
    countryId: new FormControl<string>('', {
      validators: [Validators.required],
    }),
    provinceCode: new FormControl<string | null>(null),
    provinceName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.provinceForm.controls.id.valueChanges, {
    initialValue: this.provinceForm.controls.id.value,
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
    this.provinceForm.reset({
      id: null,
      countryId: '',
      provinceCode: null,
      provinceName: null,
      note: null,
    });
  }

  initUpdateForm(item: ProvinceModel) {
    this.provinceForm.patchValue({
      id: item.id || null,
      countryId: item.countryId || '',
      provinceCode: item.provinceCode || null,
      provinceName: item.provinceName || null,
      note: item.note || null,
    });
  }

  async handleSave() {
    if (this.provinceForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.provinceForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const payload = this.provinceForm.getRawValue() as unknown as ProvinceModel;

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
    await Promise.allSettled([this.loadCountries()]);
  }

  private async loadCountries() {
    if (this.countries().length > 0) return;

    try {
      const filter = this.buildFilter();
      const res = await this.countryFacade.getPaging(filter);
      this.countries.set(res.result?.items || []);
    } catch {
      this.countries.set([]);
    }
  }

  //#endregion
}
