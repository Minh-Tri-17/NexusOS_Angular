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
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/ui/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'country',
        loadComponent: () =>
          import('./features/categories/country/ui/country').then((m) => m.Country),
      },
      {
        path: 'province',
        loadComponent: () =>
          import('./features/categories/province/ui/province').then((m) => m.Province),
      },
      {
        path: 'ward',
        loadComponent: () => import('./features/categories/ward/ui/ward').then((m) => m.Ward),
      },
      {
        path: 'department',
        loadComponent: () =>
          import('./features/categories/department/ui/department').then((m) => m.Department),
      },
      {
        path: 'job-title',
        loadComponent: () =>
          import('./features/categories/job-title/ui/job-title').then((m) => m.JobTitle),
      },
      {
        path: 'leave-type',
        loadComponent: () =>
          import('./features/categories/leave-type/ui/leave-type').then((m) => m.LeaveType),
      },
      {
        path: 'contract-type',
        loadComponent: () =>
          import('./features/categories/contract-type/ui/contract-type').then(
            (m) => m.ContractType,
          ),
      },
      {
        path: 'employee',
        loadComponent: () => import('./features/employee/ui/employee').then((m) => m.Employee),
      },
      {
        path: 'contract',
        loadComponent: () => import('./features/contract/ui/contract').then((m) => m.Contract),
      },
      {
        path: 'role',
        loadComponent: () => import('./features/system/roles/ui/role').then((m) => m.Role),
      },
      {
        path: 'user',
        loadComponent: () => import('./features/system/users/ui/user').then((m) => m.User),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
