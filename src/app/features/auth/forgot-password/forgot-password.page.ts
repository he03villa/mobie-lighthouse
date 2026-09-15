import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonButton,
  IonInput,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, keyOutline, sendOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { NavigationService } from '../../../core/services/navigation';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonButton,
    IonInput,
    IonSpinner,
    IonIcon,
  ],
})
export class ForgotPasswordPage {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private nav = inject(NavigationService);

  email = '';
  loading = false;
  sent = false;

  constructor() {
    addIcons({ mailOutline, keyOutline, sendOutline });
  }

  async submit(): Promise<void> {
    if (!this.email.trim()) return;

    this.loading = true;
    try {
      await this.authService.forgotPasswordAsync(this.email.trim());
      this.sent = true;
      await this.toast.show('Correo de recuperación enviado', 'success');
    } catch {
      await this.toast.show('Error al enviar el correo', 'danger');
    } finally {
      this.loading = false;
    }
  }

  goToLogin(): void {
    this.nav.forward('/login');
  }
}
