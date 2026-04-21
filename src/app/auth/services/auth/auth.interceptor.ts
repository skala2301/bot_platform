import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AuthApiService } from './auth-api.service';
import { TokenResponse } from '../../interfaces/auth/token.interface';

const PUBLIC_PATHS: ReadonlyArray<string> = [
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
  return PUBLIC_PATHS.some((path: string): boolean => url.includes(path));
}

function isRefreshRequest(url: string): boolean {
  return url.includes('/auth/refresh');
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService: AuthService = inject(AuthService);
  const authApi: AuthApiService = inject(AuthApiService);
  const router: Router = inject(Router);

  if (isPublicRequest(req.url) || isRefreshRequest(req.url)) {
    return next(req);
  }

  const token: string | null = authService.getAccessToken();
  const authedReq: HttpRequest<unknown> = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
      if (error.status !== 401 || authService.getRefreshToken() === null) {
        return throwError((): HttpErrorResponse => error);
      }

      if (refreshPromise === null) {
        refreshPromise = (async (): Promise<void> => {
          try {
            const newTokens: TokenResponse = await authApi.refresh(
              authService.getRefreshToken()!
            );
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
        switchMap((): Observable<HttpEvent<unknown>> => {
          const newToken: string | null = authService.getAccessToken();
          const retryReq: HttpRequest<unknown> = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken ?? ''}` },
          });
          return next(retryReq);
        }),
        catchError((): Observable<HttpEvent<unknown>> => throwError((): HttpErrorResponse => error))
      );
    })
  );
};
