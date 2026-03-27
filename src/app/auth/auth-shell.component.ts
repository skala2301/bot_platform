import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarLayoutComponent } from '../shared/components/sidebar-layout.component';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarLayoutComponent],
  template: `
    <app-sidebar-layout>
      <router-outlet />
    </app-sidebar-layout>
  `,
})
export class AuthShellComponent {}
