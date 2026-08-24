import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { ActiveTenantService } from '../services/active-tenant';

export const participantGuard: CanActivateFn = () => {
  const activeTenantService = inject(ActiveTenantService);
  const navController = inject(NavController);

  if (!activeTenantService.isParticipant()) {
    navController.navigateRoot('/dashboard');
    return false;
  }

  return true;
};
