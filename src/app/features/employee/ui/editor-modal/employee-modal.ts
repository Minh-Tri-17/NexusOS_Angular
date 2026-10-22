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
    id: new FormControl('', { nonNullable: true }),
    employeeCode: new FormControl('', { nonNullable: true }),
    employeeName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    employmentStatus: new FormControl<EmploymentStatus | string>(EmploymentStatus.active, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    photo: new FormControl('', { nonNullable: true }),
    hireDate: new FormControl('', { nonNullable: true }),
    terminationDate: new FormControl('', { nonNullable: true }),
    isMultiStore: new FormControl<boolean>(false, { nonNullable: true }),

    departmentId: new FormControl<string | null>({ value: null, disabled: true }),
    jobTitleId: new FormControl<string | null>({ value: null, disabled: true }),
    storeId: new FormControl<string | null>({ value: null, disabled: true }),
    countryId: new FormControl<string | null>(null),
    provinceId: new FormControl<string | null>({ value: null, disabled: true }),
    wardId: new FormControl<string | null>({ value: null, disabled: true }),

    email: new FormControl('', { nonNullable: true }),
    phoneNumber: new FormControl('', { nonNullable: true }),
    emergencyContactName: new FormControl('', { nonNullable: true }),
    emergencyContactPhone: new FormControl('', { nonNullable: true }),

    dateOfBirth: new FormControl('', { nonNullable: true }),
    gender: new FormControl('', { nonNullable: true }),
    educationLevel: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),

    identityNumber: new FormControl('', { nonNullable: true }),
    taxCode: new FormControl('', { nonNullable: true }),
    socialInsuranceNumber: new FormControl('', { nonNullable: true }),
    healthInsuranceNumber: new FormControl('', { nonNullable: true }),

    bankAccountNumber: new FormControl('', { nonNullable: true }),
    bankName: new FormControl('', { nonNullable: true }),

    note: new FormControl('', { nonNullable: true }),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.employeeForm.controls.id.valueChanges, {
    initialValue: this.employeeForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  constructor() {
    void this.loadComboboxData();
  }

  //#region //@ HELPERS

  private buildFilter(): PagingRequest {
    const filter: PagingRequest = {
      allowPaging: false,
    };

    return filter;
  }

  private formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toISOString().split('T')[0];
  }

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.photoPreview.set('');
    this.employeeForm.reset({
      id: '',
      employeeCode: '',
      employeeName: '',
      employmentStatus: '',
      photo: '',
      hireDate: '',
      terminationDate: '',
      isMultiStore: false,
      departmentId: null,
      jobTitleId: null,
      storeId: null,
      countryId: null,
      provinceId: null,
      wardId: null,
      email: '',
      phoneNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      dateOfBirth: '',
      gender: '',
      educationLevel: '',
      address: '',
      identityNumber: '',
      taxCode: '',
      socialInsuranceNumber: '',
      healthInsuranceNumber: '',
      bankAccountNumber: '',
      bankName: '',
      note: '',
    });
  }

  initUpdateForm(item: EmployeeModel) {
    this.photoPreview.set(item.photo || '');
    this.employeeForm.patchValue({
      ...item,
      departmentId: item.departmentId && item.departmentId !== NIL_GUID ? item.departmentId : null,
      jobTitleId: item.jobTitleId && item.jobTitleId !== NIL_GUID ? item.jobTitleId : null,
      storeId: item.storeId && item.storeId !== NIL_GUID ? item.storeId : null,
      countryId: item.countryId && item.countryId !== NIL_GUID ? item.countryId : null,
      provinceId: item.provinceId && item.provinceId !== NIL_GUID ? item.provinceId : null,
      wardId: item.wardId && item.wardId !== NIL_GUID ? item.wardId : null,
      employmentStatus: item.employmentStatus ?? EmploymentStatus.active,
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
    this.employeeForm.controls.photo.setValue('');
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
