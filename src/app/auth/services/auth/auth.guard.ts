import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url },
  });
};

export const publicGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/bots']);
  }

  return true;
};
