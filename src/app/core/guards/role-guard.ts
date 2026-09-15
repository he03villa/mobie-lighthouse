import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ActiveTenantService } from '../services/active-tenant';

export type AllowedRole = 'owner' | 'admin' | 'coach' | 'parent' | 'participant';

export function roleGuard(...allowedRoles: AllowedRole[]): CanActivateFn {
  return () => {
    const activeTenant = inject(ActiveTenantService);
    const router = inject(Router);

    const tenant = activeTenant.getActiveTenant();
    if (!tenant) {
      router.navigate(['/dashboard']);
      return false;
    }

    const hasRole = tenant.roles.some(role => allowedRoles.includes(role as AllowedRole));
    if (hasRole) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
}
