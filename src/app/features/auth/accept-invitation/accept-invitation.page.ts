import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonInput,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import {
  addIcons,
} from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  flashOutline,
  checkmarkOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-accept-invitation',
  templateUrl: './accept-invitation.page.html',
  styleUrls: ['./accept-invitation.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonInput,
    IonSpinner,
    IonIcon,
  ],
})
export class AcceptInvitationPage implements OnInit {
  private authService = inject(AuthService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  token = '';
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage = '';
  isValidToken = false;

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, flashOutline, checkmarkOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] ?? '';
      if (!this.token) {
        this.errorMessage = 'Token de invitación no válido';
        this.isValidToken = false;
      } else {
        this.isValidToken = true;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async accept(): Promise<void> {
    this.errorMessage = '';

    if (!this.name.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;

    try {
      await this.authService.acceptInvitationAsync(this.token, this.name.trim(), this.password);
      await this.toast.show('Cuenta creada exitosamente!', 'success');
      this.nav.forward('/dashboard');
    } catch (error: unknown) {
      const msg = (error as { message?: string }).message ?? 'Token inválido o expirado. Solicita una nueva invitación.';
      this.errorMessage = msg;
      await this.toast.show(msg, 'danger', 3000);
    } finally {
      this.loading = false;
    }
  }
}
