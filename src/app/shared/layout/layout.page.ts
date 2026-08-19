import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  listOutline,
  documentTextOutline,
  calendarOutline,
  walletOutline,
  peopleOutline,
  schoolOutline,
  createOutline,
  personOutline,
  logOutOutline,
  menuOutline,
  closeOutline,
  arrowBackOutline,
  addOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { ActiveTenantService } from '../../core/services/active-tenant';
import { NavigationService } from '../../core/services/navigation';
import { User, TenantMembership } from '../../core/models/user';

const ROOT_PATHS = [
  '/dashboard',
  '/activities',
  '/journal',
  '/planning',
  '/billing',
  '/participants',
  '/programs',
  '/field-notes',
  '/profile',
];

const FAB_ROUTES: Record<string, string> = {
  '/programs': '/programs/new',
  '/journal': '/journal/new',
  '/participants': '/participants/new',
  '/field-notes': '/field-notes/new',
};

const LIST_PATHS = Object.keys(FAB_ROUTES);

@Component({
  selector: 'app-layout',
  templateUrl: './layout.page.html',
  styleUrls: ['./layout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonRouterOutlet,
    IonIcon,
  ],
})
export class LayoutPage implements OnInit, OnDestroy {
  isCoach = false;
  isRootPage = true;
  sidebarOpen = false;
  user: User | null = null;
  activeTenant: TenantMembership | null = null;
  currentUrl = '';

  private authService = inject(AuthService);
  private activeTenantService = inject(ActiveTenantService);
  private alertCtrl = inject(AlertController);
  private nav = inject(NavigationService);

  private subs: Subscription[] = [];

  constructor() {
    addIcons({
      homeOutline,
      listOutline,
      documentTextOutline,
      calendarOutline,
      walletOutline,
      peopleOutline,
      schoolOutline,
      createOutline,
      personOutline,
      logOutOutline,
      menuOutline,
      closeOutline,
      arrowBackOutline,
      addOutline,
    });
  }

  ngOnInit(): void {
    this.subs.push(
      this.authService.user$.subscribe(u => {
        this.user = u;
      }),
      this.activeTenantService.activeTenant$.subscribe(t => {
        this.activeTenant = t;
        this.isCoach = this.activeTenantService.isCoachOrAbove();
      }),
      this.nav.navigationEnd$.subscribe(e => {
        const url = e.urlAfterRedirects || e.url;
        this.currentUrl = url;
        this.isRootPage = ROOT_PATHS.includes(url);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get userInitial(): string {
    return this.user?.name?.charAt(0)?.toUpperCase() ?? '?';
  }

  get roleLabel(): string {
    const roles = this.activeTenant?.roles ?? [];
    const role = roles[0] ?? '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  goBack(): void {
    this.nav.back();
  }

  async logout(): Promise<void> {
    this.closeSidebar();
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesion',
      message: 'Estas seguro de que deseas cerrar sesion?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesion',
          role: 'destructive',
          handler: async () => {
            await this.authService.logoutAsync();
            this.nav.root('/login');
          },
        },
      ],
    });
    await alert.present();
  }

  navigateTo(path: string): void {
    this.closeSidebar();
    this.nav.forward(path);
  }

  get showFab(): boolean {
    return LIST_PATHS.includes(this.currentUrl);
  }

  fabAction(): void {
    for (const [prefix, target] of Object.entries(FAB_ROUTES)) {
      if (this.currentUrl === prefix) {
        this.nav.forward(target);
        return;
      }
    }
  }
}
