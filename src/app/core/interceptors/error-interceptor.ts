import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = '';
      let color: 'warning' | 'danger' = 'danger';

      if (error.status === 403) {
        message = 'No tienes acceso a este recurso';
      } else if (error.status === 0) {
        message = 'Sin conexión a internet';
        color = 'warning';
      } else if (error.status >= 500) {
        message = 'Error del servidor. Intenta de nuevo.';
      }

      if (message) {
        toast.show(message, color, error.status === 0 ? 5000 : 4000);
      }

      return throwError(() => error);
    }),
  );
};
