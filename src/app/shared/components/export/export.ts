import { Component, computed, inject, input, signal } from '@angular/core';
import { BASE_CONSTANTS } from '../../../core/constants/base.constant';
import { EXPORT_MODAL_CONTEXT } from '../modal/modal-context';
import { FilterOperator, FilterType } from '../../../core/constants/filter.enum';
import { PagingRequest } from '../../../core/models/paging.model';
import { BaseService } from '../../../core/services/base.service';
import { Modal } from '../modal/modal';

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
  readonly BASE_CONSTANTS = BASE_CONSTANTS;
  private readonly baseService = inject(BaseService);

  //* NgbModal v21 không còn componentProps -> dữ liệu được cấp qua Injector khi open().
  private readonly ctx = inject(EXPORT_MODAL_CONTEXT, { optional: true });

  //#region //@ PROPS

  readonly exportFn = input<(filter: PagingRequest) => Promise<Blob>>();
  readonly fileName = input<string>('export');
  readonly currentFilter = input<PagingRequest>();
  readonly totalRecord = input<number>(0);
  readonly fromRecord = input<number>(0);
  readonly toRecord = input<number>(0);
  readonly selectedIds = input<Set<string>>(new Set());

  //#endregion

  //#region //@ STATE

  readonly exportOption = signal<ExportOption>(BASE_CONSTANTS.exportOptionAll);
  readonly isExporting = signal(false);
  readonly showProgress = signal(false);
  readonly progressStatus = signal('');
  readonly progressPercentage = signal(0);

  //* Ưu tiên dữ liệu truyền qua Injector (khi mở bằng NgbModal.open), fallback về input binding.
  private readonly resolvedExportFn = () => this.ctx?.exportFn ?? this.exportFn();
  private readonly resolvedCurrentFilter = () => this.ctx?.currentFilter ?? this.currentFilter();
  private readonly resolvedTotalRecord = () => this.ctx?.totalRecord ?? this.totalRecord();
  private readonly resolvedFromRecord = () => this.ctx?.fromRecord ?? this.fromRecord();
  private readonly resolvedToRecord = () => this.ctx?.toRecord ?? this.toRecord();
  private readonly resolvedSelectedIds = () => this.ctx?.selectedIds ?? this.selectedIds();
  private readonly resolvedFileName = () => this.ctx?.fileName ?? this.fileName();

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly canExportSelectItems = computed(() => this.resolvedSelectedIds().size > 0);
  readonly canExportAllPage = computed(() => this.resolvedTotalRecord() > 0);
  readonly totalPageRecord = computed(() => {
    const to = this.resolvedToRecord();
    const from = this.resolvedFromRecord();
    if (to === 0 || from === 0 || to < from) return 0;

    return to - from + 1;
  });

  //#endregion

  //#region //@ HELPERS

  private buildExportFilter(option: ExportOption) {
    const baseFilter = { ...this.resolvedCurrentFilter() };

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
    this.animateProgress(0, 'Generating export file...');

    try {
      const filter = this.buildExportFilter(option);
      this.animateProgress(10, 'Building request...');
      await this.delay(300);

      this.animateProgress(30, 'Requesting data...');
      await this.delay(200);
      const blob = await this.resolvedExportFn()!(filter);
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
    } catch {
      this.animateProgress(0, 'Export failed. Please try again.');
      await this.delay(3000);
    } finally {
      this.isExporting.set(false);
      this.showProgress.set(false);
      this.baseService.closeModal();
    }
  }

  //#endregion
}
