import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer } from 'rxjs';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status === 0 || error.status >= 500) {
          const delay = RETRY_DELAY * Math.pow(2, retryCount - 1);
          return timer(delay);
        }
        throw error;
      },
    }),
  );
};
