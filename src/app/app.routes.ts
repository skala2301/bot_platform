import { Routes } from '@angular/router';
import { authGuard } from './auth/services/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'bots', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () =>
      import('./public/public.routes').then((m) => m.publicRoutes),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'chat/:botUid',
    loadComponent: () =>
      import('./public/pages/public-chat-page.component').then(
        (m) => m.PublicChatPageComponent
      ),
  },
];
