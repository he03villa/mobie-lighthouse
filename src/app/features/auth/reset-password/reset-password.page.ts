import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { keyOutline, checkmarkCircleOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { NavigationService } from '../../../core/services/navigation';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
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
export class ResetPasswordPage implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private nav = inject(NavigationService);

  token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  success = false;

  constructor() {
    addIcons({ keyOutline, checkmarkCircleOutline, lockClosedOutline });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.toast.show('Token no válido', 'danger');
      this.nav.forward('/login');
    }
  }

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  get isValid(): boolean {
    return this.password.length >= 8 && this.passwordsMatch;
  }

  async submit(): Promise<void> {
    if (!this.isValid) return;

    this.loading = true;
    try {
      await this.authService.resetPasswordAsync(this.token, this.password);
      this.success = true;
      await this.toast.show('Contraseña restablecida correctamente', 'success');
    } catch {
      await this.toast.show('Error al restablecer la contraseña', 'danger');
    } finally {
      this.loading = false;
    }
  }

  goToLogin(): void {
    this.nav.forward('/login');
  }
}
