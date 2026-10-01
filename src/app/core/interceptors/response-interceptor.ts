import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { showToast } from '../../shared/components/toast/toast.util';
import { Result } from '../models/common.model';
import { TranslateService } from '@ngx-translate/core';
import { inject } from '@angular/core';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const translateService = inject(TranslateService);

  if (req.url.includes('/i18n/') || req.url.endsWith('.json')) return next(req);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        if (req.method == 'GET') return;

        if (!isApiResponse(event.body)) return;

        if (event.body.result !== null && typeof event.body.result !== 'boolean') return;

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
      if (error.error?.message) {
        showToast({
          message: error.error.message,
          type: 'danger',
        });
      } else {
        translateService.get('common.errorOccurred').subscribe((translatedMsg: string) => {
          showToast({
            message: translatedMsg,
            type: 'danger',
          });
        });
      }

      return throwError(() => error);
    }),
  );

  function isApiResponse(body: any): body is Result<any> {
    return body && typeof body === 'object' && 'isSuccess' in body;
  }
};
