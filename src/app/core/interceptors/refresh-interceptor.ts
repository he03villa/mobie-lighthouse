import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, filter, finalize, from, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { NavigationService } from '../services/navigation';

const SKIP_AUTH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];
let isRefreshing = false;
let refreshTokenValue: string | null = null;

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (SKIP_AUTH_URLS.some(url => req.url.includes(url))) {
    return next(req);
  }

  const authService = inject(AuthService);
  const nav = inject(NavigationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return from(waitForRefresh()).pipe(
          filter((t): t is string => t !== null),
          take(1),
          switchMap(token => {
            const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
            return next(cloned);
          }),
          catchError(() => {
            authService.clearSession();
            nav.navigateByUrl('/login');
            return throwError(() => error);
          }),
        );
      }

      isRefreshing = true;
      refreshTokenValue = null;

      return from(authService.refreshTokenAsync()).pipe(
        switchMap(auth => {
          refreshTokenValue = auth.token;
          const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } });
          return next(cloned);
        }),
        catchError(refreshError => {
          refreshTokenValue = null;
          authService.clearSession();
          nav.navigateByUrl('/login');
          return throwError(() => refreshError);
        }),
        finalize(() => {
          isRefreshing = false;
        }),
      );
    }),
  );
};

function waitForRefresh(): Promise<string | null> {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        clearInterval(interval);
        resolve(refreshTokenValue);
      }
    }, 50);
  });
}
