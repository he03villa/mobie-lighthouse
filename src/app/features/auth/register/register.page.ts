import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import {
  addIcons,
} from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  businessOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    IonIcon,
  ],
})
export class RegisterPage {
  private authService = inject(AuthService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  tenantName = '';
  showPassword = false;
  loading = false;
  errorMessage = '';
  step: 1 | 2 = 1;

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      businessOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  nextStep() {
    this.errorMessage = '';

    if (!this.name.trim()) {
      this.errorMessage = 'El nombre es obligatorio.';
      return;
    }
    if (!this.email.trim()) {
      this.errorMessage = 'El correo electrónico es obligatorio.';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'La contraseña es obligatoria.';
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.step = 2;
  }

  async register() {
    this.errorMessage = '';
    this.loading = true;

    try {
      await this.authService.registerAsync({
        name: this.name.trim(),
        email: this.email.trim(),
        password: this.password,
        tenant_name: this.tenantName.trim() || undefined,
      });

      await this.toast.show('¡Cuenta creada exitosamente!', 'success');
      this.nav.forward('/dashboard');
    } catch (error: any) {
      this.errorMessage =
        error?.message || 'Ocurrió un error al crear la cuenta.';
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.nav.root('/login');
  }

  goBack() {
    this.step = 1;
  }
}
