import { HttpInterceptorFn } from '@angular/common/http';
import { inject, untracked } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  const translateService = inject(TranslateService);

  //* untracked() đọc giá trị Signal mà không đăng ký theo dõi,
  //* tránh kích hoạt lại effect() làm gọi trùng API khi ngôn ngữ thay đổi
  const currentLang = untracked(
    () => translateService.getCurrentLang() || translateService.getFallbackLang() || 'en',
  );

  const clonedReq = req.clone({
    setHeaders: {
      'Accept-Language': currentLang,
    },
  });

  return next(clonedReq);
};
