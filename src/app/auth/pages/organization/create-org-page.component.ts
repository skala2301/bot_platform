import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { OrgApiService } from '../../services/org/org-api.service';

@Component({
  selector: 'app-create-org-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto mt-12">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Create Organization</h1>
        <p class="text-sm text-slate-500 mt-1">Set up your organization to start building bots</p>
      </div>

      @if (error(); as err) {
        <div class="mb-4 p-3 bg-danger-tint border border-danger/40 text-danger-dark rounded-lg text-sm">{{ err }}</div>
      }

      <form (ngSubmit)="onSubmit()" class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input
            id="name" type="text" [(ngModel)]="form.name" name="name" required maxlength="255"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none"
            placeholder="e.g. Acme Corp" [disabled]="saving()" />
        </div>
        <div>
          <label for="label" class="block text-sm font-medium text-slate-700 mb-1">Label</label>
          <input
            id="label" type="text" [(ngModel)]="form.label" name="label"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none"
            placeholder="e.g. Acme Corporation" [disabled]="saving()" />
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          @if (authService.orgs().length > 0) {
            <a routerLink="/bots" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</a>
          }
          <button type="submit" [disabled]="saving() || !form.name.trim()"
            class="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            @if (saving()) { Creating... } @else { Create Organization }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CreateOrgPageComponent {
  private readonly orgApi = inject(OrgApiService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = { name: '', label: '' };
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (!this.form.name.trim()) return;
    this.saving.set(true);
    this.error.set(null);

    try {
      const org = await this.orgApi.createOrg({
        name: this.form.name.trim(),
        label: this.form.label.trim() || undefined,
      });
      if (this.destroyRef.destroyed) return;

      const orgs = await this.orgApi.listOrgs();
      if (this.destroyRef.destroyed) return;
      this.authService.setOrgs(orgs);
      this.authService.setCurrentOrg(org);
      this.router.navigate(['/bots']);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to create organization.');
      this.saving.set(false);
    }
  }
}
