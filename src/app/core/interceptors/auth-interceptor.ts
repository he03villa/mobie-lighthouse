import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

const SKIP_AUTH_URLS = ['/auth/login', '/auth/register', '/auth/accept-invitation', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (SKIP_AUTH_URLS.some(url => req.url.includes(url))) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getTokenSync();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
