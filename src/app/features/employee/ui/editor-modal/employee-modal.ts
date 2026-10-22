import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { PagingRequest } from '../../../../core/models/paging.model';
import { BaseService } from '../../../../core/services/base.service';
import { Modal } from '../../../../shared/components/modal/modal';
import { CountryFacade } from '../../../categories/country/data-access/country.facade';
import { CountryModel } from '../../../categories/country/data-access/country.model';
import { EmploymentStatus } from '../../data-access/employee.enum';
import { EmployeeFacade } from '../../data-access/employee.facade';
import { EmployeeModel } from '../../data-access/employee.model';

@Component({
  selector: 'app-employee-modal',
  imports: [Modal, ReactiveFormsModule, TranslatePipe],
  templateUrl: './employee-modal.html',
  styleUrl: './employee-modal.scss',
})
export class EmployeeModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(EmployeeFacade);
  private readonly countryFacade = inject(CountryFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly photoPreview = signal<string>('');
  readonly countries = signal<CountryModel[]>([]);
  readonly employmentStatus = Object.values(EmploymentStatus);

  readonly employeeForm = new FormGroup({
    id: new FormControl<string | null>(null),
    employeeCode: new FormControl<string | null>(null),
    employeeName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    employmentStatus: new FormControl<EmploymentStatus | string | null>(null, {
      validators: [Validators.required],
    }),
    photo: new FormControl<string | null>(null),
    hireDate: new FormControl<string | null>(null),
    terminationDate: new FormControl<string | null>(null),
    isMultiStore: new FormControl<boolean>(false, { nonNullable: true }),

    departmentId: new FormControl<string | null>({ value: null, disabled: true }),
    jobTitleId: new FormControl<string | null>({ value: null, disabled: true }),
    storeId: new FormControl<string | null>({ value: null, disabled: true }),
    countryId: new FormControl<string | null>(null),
    provinceId: new FormControl<string | null>({ value: null, disabled: true }),
    wardId: new FormControl<string | null>({ value: null, disabled: true }),

    email: new FormControl<string | null>(null),
    phoneNumber: new FormControl<string | null>(null),
    emergencyContactName: new FormControl<string | null>(null),
    emergencyContactPhone: new FormControl<string | null>(null),

    dateOfBirth: new FormControl<string | null>(null),
    gender: new FormControl<string | null>(null),
    educationLevel: new FormControl<string | null>(null),
    address: new FormControl<string | null>(null),

    identityNumber: new FormControl<string | null>(null),
    taxCode: new FormControl<string | null>(null),
    socialInsuranceNumber: new FormControl<string | null>(null),
    healthInsuranceNumber: new FormControl<string | null>(null),

    bankAccountNumber: new FormControl<string | null>(null),
    bankName: new FormControl<string | null>(null),

    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.employeeForm.controls.id.valueChanges, {
    initialValue: this.employeeForm.controls.id.value,
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

  private formatDateForInput(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    return d.toISOString().split('T')[0];
  }

  //#endregion

  //#region //@ METHODS

  async initCreateForm() {
    await this.loadComboboxData();

    this.photoPreview.set('');
    this.employeeForm.reset({
      id: null,
      employeeCode: null,
      employeeName: null,
      employmentStatus: null,
      photo: null,
      hireDate: null,
      terminationDate: null,
      isMultiStore: false,
      departmentId: null,
      jobTitleId: null,
      storeId: null,
      countryId: null,
      provinceId: null,
      wardId: null,
      email: null,
      phoneNumber: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      dateOfBirth: null,
      gender: null,
      educationLevel: null,
      address: null,
      identityNumber: null,
      taxCode: null,
      socialInsuranceNumber: null,
      healthInsuranceNumber: null,
      bankAccountNumber: null,
      bankName: null,
      note: null,
    });
  }

  async initUpdateForm(item: EmployeeModel) {
    await this.loadComboboxData();

    this.photoPreview.set(item.photo || '');
    this.employeeForm.patchValue({
      id: item.id || null,
      employeeCode: item.employeeCode || null,
      employeeName: item.employeeName || null,
      photo: item.photo || null,
      email: item.email || null,
      phoneNumber: item.phoneNumber || null,
      emergencyContactName: item.emergencyContactName || null,
      emergencyContactPhone: item.emergencyContactPhone || null,
      gender: item.gender || null,
      educationLevel: item.educationLevel || null,
      address: item.address || null,
      identityNumber: item.identityNumber || null,
      taxCode: item.taxCode || null,
      socialInsuranceNumber: item.socialInsuranceNumber || null,
      healthInsuranceNumber: item.healthInsuranceNumber || null,
      bankAccountNumber: item.bankAccountNumber || null,
      bankName: item.bankName || null,
      note: item.note || null,
      departmentId: item.departmentId || null,
      jobTitleId: item.jobTitleId || null,
      storeId: item.storeId || null,
      countryId: item.countryId || null,
      provinceId: item.provinceId || null,
      wardId: item.wardId || null,
      employmentStatus: item.employmentStatus || null,
      dateOfBirth: this.formatDateForInput(item.dateOfBirth),
      hireDate: this.formatDateForInput(item.hireDate),
      terminationDate: this.formatDateForInput(item.terminationDate),
      isMultiStore: Boolean(item.isMultiStore),
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.photoPreview.set(base64);
        this.employeeForm.controls.photo.setValue(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(fileInput?: HTMLInputElement) {
    this.photoPreview.set('');
    this.employeeForm.controls.photo.setValue(null);
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async handleSave() {
    if (this.employeeForm.invalid) return;
    this.isSaving.set(true);

    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const rawValues = this.employeeForm.getRawValue();

    const payload: EmployeeModel = {
      ...(rawValues as unknown as EmployeeModel),
      departmentId: rawValues.departmentId || null,
      jobTitleId: rawValues.jobTitleId || null,
      storeId: rawValues.storeId || null,
      countryId: rawValues.countryId || null,
      provinceId: rawValues.provinceId || null,
      wardId: rawValues.wardId || null,
      dateOfBirth: rawValues.dateOfBirth ? new Date(rawValues.dateOfBirth) : (null as any),
      hireDate: rawValues.hireDate ? new Date(rawValues.hireDate) : (null as any),
      terminationDate: rawValues.terminationDate
        ? new Date(rawValues.terminationDate)
        : (null as any),
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
