import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth/auth.service';
import { AuthApiService } from '../../auth/services/auth/auth-api.service';
import { OrgSwitcherComponent } from '../../auth/components/org/org-switcher.component';

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  route: string;
  svgPath: string;
}

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, OrgSwitcherComponent],
  templateUrl: './sidebar-layout.component.html',
  styleUrl: './sidebar-layout.component.css',
})
export class SidebarLayoutComponent {
  private readonly router = inject(Router);
  private readonly authApiService = inject(AuthApiService);
  protected readonly authService = inject(AuthService);

  protected readonly sidebarOpen = signal(false);

  protected readonly navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        {
          label: 'Bots',
          route: '/bots',
          svgPath: 'M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.47 4.306a2.25 2.25 0 0 1-2.133 1.527H8.603a2.25 2.25 0 0 1-2.134-1.527L5 14.5m14 0H5',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          label: 'Organization',
          route: '/organization',
          svgPath: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Profile',
          route: '/profile',
          svgPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
        },
      ],
    },
  ];

  async onLogout(): Promise<void> {
    const refreshToken = this.authService.getRefreshToken();
    if (refreshToken) {
      try { await this.authApiService.logout(refreshToken); } catch { /* ignore */ }
    }
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
