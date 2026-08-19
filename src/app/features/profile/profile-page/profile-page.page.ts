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
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { ActiveTenantService } from '../../../core/services/active-tenant';
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
  protected navController = inject(NavController);

  user: User | null = null;
  tenant: TenantMembership | null = null;
  darkMode = false;

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
    });
  }

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe((u) => (this.user = u));
    this.tenantSub = this.activeTenantService.activeTenant$.subscribe(
      (t) => (this.tenant = t)
    );
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.tenantSub?.unsubscribe();
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
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
