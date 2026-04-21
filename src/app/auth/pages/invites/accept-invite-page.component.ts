import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { OrgApiService } from '../../services/org/org-api.service';
import { InviteApiService } from '../../services/org/invite-api.service';
import { OrgOut } from '../../interfaces/org/org.interface';
import { httpErrorDetail } from '../../../shared/utils/http-error';

@Component({
  selector: 'app-accept-invite-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="max-w-md mx-auto mt-12">
      <div class="bg-white rounded-lg border border-slate-200 p-6 text-center">
        @if (loading()) {
          <div class="py-8">
            <div class="w-8 h-8 border-4 border-info-tint border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-sm text-slate-500">Accepting invite...</p>
          </div>
        } @else if (success()) {
          <div class="py-4">
            <svg class="w-12 h-12 text-success mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-lg font-semibold text-slate-900 mb-2">Invite accepted!</p>
            <p class="text-sm text-slate-500 mb-4">You are now a member of the organization.</p>
            <a routerLink="/bots" class="text-sm text-brand-secondary hover:underline font-medium">Go to bots</a>
          </div>
        } @else {
          <div class="py-4">
            <svg class="w-12 h-12 text-danger-dark mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p class="text-lg font-semibold text-slate-900 mb-2">Could not accept invite</p>
            <p class="text-sm text-danger-dark mb-4">{{ error() }}</p>
            <a routerLink="/bots" class="text-sm text-brand-secondary hover:underline font-medium">Go to bots</a>
          </div>
        }
      </div>
    </div>
  `,
})
export class AcceptInvitePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly orgApi = inject(OrgApiService);
  private readonly inviteApi = inject(InviteApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal<boolean>(true);
  protected readonly success = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const token: string | null = this.route.snapshot.queryParamMap.get('token');
    const orgUid: string | null = this.route.snapshot.queryParamMap.get('org');

    if (token === null || orgUid === null) {
      this.error.set('Missing invite token or organization.');
      this.loading.set(false);
      return;
    }

    this.acceptInvite(orgUid, token);
  }

  private async acceptInvite(orgUid: string, token: string): Promise<void> {
    try {
      await this.inviteApi.acceptInvite(orgUid, token);
      if (this.destroyRef.destroyed) return;

      const orgs: OrgOut[] = await this.orgApi.listOrgs();
      if (this.destroyRef.destroyed) return;
      this.authService.setOrgs(orgs);

      const newOrg: OrgOut | undefined = orgs.find(
        (o: OrgOut): boolean => o.uid === orgUid
      );
      if (newOrg) this.authService.setCurrentOrg(newOrg);

      this.success.set(true);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const detail: string | null = httpErrorDetail(e);
      this.error.set(detail ?? 'Failed to accept invite.');
    } finally {
      this.loading.set(false);
    }
  }
}
