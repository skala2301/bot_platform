import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserOut, RegisterRequest } from '../../interfaces/auth/user.interface';
import { TokenResponse } from '../../interfaces/auth/token.interface';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api/v1';

  register(data: RegisterRequest): Promise<UserOut> {
    return firstValueFrom(
      this.http.post<UserOut>(`${this.baseUrl}/auth/register`, data)
    );
  }

  verifyEmail(token: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.baseUrl}/auth/verify-email`,
        { token }
      )
    );
  }

  login(email: string, password: string): Promise<TokenResponse> {
    const body = new HttpParams()
      .set('username', email)
      .set('password', password);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    return firstValueFrom(
      this.http.post<TokenResponse>(
        `${this.baseUrl}/auth/login`,
        body.toString(),
        { headers }
      )
    );
  }

  refresh(refreshToken: string): Promise<TokenResponse> {
    return firstValueFrom(
      this.http.post<TokenResponse>(
        `${this.baseUrl}/auth/refresh`,
        { refresh_token: refreshToken }
      )
    );
  }

  logout(refreshToken: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.baseUrl}/auth/logout`,
        { refresh_token: refreshToken }
      )
    );
  }

  forgotPassword(email: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.baseUrl}/auth/forgot-password`,
        { email }
      )
    );
  }

  resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.baseUrl}/auth/reset-password`,
        { token, new_password: newPassword }
      )
    );
  }

  getMe(): Promise<UserOut> {
    return firstValueFrom(
      this.http.get<UserOut>(`${this.baseUrl}/auth/me`)
    );
  }
}
