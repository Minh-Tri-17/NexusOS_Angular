import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { PagingRequest } from '../../../../core/models/paging.model';
import { BaseService } from '../../../../core/services/base.service';
import { Modal } from '../../../../shared/components/modal/modal';
import { DepartmentFacade } from '../../../categories/department/data-access/department.facade';
import { DepartmentModel } from '../../../categories/department/data-access/department.model';
import { JobTitleFacade } from '../../../categories/job-title/data-access/job-title.facade';
import { JobTitleModel } from '../../../categories/job-title/data-access/job-title.model';
import { CountryFacade } from '../../../categories/country/data-access/country.facade';
import { CountryModel } from '../../../categories/country/data-access/country.model';
import { ProvinceFacade } from '../../../categories/province/data-access/province.facade';
import { ProvinceModel } from '../../../categories/province/data-access/province.model';
import { WardFacade } from '../../../categories/ward/data-access/ward.facade';
import { WardModel } from '../../../categories/ward/data-access/ward.model';
import {
  EducationLevel,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  EmploymentStatus,
  GENDER_OPTIONS,
  Gender,
} from '../../data-access/employee.enum';
import { EmployeeFacade } from '../../data-access/employee.facade';
import { EmployeeModel } from '../../data-access/employee.model';
import { UserModel } from '../../../system/users/data-access/user.model';

@Component({
  selector: 'app-employee-modal',
  imports: [Modal, ReactiveFormsModule, TranslatePipe],
  templateUrl: './employee-modal.html',
  styleUrl: './employee-modal.scss',
})
export class EmployeeModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(EmployeeFacade);
  private readonly departmentFacade = inject(DepartmentFacade);
  private readonly jobTitleFacade = inject(JobTitleFacade);
  private readonly countryFacade = inject(CountryFacade);
  private readonly provinceFacade = inject(ProvinceFacade);
  private readonly wardFacade = inject(WardFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();
  readonly employmentStatuses = EMPLOYMENT_STATUS_OPTIONS;
  readonly genders = GENDER_OPTIONS;
  readonly educationLevels = EDUCATION_LEVEL_OPTIONS;

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly photoPreview = signal<string>('');
  readonly departments = signal<DepartmentModel[]>([]);
  readonly jobTitles = signal<JobTitleModel[]>([]);
  readonly countries = signal<CountryModel[]>([]);
  readonly provinces = signal<ProvinceModel[]>([]);
  readonly wards = signal<WardModel[]>([]);

  readonly employeeForm = new FormGroup({
    id: new FormControl<string | null>(null),
    employeeCode: new FormControl<string | null>(null),
    employeeName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    employmentStatus: new FormControl<EmploymentStatus | string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    photo: new FormControl<string | null>(null),
    hireDate: new FormControl<string | null>(null),
    terminationDate: new FormControl<string | null>(null),
    isMultiStore: new FormControl<boolean>(false, { nonNullable: true }),

    departmentId: new FormControl<string>('', { nonNullable: true }),
    jobTitleId: new FormControl<string>('', { nonNullable: true }),
    storeId: new FormControl<string | null>({ value: null, disabled: true }),
    countryId: new FormControl<string>('', { nonNullable: true }),
    provinceId: new FormControl<string>('', { nonNullable: true }),
    wardId: new FormControl<string>('', { nonNullable: true }),

    email: new FormControl<string | null>(null),
    phoneNumber: new FormControl<string | null>(null),
    emergencyContactName: new FormControl<string | null>(null),
    emergencyContactPhone: new FormControl<string | null>(null),

    dateOfBirth: new FormControl<string | null>(null),
    gender: new FormControl<Gender | string>('', { nonNullable: true }),
    educationLevel: new FormControl<EducationLevel | string>('', { nonNullable: true }),
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

  async loadComboboxData() {
    await Promise.allSettled([
      this.loadDepartments(),
      this.loadJobTitles(),
      this.loadCountries(),
      this.loadProvinces(),
      this.loadWards(),
    ]);
  }

  private async loadDepartments() {
    if (this.departments().length > 0) return;

    try {
      const filter = this.buildFilter();
      const res = await this.departmentFacade.getPaging(filter);
      this.departments.set(res.result?.items || []);
    } catch {
      this.departments.set([]);
    }
  }

  private async loadJobTitles() {
    if (this.jobTitles().length > 0) return;

    try {
      const filter = this.buildFilter();
      const res = await this.jobTitleFacade.getPaging(filter);
      this.jobTitles.set(res.result?.items || []);
    } catch {
      this.jobTitles.set([]);
    }
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

  private async loadWards() {
    if (this.wards().length > 0) return;

    try {
      const filter = this.buildFilter();
      const res = await this.wardFacade.getPaging(filter);
      this.wards.set(res.result?.items || []);
    } catch {
      this.wards.set([]);
    }
  }

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

  initCreateForm() {
    this.photoPreview.set('');
    this.employeeForm.reset({
      id: null,
      employeeCode: null,
      employeeName: null,
      employmentStatus: '',
      photo: null,
      hireDate: null,
      terminationDate: null,
      isMultiStore: false,
      departmentId: '',
      jobTitleId: '',
      storeId: null,
      countryId: '',
      provinceId: '',
      wardId: '',
      email: null,
      phoneNumber: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      dateOfBirth: null,
      gender: '',
      educationLevel: '',
      address: null,
      identityNumber: null,
      taxCode: null,
      socialInsuranceNumber: null,
      healthInsuranceNumber: null,
      bankAccountNumber: null,
      bankName: null,
      note: null,
    });
    this.loadComboboxData();
  }

  initUpdateForm(item: EmployeeModel) {
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
      gender: item.gender || '',
      educationLevel: item.educationLevel || '',
      address: item.address || null,
      identityNumber: item.identityNumber || null,
      taxCode: item.taxCode || null,
      socialInsuranceNumber: item.socialInsuranceNumber || null,
      healthInsuranceNumber: item.healthInsuranceNumber || null,
      bankAccountNumber: item.bankAccountNumber || null,
      bankName: item.bankName || null,
      note: item.note || null,
      departmentId: item.departmentId || '',
      jobTitleId: item.jobTitleId || '',
      storeId: item.storeId || null,
      countryId: item.countryId || '',
      provinceId: item.provinceId || '',
      wardId: item.wardId || '',
      employmentStatus: item.employmentStatus || '',
      dateOfBirth: this.formatDateForInput(item.dateOfBirth),
      hireDate: this.formatDateForInput(item.hireDate),
      terminationDate: this.formatDateForInput(item.terminationDate),
      isMultiStore: Boolean(item.isMultiStore),
    });
    this.loadComboboxData();
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
    if (fileInput) fileInput.value = '';
  }

  async handleSave() {
    if (this.employeeForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const payload = this.employeeForm.getRawValue() as unknown as EmployeeModel;
    payload.departmentId = payload.departmentId || null;
    payload.countryId = payload.countryId || null;
    payload.provinceId = payload.provinceId || null;
    payload.wardId = payload.wardId || null;
    payload.gender = payload.gender || null;
    payload.educationLevel = payload.educationLevel || null;

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
