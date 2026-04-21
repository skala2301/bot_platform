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
  selector: 'app-verify-email-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h1 class="text-xl font-bold text-slate-900 mb-1">Verify email</h1>
      <p class="text-sm text-slate-500 mb-6">Enter the verification token from your email (or backend console)</p>

      @if (success()) {
        <div class="p-4 bg-success-tint border border-success/40 rounded-lg">
          <p class="text-sm text-success-dark font-medium">Email verified successfully!</p>
          <a routerLink="/login" class="inline-block mt-3 text-sm text-brand-secondary hover:underline font-medium">Sign in</a>
        </div>
      } @else {
        @if (error(); as err) {
          <div class="mb-4 p-3 bg-danger-tint border border-danger/40 text-danger-dark rounded-lg text-sm">{{ err }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="token" class="block text-sm font-medium text-slate-700 mb-1">Verification token</label>
            <input
              id="token"
              type="text"
              [ngModel]="token()"
              (ngModelChange)="token.set($event)"
              name="token"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none"
              placeholder="Paste token here"
              [disabled]="loading()"
            />
          </div>
          <button
            type="submit"
            [disabled]="loading() || !token().trim()"
            class="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            @if (loading()) { Verifying... } @else { Verify }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-500">
          <a routerLink="/login" class="text-brand-secondary hover:underline font-medium">Back to sign in</a>
        </p>
      }
    </div>
  `,
})
export class VerifyEmailPageComponent {
  private readonly authApi = inject(AuthApiService);

  protected readonly token = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);

  async onSubmit(): Promise<void> {
    if (!this.token().trim()) return;
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authApi.verifyEmail(this.token().trim());
      this.success.set(true);
    } catch {
      this.error.set('Invalid or expired verification token.');
    } finally {
      this.loading.set(false);
    }
  }
}
