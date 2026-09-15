import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/interceptors/auth-interceptor';
import { tenantInterceptor } from './app/core/interceptors/tenant-interceptor';
import { refreshInterceptor } from './app/core/interceptors/refresh-interceptor';
import { retryInterceptor } from './app/core/interceptors/retry-interceptor';
import { cacheInterceptor } from './app/core/interceptors/cache-interceptor';
import { errorInterceptor } from './app/core/interceptors/error-interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([
      authInterceptor,
      tenantInterceptor,
      refreshInterceptor,
      retryInterceptor,
      cacheInterceptor,
      errorInterceptor,
    ])),
  ],
});
