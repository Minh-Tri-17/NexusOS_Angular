import { Component, computed, input, signal } from '@angular/core';
import { Modal } from '../modal/modal';
import { BASE_CONSTANTS } from '../../../core/constants/base.constant';
import { PagingRequest } from '../../../core/models/paging.model';
import { FilterOperator, FilterType } from '../../../core/constants/filter.enum';

export type ExportOption =
  | typeof BASE_CONSTANTS.exportOptionAll
  | typeof BASE_CONSTANTS.exportOptionCurrent
  | typeof BASE_CONSTANTS.exportOptionSelect;

@Component({
  selector: 'app-export',
  imports: [Modal],
  templateUrl: './export.html',
  styleUrl: './export.scss',
})
export class Export {
  //#region //@ PROPS

  exportFn = input.required<(filter: PagingRequest) => Promise<Blob>>();
  fileName = input<string>('export');
  currentFilter = input<PagingRequest>();
  totalRecord = input<number>(0);
  selectedIds = input<Set<string>>(new Set());

  //#endregion

  //#region //@ STATE

  exportOption = signal<ExportOption>(BASE_CONSTANTS.exportOptionAll);
  isExporting = signal<boolean>(false);
  showProgress = signal<boolean>(false);
  progressStatus = signal<string>('');
  progressPercentage = signal<number>(0);
  //* computed() dùng để tính toán giá trị dựa trên state khác
  canExportSelectItems = computed(() => this.selectedIds().size > 0);
  canExportAllPage = computed(() => this.totalRecord() > 0);

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
              filterType: FilterType.Guid,
              filterOperator: FilterOperator.Contains,
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

  private closeModal() {
    const modalEl = document.getElementById('exportModal');
    if (modalEl) {
      const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
      bootstrapModal?.hide();
    }
  }

  //#endregion

  //#region //@ METHODS

  handleExportOptionChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) this.exportOption.set(target.value as ExportOption);
  }

  async handleConfirmExport() {
    const option = this.exportOption();
    if (option === BASE_CONSTANTS.exportOptionSelect && this.selectedIds().size === 0) return;

    this.isExporting.set(true);
    this.showProgress.set(true);
    this.animateProgress(0, 'Generating export file...');

    try {
      const filter = this.buildExportFilter(option);
      this.animateProgress(10, 'Building request...');
      await this.delay(300);

      this.animateProgress(30, 'Requesting data...');
      await this.delay(200);
      const blob = await this.exportFn()(filter);
      this.animateProgress(80, 'Processing file...');
      await this.delay(400);

      if (!blob || blob.size === 0) {
        this.animateProgress(0, 'Export failed. Please try again.');
        await this.delay(3000);
      } else {
        this.downloadBlob(blob);
        this.animateProgress(100, 'Export completed!');
        await this.delay(500);
      }
    } catch (error) {
      this.animateProgress(0, 'Export failed. Please try again.');
      await this.delay(3000);
    } finally {
      this.isExporting.set(false);
      this.showProgress.set(false);
      this.closeModal();
    }
  }

  //#endregion
}
