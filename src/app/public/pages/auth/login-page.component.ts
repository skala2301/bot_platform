import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthApiService } from '../../../auth/services/auth/auth-api.service';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { TokenResponse } from '../../../auth/interfaces/auth/token.interface';
import { UserOut } from '../../../auth/interfaces/auth/user.interface';
import { httpErrorStatus } from '../../../shared/utils/http-error';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly email = signal<string>('');
  protected readonly password = signal<string>('');
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (this.email().trim().length === 0 || this.password().length === 0) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const tokens: TokenResponse = await this.authApi.login(
        this.email().trim(),
        this.password()
      );
      // Store tokens FIRST so the interceptor can attach the Bearer header to /auth/me
      this.authService.updateTokens(tokens);
      const user: UserOut = await this.authApi.getMe();
      this.authService.setSession(tokens, user);

      const redirect: string | null = this.route.snapshot.queryParamMap.get('redirect');
      this.router.navigateByUrl(redirect ?? '/bots');
    } catch (e: unknown) {
      // Clear any partial session state (e.g. tokens set before /auth/me failed)
      this.authService.clearSession();
      const status: number | null = httpErrorStatus(e);
      if (status === 401) {
        this.error.set('Invalid email or password.');
      } else if (status === 403) {
        this.error.set('Account is not active. Please verify your email.');
      } else {
        this.error.set('Something went wrong. Please try again.');
      }
      this.loading.set(false);
    }
  }
}
