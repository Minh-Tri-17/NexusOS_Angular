export interface Result<T> {
  isSuccess: boolean;
  message?: string | null;
  result?: T | null;
}

export * from './enum.model';
