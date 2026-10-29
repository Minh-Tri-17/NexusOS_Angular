import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { BaseService } from '../../../../../core/services/base.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { Region } from '../../data-access/country.enum';
import { CountryFacade } from '../../data-access/country.facade';
import { CountryModel } from '../../data-access/country.model';

@Component({
  selector: 'app-country-modal',
  imports: [Modal, ReactiveFormsModule, TranslatePipe],
  templateUrl: './country-modal.html',
  styleUrl: './country-modal.scss',
})
export class CountryModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(CountryFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly regions = Object.values(Region);

  readonly countryForm = new FormGroup({
    id: new FormControl<string | null>(null),
    countryCode: new FormControl<string | null>(null),
    countryName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    capital: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    region: new FormControl<Region | string>('', {
      validators: [Validators.required],
    }),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.countryForm.controls.id.valueChanges, {
    initialValue: this.countryForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.countryForm.reset({
      id: null,
      countryCode: null,
      countryName: null,
      capital: null,
      region: '',
      note: null,
    });
  }

  initUpdateForm(item: CountryModel) {
    this.countryForm.patchValue({
      id: item.id || null,
      countryCode: item.countryCode || null,
      countryName: item.countryName || null,
      capital: item.capital || null,
      region: (item.region as Region) || '',
      note: item.note || null,
    });
  }

  async handleSave() {
    if (this.countryForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.countryForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const payload = this.countryForm.getRawValue() as unknown as CountryModel;

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
