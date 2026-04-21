import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarLayoutComponent } from '../shared/components/sidebar-layout.component';
import { AuthService } from './services/auth/auth.service';
import { OrgApiService } from './services/org/org-api.service';
import { OrgOut } from './interfaces/org/org.interface';

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
export class AuthShellComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly orgApi = inject(OrgApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadOrgs();
  }

  private async loadOrgs(): Promise<void> {
    try {
      const orgs: OrgOut[] = await this.orgApi.listOrgs();
      if (this.destroyRef.destroyed) return;
      this.authService.setOrgs(orgs);

      // If the persisted currentOrg is no longer in the user's list, clear it
      const current: OrgOut | null = this.authService.currentOrg();
      if (current && !orgs.some((o: OrgOut): boolean => o.uid === current.uid)) {
        if (orgs.length > 0) {
          this.authService.setCurrentOrg(orgs[0]);
        } else {
          this.authService.clearCurrentOrg();
        }
      } else if (current === null && orgs.length > 0) {
        this.authService.setCurrentOrg(orgs[0]);
      }

      if (orgs.length === 0 && !this.router.url.includes('/organization/create')) {
        this.router.navigate(['/organization/create']);
      }
    } catch {
      if (this.destroyRef.destroyed) return;
      // Mark orgs as loaded (empty) so downstream pages stop spinning
      this.authService.setOrgs([]);
    }
  }
}
