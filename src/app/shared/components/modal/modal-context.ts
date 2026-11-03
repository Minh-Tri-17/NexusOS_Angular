import { InjectionToken } from '@angular/core';
import { PagingRequest } from '../../../core/models/paging.model';

//* NgbModal v21 đã bỏ `componentProps`, nên dữ liệu được cấp qua Injector
export interface ImportModalContext {
  importFn: (file: File) => Promise<{ isSuccess: boolean }>;
  onSuccess?: () => void;
}

export interface ExportModalContext {
  exportFn: (filter: PagingRequest) => Promise<Blob>;
  currentFilter: PagingRequest;
  totalRecord: number;
  fromRecord: number;
  toRecord: number;
  selectedIds: Set<string>;
  fileName: string;
}

export const IMPORT_MODAL_CONTEXT = new InjectionToken<ImportModalContext>('IMPORT_MODAL_CONTEXT');
export const EXPORT_MODAL_CONTEXT = new InjectionToken<ExportModalContext>('EXPORT_MODAL_CONTEXT');
