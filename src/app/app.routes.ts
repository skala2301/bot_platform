import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'bots', pathMatch: 'full' },
  {
    path: '',
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
