import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
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
