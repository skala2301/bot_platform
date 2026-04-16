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
    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h1 class="text-xl font-bold text-gray-900 mb-1">Verify email</h1>
      <p class="text-sm text-gray-500 mb-6">Enter the verification token from your email (or backend console)</p>

      @if (success()) {
        <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-800 font-medium">Email verified successfully!</p>
          <a routerLink="/login" class="inline-block mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium">Sign in</a>
        </div>
      } @else {
        @if (error(); as err) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{{ err }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="token" class="block text-sm font-medium text-gray-700 mb-1">Verification token</label>
            <input
              id="token"
              type="text"
              [ngModel]="token()"
              (ngModelChange)="token.set($event)"
              name="token"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Paste token here"
              [disabled]="loading()"
            />
          </div>
          <button
            type="submit"
            [disabled]="loading() || !token().trim()"
            class="w-full px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            @if (loading()) { Verifying... } @else { Verify }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          <a routerLink="/login" class="text-indigo-600 hover:text-indigo-800 font-medium">Back to sign in</a>
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
