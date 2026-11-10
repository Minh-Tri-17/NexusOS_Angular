import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { PagingRequest } from '../../../../core/models/paging.model';
import { BaseService } from '../../../../core/services/base.service';
import { Modal } from '../../../../shared/components/modal/modal';
import { AutoTrimDirective } from '../../../../shared/directives/auto-trim.directive';
import { NumberOnlyDirective } from '../../../../shared/directives/number-only.directive';
import { SelectLoadingDirective } from '../../../../shared/directives/select-loading.directive';
import { UppercaseDirective } from '../../../../shared/directives/uppercase.directive';
import { ContractTypeFacade } from '../../../categories/contract-type/data-access/contract-type.facade';
import { ContractTypeModel } from '../../../categories/contract-type/data-access/contract-type.model';
import { EmployeeFacade } from '../../../employee/data-access/employee.facade';
import { EmployeeModel } from '../../../employee/data-access/employee.model';
import {
  APPROVAL_STATUS_OPTIONS,
  ApprovalStatus,
  CONTRACT_STATUS_OPTIONS,
  ContractStatus,
  SALARY_UNIT_OPTIONS,
  SalaryUnit,
} from '../../data-access/contract.enum';
import { ContractFacade } from '../../data-access/contract.facade';
import { ContractModel } from '../../data-access/contract.model';

@Component({
  selector: 'app-contract-modal',
  imports: [
    Modal,
    ReactiveFormsModule,
    TranslatePipe,
    SelectLoadingDirective,
    AutoTrimDirective,
    UppercaseDirective,
    NumberOnlyDirective,
  ],
  templateUrl: './contract-modal.html',
  styleUrl: './contract-modal.scss',
})
export class ContractModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(ContractFacade);
  private readonly employeeFacade = inject(EmployeeFacade);
  private readonly contractTypeFacade = inject(ContractTypeFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  readonly contractStatuses = CONTRACT_STATUS_OPTIONS;
  readonly approvalStatuses = APPROVAL_STATUS_OPTIONS;
  readonly salaryUnits = SALARY_UNIT_OPTIONS;

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly isLoadingEmployee = signal(false);
  readonly isLoadingContractType = signal(false);
  readonly employees = signal<EmployeeModel[]>([]);
  readonly contractTypes = signal<ContractTypeModel[]>([]);

  readonly contractForm = new FormGroup({
    id: new FormControl<string | null>(null),
    contractCode: new FormControl<string | null>(null),
    contractName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    employeeId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    contractTypeId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    contractStatus: new FormControl<ContractStatus | string>(ContractStatus.Active),
    approvalStatus: new FormControl<ApprovalStatus | string>(ApprovalStatus.Pending),
    startDate: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    endDate: new FormControl<string | null>(null),
    baseSalary: new FormControl<number | string | null>(null),
    salaryUnit: new FormControl<SalaryUnit | string>(SalaryUnit.VND),
    workingHoursPerWeek: new FormControl<number | string | null>(40),
    otrate: new FormControl<number | string | null>(1.5),
    allowanceAmount: new FormControl<number | string | null>(0),
    insuranceContribution: new FormControl<number | string | null>(0),
    signedDate: new FormControl<string | null>(null),
    signedBy: new FormControl<string | null>(null),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.contractForm.controls.id.valueChanges, {
    initialValue: this.contractForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ HELPERS

  private formatDateForInput(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    return d.toISOString().split('T')[0];
  }

  async loadComboboxData() {
    await Promise.allSettled([this.loadEmployees(), this.loadContractTypes()]);
  }

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

  private async loadContractTypes() {
    if (this.contractTypes().length > 0) return;

    this.isLoadingContractType.set(true);
    try {
      const filter: PagingRequest = { allowPaging: false };
      const res = await this.contractTypeFacade.getPaging(filter);
      this.contractTypes.set(res.result?.items || []);
    } catch {
      this.contractTypes.set([]);
    } finally {
      this.isLoadingContractType.set(false);
    }
  }

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.contractForm.reset({
      id: null,
      contractCode: null,
      contractName: null,
      employeeId: '',
      contractTypeId: '',
      contractStatus: ContractStatus.Active,
      approvalStatus: ApprovalStatus.Pending,
      startDate: null,
      endDate: null,
      baseSalary: null,
      salaryUnit: SalaryUnit.VND,
      workingHoursPerWeek: 40,
      otrate: 1.5,
      allowanceAmount: 0,
      insuranceContribution: 0,
      signedDate: null,
      signedBy: null,
      note: null,
    });
    this.loadComboboxData();
  }

  initUpdateForm(item: ContractModel) {
    this.contractForm.patchValue({
      id: item.id || null,
      contractCode: item.contractCode || null,
      contractName: item.contractName || null,
      employeeId: item.employeeId || '',
      contractTypeId: item.contractTypeId || '',
      contractStatus: (item.contractStatus as ContractStatus) || ContractStatus.Active,
      approvalStatus: (item.approvalStatus as ApprovalStatus) || ApprovalStatus.Pending,
      startDate: this.formatDateForInput(item.startDate),
      endDate: this.formatDateForInput(item.endDate),
      baseSalary: item.baseSalary ?? null,
      salaryUnit: item.salaryUnit || SalaryUnit.VND,
      workingHoursPerWeek: item.workingHoursPerWeek ?? 40,
      otrate: item.otrate ?? 1.5,
      allowanceAmount: item.allowanceAmount ?? 0,
      insuranceContribution: item.insuranceContribution ?? 0,
      signedDate: this.formatDateForInput(item.signedDate),
      signedBy: item.signedBy || null,
      note: item.note || null,
    });
    this.loadComboboxData();
  }

  async handleSave() {
    if (this.contractForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.contractForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const formValue = this.contractForm.getRawValue();
    const payload: ContractModel = {
      ...(formValue as unknown as ContractModel),
      baseSalary:
        formValue.baseSalary !== null && formValue.baseSalary !== ''
          ? Number(formValue.baseSalary)
          : null,
      workingHoursPerWeek:
        formValue.workingHoursPerWeek !== null && formValue.workingHoursPerWeek !== ''
          ? Number(formValue.workingHoursPerWeek)
          : null,
      otrate:
        formValue.otrate !== null && formValue.otrate !== '' ? Number(formValue.otrate) : null,
      allowanceAmount:
        formValue.allowanceAmount !== null && formValue.allowanceAmount !== ''
          ? Number(formValue.allowanceAmount)
          : null,
      insuranceContribution:
        formValue.insuranceContribution !== null && formValue.insuranceContribution !== ''
          ? Number(formValue.insuranceContribution)
          : null,
      employeeId: formValue.employeeId || null,
      contractTypeId: formValue.contractTypeId || null,
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

