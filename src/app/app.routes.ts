import { Routes } from '@angular/router';
import { PERMISSIONS } from './core/constants/permission.constant';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { permissionGuard } from './core/guards/permission-guard';
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
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.country.view },
        loadComponent: () =>
          import('./features/categories/country/ui/country').then((m) => m.Country),
      },
      {
        path: 'province',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.province.view },
        loadComponent: () =>
          import('./features/categories/province/ui/province').then((m) => m.Province),
      },
      {
        path: 'ward',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.ward.view },
        loadComponent: () => import('./features/categories/ward/ui/ward').then((m) => m.Ward),
      },
      {
        path: 'department',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.department.view },
        loadComponent: () =>
          import('./features/categories/department/ui/department').then((m) => m.Department),
      },
      {
        path: 'job-title',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.jobTitle.view },
        loadComponent: () =>
          import('./features/categories/job-title/ui/job-title').then((m) => m.JobTitle),
      },
      {
        path: 'leave-type',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.leaveType.view },
        loadComponent: () =>
          import('./features/categories/leave-type/ui/leave-type').then((m) => m.LeaveType),
      },
      {
        path: 'contract-type',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.contractType.view },
        loadComponent: () =>
          import('./features/categories/contract-type/ui/contract-type').then(
            (m) => m.ContractType,
          ),
      },
      {
        path: 'employee',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.employee.view },
        loadComponent: () => import('./features/employee/ui/employee').then((m) => m.Employee),
      },
      {
        path: 'contract',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.contract.view },
        loadComponent: () => import('./features/contract/ui/contract').then((m) => m.Contract),
      },
      {
        path: 'role',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.role.view },
        loadComponent: () => import('./features/system/roles/ui/role').then((m) => m.Role),
      },
      {
        path: 'user',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.user.view },
        loadComponent: () => import('./features/system/users/ui/user').then((m) => m.User),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
