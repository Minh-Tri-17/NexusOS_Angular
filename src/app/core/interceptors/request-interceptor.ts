import { HttpInterceptorFn } from '@angular/common/http';
import { inject, isSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  const translateService = inject(TranslateService);

  const rawLang = translateService.currentLang ?? translateService.fallbackLang ?? 'en';

  const currentLang: string = (isSignal(rawLang) ? rawLang() : rawLang) || 'en';

  const clonedReq = req.clone({
    setHeaders: {
      'Accept-Language': currentLang,
    },
  });

  return next(clonedReq);
};
