import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { MainLayout } from './shared/layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth').then((m) => m.Auth),
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/ui/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'country',
        loadComponent: () =>
          import('./features/categories/country/ui/country').then((m) => m.Country),
      },
    ],
  },
];
