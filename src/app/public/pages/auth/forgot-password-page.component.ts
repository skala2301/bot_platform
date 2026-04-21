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
  selector: 'app-forgot-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h1 class="text-xl font-bold text-slate-900 mb-1">Forgot password</h1>
      <p class="text-sm text-slate-500 mb-6">Enter your email to receive a reset link</p>

      @if (success()) {
        <div class="p-4 bg-success-tint border border-success/40 rounded-lg">
          <p class="text-sm text-success-dark">If the email exists, a reset link has been sent. Check your email or backend console.</p>
          <a routerLink="/reset-password" class="inline-block mt-3 text-sm text-brand-secondary hover:underline font-medium">Reset password</a>
        </div>
      } @else {
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="email" type="email"
              [ngModel]="email()" (ngModelChange)="email.set($event)"
              name="email" required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none"
              placeholder="you@example.com" [disabled]="loading()"
            />
          </div>
          <button type="submit" [disabled]="loading() || !email().trim()"
            class="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            @if (loading()) { Sending... } @else { Send reset link }
          </button>
        </form>
        <p class="mt-6 text-center text-sm text-slate-500">
          <a routerLink="/login" class="text-brand-secondary hover:underline font-medium">Back to sign in</a>
        </p>
      }
    </div>
  `,
})
export class ForgotPasswordPageComponent {
  private readonly authApi = inject(AuthApiService);
  protected readonly email = signal<string>('');
  protected readonly loading = signal<boolean>(false);
  protected readonly success = signal<boolean>(false);

  async onSubmit(): Promise<void> {
    if (this.email().trim().length === 0) return;
    this.loading.set(true);
    try {
      await this.authApi.forgotPassword(this.email().trim());
    } catch {
      // Always show success to avoid email enumeration.
    }
    this.success.set(true);
    this.loading.set(false);
  }
}
