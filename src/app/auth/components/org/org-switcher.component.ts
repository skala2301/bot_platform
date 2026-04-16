import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { OrgOut } from '../../interfaces/org/org.interface';

@Component({
  selector: 'app-org-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe],
  templateUrl: './org-switcher.component.html',
})
export class OrgSwitcherComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly orgs = this.authService.orgs;
  protected readonly currentOrg = this.authService.currentOrg;
  protected readonly open = signal(false);

  selectOrg(org: OrgOut): void {
    this.authService.setCurrentOrg(org);
    this.open.set(false);
    this.router.navigate(['/bots']);
  }

  createOrg(): void {
    this.open.set(false);
    this.router.navigate(['/organization/create']);
  }

  toggle(): void {
    this.open.update((v) => !v);
  }
}
