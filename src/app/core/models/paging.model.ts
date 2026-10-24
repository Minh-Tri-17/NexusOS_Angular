import { FilterOperator, FilterType } from '../constants/filter.enum';

export interface PagingRequest {
  idMain?: string | null;
  allowPaging?: boolean | null;
  isExport?: boolean | null;
  pageSize?: number | null;
  pageIndex?: number | null;
  filters?: PagingRequestItem[] | null;
}

export interface PagingRequestItem {
  filterName?: string | null;
  filterValue?: string | null;
  filterType?: FilterType | null;
  filterOperator?: FilterOperator | null;
}

export interface PagingResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;

  totalRecord: number;
  fromRecord: number;
  toRecord: number;
  recordRange: string;
  pageCount: number;
}
