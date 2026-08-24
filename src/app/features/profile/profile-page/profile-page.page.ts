import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonList,
  IonToggle,
  AlertController,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  businessOutline,
  colorPaletteOutline,
  moonOutline,
  logOutOutline,
  chevronForwardOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { ActiveTenantService } from '../../../core/services/active-tenant';
import { GamificationService, Badge, LevelInfo } from '../../../core/services/gamification';
import { ReminderService } from '../../../core/services/reminder';
import { User, TenantMembership } from '../../../core/models/user';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.page.html',
  styleUrls: ['./profile-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonList,
    IonToggle,
  ],
})
export class ProfilePagePage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private activeTenantService = inject(ActiveTenantService);
  private alertController = inject(AlertController);
  private gamification = inject(GamificationService);
  private reminder = inject(ReminderService);
  protected navController = inject(NavController);

  user: User | null = null;
  tenant: TenantMembership | null = null;
  darkMode = false;
  badges: Badge[] = [];
  levelInfo: LevelInfo = { level: 0, currentXP: 0, nextLevelXP: 100, progress: 0 };
  streakCount = 0;
  reminderEnabled = false;

  private userSub?: Subscription;
  private tenantSub?: Subscription;

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      businessOutline,
      colorPaletteOutline,
      moonOutline,
      logOutOutline,
      chevronForwardOutline,
      notificationsOutline,
    });
  }

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe((u) => (this.user = u));
    this.tenantSub = this.activeTenantService.activeTenant$.subscribe(
      (t) => (this.tenant = t)
    );
    this.gamification.init().then(() => {
      this.badges = this.gamification.getBadges();
      this.levelInfo = this.gamification.getLevelInfo();
      this.streakCount = this.gamification.getStreak().current;
    });
    this.reminder.init().then(() => {
      this.reminderEnabled = this.reminder.isEnabled();
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.tenantSub?.unsubscribe();
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
  }

  async toggleReminder(): Promise<void> {
    this.reminderEnabled = await this.reminder.toggle();
  }

  async logout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cerrar sesion',
      message: '¿Estas seguro de que quieres cerrar sesion?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesion',
          role: 'destructive',
          handler: async () => {
            await this.authService.logoutAsync();
            this.navController.navigateRoot('/login');
          },
        },
      ],
    });
    await alert.present();
  }
}
