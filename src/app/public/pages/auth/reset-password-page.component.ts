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
    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h1 class="text-xl font-bold text-gray-900 mb-1">Reset password</h1>
      <p class="text-sm text-gray-500 mb-6">Enter your reset token and a new password</p>

      @if (success()) {
        <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-800 font-medium">Password reset successfully!</p>
          <a routerLink="/login" class="inline-block mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium">Sign in</a>
        </div>
      } @else {
        @if (error(); as err) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{{ err }}</div>
        }
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="token" class="block text-sm font-medium text-gray-700 mb-1">Reset token</label>
            <input id="token" type="text" [(ngModel)]="form.token" name="token" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Paste token here" [disabled]="loading()" />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input id="password" type="password" [(ngModel)]="form.password" name="password" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              [disabled]="loading()" />
          </div>
          <div>
            <label for="confirm" class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input id="confirm" type="password" [(ngModel)]="form.confirm" name="confirm" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              [disabled]="loading()" />
          </div>
          <button type="submit" [disabled]="loading() || !form.token.trim() || !form.password || !form.confirm"
            class="w-full px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            @if (loading()) { Resetting... } @else { Reset password }
          </button>
        </form>
        <p class="mt-6 text-center text-sm text-gray-500">
          <a routerLink="/login" class="text-indigo-600 hover:text-indigo-800 font-medium">Back to sign in</a>
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
