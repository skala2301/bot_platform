import { Routes } from '@angular/router';
import { AuthShellComponent } from './auth-shell.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthShellComponent,
    children: [
      { path: '', redirectTo: 'bots', pathMatch: 'full' },

      // Bots
      {
        path: 'bots',
        loadComponent: () =>
          import('./pages/bots/bot-list-page.component').then(
            (m) => m.BotListPageComponent
          ),
      },
      {
        path: 'bots/create',
        loadComponent: () =>
          import('./pages/bots/bot-create-page.component').then(
            (m) => m.BotCreatePageComponent
          ),
      },
      {
        path: 'bots/:botUid/edit',
        loadComponent: () =>
          import('./pages/bots/bot-edit-page.component').then(
            (m) => m.BotEditPageComponent
          ),
      },
      {
        path: 'bots/:botUid/chat',
        loadComponent: () =>
          import('./pages/bots/bot-chat-page.component').then(
            (m) => m.BotChatPageComponent
          ),
      },

      // Organization
      {
        path: 'organization',
        loadComponent: () =>
          import('./pages/organization/organization-page.component').then(
            (m) => m.OrganizationPageComponent
          ),
      },

      // Profile
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile-page.component').then(
            (m) => m.ProfilePageComponent
          ),
      },
    ],
  },
];
