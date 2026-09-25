import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const returnUrl = route.queryParams['returnUrl'] || '/';
    return router.createUrlTree([returnUrl]);
  }

  return true;
};
