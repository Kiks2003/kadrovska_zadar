import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'radnici',
        loadComponent: () => import('./components/radnici/radnici-list/radnici-list.component').then(m => m.RadniciListComponent)
      },
      {
        path: 'radnici/novi',
        loadComponent: () => import('./components/radnici/radnik-unos/radnik-unos.component').then(m => m.RadnikUnosComponent)
      },
      {
        path: 'radnici/:id',
        loadComponent: () => import('./components/radnici/radnik-profil/radnik-profil.component').then(m => m.RadnikProfilComponent)
      },
      {
        path: 'radnici/:id/uredi',
        loadComponent: () => import('./components/radnici/radnik-unos/radnik-unos.component').then(m => m.RadnikUnosComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
