import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './pages/auth/auth-layout.component';
import { publicGuard } from '../auth/services/auth/auth.guard';

export const publicRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login-page.component').then(
            (m) => m.LoginPageComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register-page.component').then(
            (m) => m.RegisterPageComponent
          ),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./pages/auth/verify-email-page.component').then(
            (m) => m.VerifyEmailPageComponent
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/auth/forgot-password-page.component').then(
            (m) => m.ForgotPasswordPageComponent
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/auth/reset-password-page.component').then(
            (m) => m.ResetPasswordPageComponent
          ),
      },
    ],
  },
];
