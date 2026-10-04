import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BASE_CONSTANTS } from '../../../core/constants/base.constant';
import { FilterOperator, FilterType } from '../../../core/constants/filter.enum';
import { BaseService } from '../../../core/services/base.service';
import { Modal } from '../modal/modal';
import { EXPORT_MODAL_CONTEXT } from '../modal/modal-context';

export type ExportOption =
  | typeof BASE_CONSTANTS.exportOptionAll
  | typeof BASE_CONSTANTS.exportOptionCurrent
  | typeof BASE_CONSTANTS.exportOptionSelect;

@Component({
  selector: 'app-export',
  imports: [Modal, TranslatePipe],
  templateUrl: './export.html',
  styleUrl: './export.scss',
})
export class Export {
  readonly BASE_CONSTANTS = BASE_CONSTANTS;
  private readonly baseService = inject(BaseService);
  private readonly ctx = inject(EXPORT_MODAL_CONTEXT, { optional: true });

  //#region //@ PROPS

  //* Dữ liệu truyền qua Injector (khi mở bằng NgbModal.open).
  readonly exportFn = () => this.ctx?.exportFn;
  readonly currentFilter = () => this.ctx?.currentFilter;
  readonly totalRecord = () => this.ctx?.totalRecord ?? 0;
  readonly fromRecord = () => this.ctx?.fromRecord ?? 0;
  readonly toRecord = () => this.ctx?.toRecord ?? 0;
  readonly selectedIds = () => this.ctx?.selectedIds ?? new Set();
  readonly fileName = () => this.ctx?.fileName ?? 'export';

  //#endregion

  //#region //@ STATE

  readonly exportOption = signal<ExportOption>(BASE_CONSTANTS.exportOptionAll);
  readonly isExporting = signal(false);
  readonly showProgress = signal(false);
  readonly progressStatus = signal('');
  readonly progressPercentage = signal(0);

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly canExportSelectItems = computed(() => this.selectedIds().size > 0);
  readonly canExportPage = computed(() => this.totalRecord() > 0);
  readonly totalPageRecord = computed(() => {
    const to = this.toRecord();
    const from = this.fromRecord();
    if (to === 0 || from === 0 || to < from) return 0;

    return to - from + 1;
  });

  //#endregion

  //#region //@ HELPERS

  private buildExportFilter(option: ExportOption) {
    const baseFilter = { ...this.currentFilter() };

    switch (option) {
      case BASE_CONSTANTS.exportOptionAll:
        return {
          ...baseFilter,
          allowPaging: false,
        };
      case BASE_CONSTANTS.exportOptionCurrent:
        return {
          ...baseFilter,
          pageSize: baseFilter.pageSize,
          pageIndex: baseFilter.pageIndex,
        };
      case BASE_CONSTANTS.exportOptionSelect:
        return {
          ...baseFilter,
          allowPaging: false,
          filters: [
            ...(baseFilter.filters || []),
            {
              filterName: BASE_CONSTANTS.id,
              filterValue: Array.from(this.selectedIds()).join(','),
              filterType: FilterType.guid,
              filterOperator: FilterOperator.contains,
            },
          ],
        };
    }
  }

  private downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;

    const timestamp = new Date().toISOString().slice(0, 10);
    const extension = this.getFileExtension(blob.type);
    anchor.download = `${this.fileName()}_${timestamp}${extension}`;

    document.body.appendChild(anchor);
    anchor.click();

    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  private getFileExtension(mimeType: string): string {
    //* mimeMap bảng tra cứu giúp quy đổi định dạng MIME type sang đuôi file (extension) tương ứng.
    const mimeMap: Record<string, string> = {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'application/vnd.ms-excel': '.xls',
      'text/csv': '.csv',
      'application/pdf': '.pdf',
      'application/json': '.json',
    };

    return mimeMap[mimeType] || '.xlsx';
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private animateProgress(target: number, status: string) {
    this.progressPercentage.set(target);
    this.progressStatus.set(status);
  }

  //#endregion

  //#region //@ METHODS

  handleExportOptionChange(option: ExportOption) {
    this.exportOption.set(option);
  }

  async handleConfirmExport() {
    const option = this.exportOption();
    if (option === BASE_CONSTANTS.exportOptionSelect && !this.canExportSelectItems()) return;

    this.isExporting.set(true);
    this.showProgress.set(true);
    this.animateProgress(0, 'common.generatingExportFile');

    try {
      const filter = this.buildExportFilter(option);
      this.animateProgress(10, 'common.buildingRequest');
      await this.delay(300);

      this.animateProgress(30, 'common.requestingData');
      await this.delay(200);
      const blob = await this.exportFn()!(filter);
      this.animateProgress(80, 'common.processingFile');
      await this.delay(400);

      if (!blob || blob.size === 0) {
        this.animateProgress(0, 'common.exportFailed');
        await this.delay(3000);
      } else {
        this.downloadBlob(blob);
        this.animateProgress(100, 'common.exportCompleted');
        await this.delay(500);
      }
    } catch {
      this.animateProgress(0, 'common.exportFailed');
      await this.delay(3000);
    } finally {
      this.isExporting.set(false);
      this.showProgress.set(false);
      this.baseService.closeModal();
    }
  }

  //#endregion
}
