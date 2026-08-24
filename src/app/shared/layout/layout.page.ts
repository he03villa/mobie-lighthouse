import { Component, OnInit, OnDestroy, AfterViewInit, inject, ViewChild, ElementRef } from '@angular/core';
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
  flameOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { ActiveTenantService } from '../../core/services/active-tenant';
import { NavigationService } from '../../core/services/navigation';
import { GamificationService } from '../../core/services/gamification';
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

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/activities': 'Actividades',
  '/journal': 'Diario',
  '/planning': 'Planificación',
  '/billing': 'Facturación',
  '/participants': 'Participantes',
  '/programs': 'Programas',
  '/field-notes': 'Notas de Campo',
  '/profile': 'Perfil',
};

const ROUTE_COLORS: Record<string, [string, string]> = {
  '/dashboard': ['#2563eb', '#7c3aed'],
  '/programs': ['#1d4d8f', '#4374ad'],
  '/journal': ['#0891b2', '#0e7490'],
  '/planning': ['#7c3aed', '#a855f7'],
  '/activities': ['#0e8a5f', '#34c98e'],
  '/participants': ['#d97706', '#f59e0b'],
  '/field-notes': ['#0891b2', '#22d3ee'],
  '/billing': ['#6366f1', '#8b5cf6'],
  '/profile': ['#667085', '#94a3b8'],
  '/login': ['#1d4d8f', '#4374ad'],
};

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
export class LayoutPage implements OnInit, OnDestroy, AfterViewInit {
  isCoach = false;
  isRootPage = true;
  sidebarOpen = false;
  user: User | null = null;
  activeTenant: TenantMembership | null = null;
  currentUrl = '';
  pageTitle = 'Dashboard';
  headerScrolled = false;
  routeColorStart = '#2563eb';
  routeColorEnd = '#7c3aed';

  @ViewChild('coachMain', { static: false }) coachMainRef?: ElementRef<HTMLElement>;

  private authService = inject(AuthService);
  private activeTenantService = inject(ActiveTenantService);
  private alertCtrl = inject(AlertController);
  private nav = inject(NavigationService);
  private gamification = inject(GamificationService);

  private subs: Subscription[] = [];
  private scrollHandler?: () => void;

  streakCount = 0;
  xpTotal = 0;
  level = 0;

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
      flameOutline,
    });
  }

  ngOnInit(): void {
    this.gamification.init().then(() => this.refreshGamification());
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
        this.pageTitle = PAGE_TITLES[url] ?? 'Lighthouse';
        const colors = ROUTE_COLORS[url];
        if (colors) {
          [this.routeColorStart, this.routeColorEnd] = colors;
        }
      }),
    );
  }

  ngAfterViewInit(): void {
    const el = this.coachMainRef?.nativeElement;
    if (!el) return;
    this.scrollHandler = () => {
      this.headerScrolled = el.scrollTop > 0;
    };
    el.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    const el = this.coachMainRef?.nativeElement;
    if (el && this.scrollHandler) {
      el.removeEventListener('scroll', this.scrollHandler);
    }
  }

  get userInitial(): string {
    return this.user?.name?.charAt(0)?.toUpperCase() ?? '?';
  }

  get roleLabel(): string {
    const roles = this.activeTenant?.roles ?? [];
    const role = roles[0] ?? '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  get streakColor(): string {
    if (this.streakCount >= 30) return '#7c3aed';
    if (this.streakCount >= 7) return '#f59e0b';
    if (this.streakCount >= 3) return '#f97316';
    return '#94a3b8';
  }

  refreshGamification(): void {
    const s = this.gamification.getStreak();
    this.streakCount = s.current;
    this.xpTotal = this.gamification.getXP();
    this.level = this.gamification.currentLevel();
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
