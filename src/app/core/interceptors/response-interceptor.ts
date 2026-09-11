import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { Result } from '../models/common.model';
import { showToast } from '../../shared/components/toast/toast.util';

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
  );

  function isApiResponse(body: any): body is Result<any> {
    return body && typeof body === 'object' && 'isSuccess' in body;
  }
};
