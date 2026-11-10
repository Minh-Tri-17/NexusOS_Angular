import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NIL as NIL_GUID } from 'uuid';
import { BaseService } from '../../../../../core/services/base.service';
import { AutoTrimDirective } from '../../../../../shared/directives/auto-trim.directive';
import { UppercaseDirective } from '../../../../../shared/directives/uppercase.directive';
import { Modal } from '../../../../../shared/components/modal/modal';
import { JobTitleFacade } from '../../data-access/job-title.facade';
import { JobTitleModel } from '../../data-access/job-title.model';

@Component({
  selector: 'app-job-title-modal',
  imports: [Modal, ReactiveFormsModule, TranslatePipe, AutoTrimDirective, UppercaseDirective],
  templateUrl: './job-title-modal.html',
  styleUrl: './job-title-modal.scss',
})
export class JobTitleModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(JobTitleFacade);

  //#region //@ PROPS

  readonly saveSuccess = output<void>();

  //#endregion

  //#region //@ STATE

  readonly isSaving = signal(false);

  readonly jobTitleForm = new FormGroup({
    id: new FormControl<string | null>(null),
    jobTitleCode: new FormControl<string | null>(null),
    jobTitleName: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    note: new FormControl<string | null>(null),
  });

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly currentId = toSignal(this.jobTitleForm.controls.id.valueChanges, {
    initialValue: this.jobTitleForm.controls.id.value,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly title = computed(() => (this.currentId() ? 'common.update' : 'common.create'));

  //#endregion

  //#region //@ METHODS

  initCreateForm() {
    this.jobTitleForm.reset({
      id: null,
      jobTitleCode: null,
      jobTitleName: null,
      note: null,
    });
  }

  initUpdateForm(item: JobTitleModel) {
    this.jobTitleForm.patchValue({
      id: item.id || null,
      jobTitleCode: item.jobTitleCode || null,
      jobTitleName: item.jobTitleName || null,
      note: item.note || null,
    });
  }

  async handleSave() {
    if (this.jobTitleForm.invalid) {
      //* markAllAsTouched() đánh dấu tất cả các field đã được tương tác để hiển thị lỗi validation.
      this.jobTitleForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const payload = this.jobTitleForm.getRawValue() as unknown as JobTitleModel;

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

