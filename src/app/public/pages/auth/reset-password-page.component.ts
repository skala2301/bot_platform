import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthApiService } from '../../../auth/services/auth/auth-api.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h1 class="text-xl font-bold text-slate-900 mb-1">Reset password</h1>
      <p class="text-sm text-slate-500 mb-6">Enter your reset token and a new password</p>

      @if (success()) {
        <div class="p-4 bg-success-tint border border-success/40 rounded-lg">
          <p class="text-sm text-success-dark font-medium">Password reset successfully!</p>
          <a routerLink="/login" class="inline-block mt-3 text-sm text-brand-secondary hover:underline font-medium">Sign in</a>
        </div>
      } @else {
        @if (error(); as err) {
          <div class="mb-4 p-3 bg-danger-tint border border-danger/40 text-danger-dark rounded-lg text-sm">{{ err }}</div>
        }
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="token" class="block text-sm font-medium text-slate-700 mb-1">Reset token</label>
            <input id="token" type="text" [(ngModel)]="form.token" name="token" required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none"
              placeholder="Paste token here" [disabled]="loading()" />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">New password</label>
            <input id="password" type="password" [(ngModel)]="form.password" name="password" required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none"
              [disabled]="loading()" />
          </div>
          <div>
            <label for="confirm" class="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
            <input id="confirm" type="password" [(ngModel)]="form.confirm" name="confirm" required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none"
              [disabled]="loading()" />
          </div>
          <button type="submit" [disabled]="loading() || !form.token.trim() || !form.password || !form.confirm"
            class="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            @if (loading()) { Resetting... } @else { Reset password }
          </button>
        </form>
        <p class="mt-6 text-center text-sm text-slate-500">
          <a routerLink="/login" class="text-brand-secondary hover:underline font-medium">Back to sign in</a>
        </p>
      }
    </div>
  `,
})
export class ResetPasswordPageComponent {
  private readonly authApi = inject(AuthApiService);
  protected readonly form = { token: '', password: '', confirm: '' };
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);

  async onSubmit(): Promise<void> {
    if (this.form.password !== this.form.confirm) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authApi.resetPassword(this.form.token.trim(), this.form.password);
      this.success.set(true);
    } catch {
      this.error.set('Invalid or expired reset token.');
    } finally {
      this.loading.set(false);
    }
  }
}
