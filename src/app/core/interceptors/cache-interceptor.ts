import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { response: HttpResponse<unknown>; timestamp: number }>();

const CACHEABLE_PATHS = [
  '/programs',
  '/participants',
  '/journal',
  '/field-notes',
  '/forum',
  '/enrollments',
];

function isCacheable(req: HttpRequest<unknown>): boolean {
  if (req.method !== 'GET') return false;
  return CACHEABLE_PATHS.some(path => req.url.includes(path));
}

function getCacheKey(req: HttpRequest<unknown>): string {
  return `${req.urlWithParams}`;
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isCacheable(req)) {
    return next(req);
  }

  const key = getCacheKey(req);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return of(cached.response.clone());
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(key, { response: event, timestamp: Date.now() });
      }
    }),
  );
};

export function clearCache(): void {
  cache.clear();
}
