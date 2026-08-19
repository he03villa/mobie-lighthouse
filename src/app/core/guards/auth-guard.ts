import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const navController = inject(NavController);

  if (!authService.isAuthenticatedSync()) {
    navController.navigateRoot('/login');
    return false;
  }

  return true;
};
