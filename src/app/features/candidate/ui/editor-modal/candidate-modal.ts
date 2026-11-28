import { Component, computed, ElementRef, inject, output, signal, viewChild } from '@angular/core';
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
import { DepartmentFacade } from '../../../categories/department/data-access/department.facade';
import { DepartmentModel } from '../../../categories/department/data-access/department.model';
import { JobTitleFacade } from '../../../categories/job-title/data-access/job-title.facade';
import { JobTitleModel } from '../../../categories/job-title/data-access/job-title.model';
import { Gender, GENDER_OPTIONS } from '../../../employee/data-access/employee.enum';
import { CANDIDATE_STAGE_OPTIONS, CandidateStage } from '../../data-access/candidate.enum';
import { CandidateFacade } from '../../data-access/candidate.facade';
import { CandidateModel } from '../../data-access/candidate.model';

@Component({
  selector: 'app-candidate-modal',
  imports: [
    Modal,
    ReactiveFormsModule,
    TranslatePipe,
    SelectLoadingDirective,
    AutoTrimDirective,
    UppercaseDirective,
    NumberOnlyDirective,
  ],
  templateUrl: './candidate-modal.html',
  styleUrl: './candidate-modal.scss',
})
export class CandidateModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(CandidateFacade);
  private readonly departmentFacade = inject(DepartmentFacade);
  private readonly jobTitleFacade = inject(JobTitleFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileAttachInput');
  readonly stages = CANDIDATE_STAGE_OPTIONS;
  readonly genders = GENDER_OPTIONS;

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);
  readonly isLoadingDepartment = signal(false);
  readonly isLoadingJobTitle = signal(false);
  readonly photoPreview = signal<string>('');
  readonly selectedFile = signal<File | null>(null);
  readonly departments = signal<DepartmentModel[]>([]);
  readonly jobTitles = signal<JobTitleModel[]>([]);

  readonly candidateForm = new FormGroup({
    id: new FormControl<string | null>(null),
    candidateCode: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(50)],
    }),
    candidateName: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.maxLength(250)],
    }),
    gender: new FormControl<Gender | string>(Gender.Male, { nonNullable: true }),
    stage: new FormControl<CandidateStage | string>(CandidateStage.Applied, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    photo: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(500)],
    }),
    email: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(100)],
    }),
    phoneNumber: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(20)],
    }),
    workLocation: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(250)],
    }),
    appliedDate: new FormControl<string | null>(null),

    departmentId: new FormControl<string>('', { nonNullable: true }),
    jobTitleId: new FormControl<string>('', { nonNullable: true }),
    storeId: new FormControl<string | null>({ value: null, disabled: true }),

    expectedSalary: new FormControl<number | string | null>(null),
    experienceYears: new FormControl<number | string | null>(null, {
      validators: [Validators.min(0), Validators.max(999.99)],
    }),
    matchScore: new FormControl<number | string | null>(null, {
      validators: [Validators.min(0), Validators.max(100)],
    }),
    skills: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(1000)],
    }),
    fileAttach: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(500)],
    }),
    isBookmarked: new FormControl<boolean>(false, { nonNullable: true }),
    interviewerNote: new FormControl<string | null>(null),
    note: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(500)],
    }),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.candidateForm.controls.id.valueChanges, {
    initialValue: this.candidateForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ HELPERS

  async loadComboboxData() {
    await Promise.allSettled([this.loadDepartments(), this.loadJobTitles()]);
  }

  private async loadDepartments() {
    if (this.departments().length > 0) return;

    this.isLoadingDepartment.set(true);
    try {
      const filter = this.buildFilter();
      const res = await this.departmentFacade.getPaging(filter);
      this.departments.set(res.result?.items || []);
    } catch {
      this.departments.set([]);
    } finally {
      this.isLoadingDepartment.set(false);
    }
  }

  private async loadJobTitles() {
    if (this.jobTitles().length > 0) return;

    this.isLoadingJobTitle.set(true);
    try {
      const filter = this.buildFilter();
      const res = await this.jobTitleFacade.getPaging(filter);
      this.jobTitles.set(res.result?.items || []);
    } catch {
      this.jobTitles.set([]);
    } finally {
      this.isLoadingJobTitle.set(false);
    }
  }

  private buildFilter(): PagingRequest {
    const filter: PagingRequest = {
      allowPaging: false,
    };

    return filter;
  }

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.photoPreview.set('');
    this.selectedFile.set(null);
    this.baseService.resetFileInput(this.fileInput());
    this.candidateForm.reset({
      id: null,
      candidateCode: null,
      candidateName: null,
      gender: Gender.Male,
      stage: CandidateStage.Applied,
      photo: null,
      email: null,
      phoneNumber: null,
      workLocation: null,
      appliedDate: this.baseService.formatDateForInput(new Date()),
      departmentId: '',
      jobTitleId: '',
      storeId: null,
      expectedSalary: null,
      experienceYears: null,
      matchScore: null,
      skills: null,
      fileAttach: null,
      isBookmarked: false,
      interviewerNote: null,
      note: null,
    });
    this.loadComboboxData();
  }

  initUpdateForm(item: CandidateModel) {
    this.photoPreview.set(item.photo || '');
    this.selectedFile.set(null);
    this.baseService.resetFileInput(this.fileInput());
    this.candidateForm.patchValue({
      id: item.id || null,
      candidateCode: item.candidateCode || null,
      candidateName: item.candidateName || null,
      gender: item.gender || '',
      stage: item.stage || CandidateStage.Applied,
      photo: item.photo || null,
      email: item.email || null,
      phoneNumber: item.phoneNumber || null,
      workLocation: item.workLocation || null,
      appliedDate: this.baseService.formatDateForInput(item.appliedDate),
      departmentId: item.departmentId || '',
      jobTitleId: item.jobTitleId || '',
      storeId: item.storeId || null,
      expectedSalary: item.expectedSalary ?? null,
      experienceYears: item.experienceYears ?? null,
      matchScore: item.matchScore ?? null,
      skills: item.skills || null,
      fileAttach: item.fileAttach || null,
      isBookmarked: Boolean(item.isBookmarked),
      interviewerNote: item.interviewerNote || null,
      note: item.note || null,
    });
    this.loadComboboxData();
  }

  async onPhotoSelected(event: Event) {
    const file = this.baseService.getSelectedFile(event);
    if (!file) return;

    try {
      const base64 = await this.baseService.readFileAsDataUrl(file);
      this.photoPreview.set(base64);
      this.candidateForm.controls.photo.setValue(file.name);
    } catch {}
  }

  removePhoto(fileInput?: HTMLInputElement) {
    this.photoPreview.set('');
    this.baseService.clearFileField(this.candidateForm.controls.photo, fileInput);
  }

  handleFileSelect(event: Event) {
    const file = this.baseService.getSelectedFile(event);
    if (!file) return;

    this.selectedFile.set(file);
    this.candidateForm.controls.fileAttach.setValue(file.name);
  }

  handleRemoveFile() {
    this.selectedFile.set(null);
    this.baseService.clearFileField(this.candidateForm.controls.fileAttach, this.fileInput());
  }

  async handleSave() {
    if (this.candidateForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.candidateForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const formValue = this.candidateForm.getRawValue();
    const payload: CandidateModel = {
      ...(formValue as unknown as CandidateModel),
      departmentId: formValue.departmentId || null,
      jobTitleId: formValue.jobTitleId || null,
      storeId: formValue.storeId || null,
      gender: formValue.gender || null,
      stage: formValue.stage || CandidateStage.Applied,
      expectedSalary:
        formValue.expectedSalary !== null && formValue.expectedSalary !== ''
          ? Number(formValue.expectedSalary)
          : null,
      experienceYears:
        formValue.experienceYears !== null && formValue.experienceYears !== ''
          ? Number(formValue.experienceYears)
          : null,
      matchScore:
        formValue.matchScore !== null && formValue.matchScore !== ''
          ? Number(formValue.matchScore)
          : null,
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
