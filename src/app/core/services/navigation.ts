import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { Observable, filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private nav = inject(NavController);
  private router = inject(Router);

  readonly navigationEnd$: Observable<NavigationEnd> = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
  );

  forward(url: string): void {
    this.nav.navigateForward(url);
  }

  back(): void {
    this.nav.back();
  }

  root(url: string): void {
    this.nav.navigateRoot(url);
  }

  navigateByUrl(url: string): void {
    this.router.navigateByUrl(url);
  }
}
