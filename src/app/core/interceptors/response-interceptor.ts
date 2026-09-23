import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { showToast } from '../../shared/components/toast/toast.util';
import { Result } from '../models/common.model';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        if (req.method == 'GET') return;

        if (!isApiResponse(event.body)) return;

        if (event.body.result !== null) return;

        if (event.body.isSuccess && event.body.message)
          showToast({
            message: event.body.message,
            type: 'success',
          });

        if (!event.body.isSuccess && event.body.message)
          showToast({
            message: event.body.message,
            type: 'danger',
          });
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const errorMsg = error.error?.message || 'Có lỗi kết nối máy chủ!';
      showToast({
        message: errorMsg,
        type: 'danger',
      });

      return throwError(() => error);
    }),
  );

  function isApiResponse(body: any): body is Result<any> {
    return body && typeof body === 'object' && 'isSuccess' in body;
  }
};
