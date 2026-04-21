import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthApiService } from '../../../auth/services/auth/auth-api.service';
import { RegisterForm } from '../../../auth/interfaces/auth/user.interface';
import { httpErrorStatus } from '../../../shared/utils/http-error';

@Component({
  selector: 'app-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  private readonly authApi = inject(AuthApiService);

  protected readonly form: RegisterForm = {
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  };

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<boolean>(false);

  async onSubmit(): Promise<void> {
    if (
      this.form.email.trim().length === 0 ||
      this.form.password.length === 0 ||
      this.form.first_name.trim().length === 0 ||
      this.form.last_name.trim().length === 0
    ) {
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authApi.register({
        email: this.form.email.trim(),
        password: this.form.password,
        first_name: this.form.first_name.trim(),
        last_name: this.form.last_name.trim(),
      });
      this.success.set(true);
    } catch (e: unknown) {
      const status: number | null = httpErrorStatus(e);
      if (status === 409) {
        this.error.set('An account with this email already exists.');
      } else {
        this.error.set('Registration failed. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
