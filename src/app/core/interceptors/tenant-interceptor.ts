import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActiveTenantService } from '../services/active-tenant';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const activeTenant = inject(ActiveTenantService);

  if (!activeTenant.hasActiveTenant()) {
    return next(req);
  }

  req = req.clone({ setHeaders: { 'X-Tenant-Id': activeTenant.getActiveTenantId() } });
  return next(req);
};
