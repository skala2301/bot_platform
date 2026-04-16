import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, lastValueFrom, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AuthApiService } from './auth-api.service';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/widget/',
  '/health',
];

let refreshPromise: Promise<void> | null = null;

function isPublicRequest(url: string): boolean {
  return PUBLIC_PATHS.some((path) => url.includes(path));
}

function isRefreshRequest(url: string): boolean {
  return url.includes('/auth/refresh');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  if (isPublicRequest(req.url) || isRefreshRequest(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !authService.getRefreshToken()) {
        return throwError(() => error);
      }

      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const newTokens = await authApi.refresh(authService.getRefreshToken()!);
            authService.updateTokens(newTokens);
          } catch {
            authService.clearSession();
            router.navigate(['/login']);
            throw error;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      return from(refreshPromise).pipe(
        switchMap(() => {
          const newToken = authService.getAccessToken();
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(retryReq);
        }),
        catchError(() => {
          return throwError(() => error);
        })
      );
    })
  );
};
