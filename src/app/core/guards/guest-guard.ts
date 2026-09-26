import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) return true;

  //* route.queryParams: Đọc param từ trang hiện tại vì user đã đứng ở route Login
  return router.createUrlTree([route.queryParams['returnUrl'] || '/']);
};
