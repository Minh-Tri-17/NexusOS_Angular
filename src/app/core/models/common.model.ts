export interface Result<T> {
  isSuccess: boolean;
  message?: string;
  result?: T;
}
