import { FilterOperator, FilterType } from "../constants/filter.enum";

export interface PagingRequest {
  idMain?: string;
  allowPaging?: boolean;
  pageSize?: number;
  pageIndex?: number;
  filters?: PagingRequestItem[];
}

export interface PagingRequestItem {
  filterName?: string;
  filterValue?: string;
  filterType?: FilterType;
  filterOperator?: FilterOperator;
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
