import { Component, computed, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NIL as NIL_GUID } from 'uuid';
import { BaseService } from '../../../../../core/services/base.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { Region } from '../../data-access/country.enum';
import { CountryFacade } from '../../data-access/country.facade';
import { CountryModel } from '../../data-access/country.model';

@Component({
  selector: 'app-country-modal',
  imports: [Modal, ReactiveFormsModule],
  templateUrl: './country-modal.html',
  styleUrl: './country-modal.scss',
})
export class CountryModal {
  private baseService = inject(BaseService);
  private facade = inject(CountryFacade);

  //#region //@ PROPS

  saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  regions = Object.values(Region);

  countryForm = new FormGroup({
    id: new FormControl('', { nonNullable: true }),
    countryCode: new FormControl<string | null>(null),
    countryName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    capital: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    region: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private formValueSignal = toSignal(this.countryForm.valueChanges, {
    initialValue: this.countryForm.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  title = computed(() => (this.formValueSignal()?.id ? 'Update' : 'Create'));

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.countryForm.reset();
  }

  initUpdateForm(item: CountryModel) {
    this.countryForm.patchValue(item);
  }

  async handleSave() {
    if (this.countryForm.invalid) return;

    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    //* as ép kiểu sang model tương ứng
    const rawValues = this.countryForm.getRawValue() as CountryModel;

    if (rawValues.id) {
      await this.facade.update(rawValues);
    } else {
      rawValues.id = NIL_GUID;
      await this.facade.create(rawValues);
    }

    this.saveSuccess.emit();

    this.initCreateForm();

    this.baseService.closeModal('countryEditorModal');
  }

  //#endregion
}
