import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import {
  IonContent,
  IonItem,
  IonLabel,
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
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  flashOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    IonIcon,
  ],
})
export class LoginPage {
  private authService = inject(AuthService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, flashOutline });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.nav.forward('/register');
  }

  async login(): Promise<void> {
    this.errorMessage = '';
    this.loading = true;

    try {
      await this.authService.loginAsync(this.email, this.password);
      this.nav.forward('/dashboard');
    } catch (error: unknown) {
      const msg = (error as { message?: string }).message ?? 'Credenciales incorrectas. Intenta de nuevo.';
      this.errorMessage = msg;
      await this.toast.show(msg, 'danger', 3000);
    } finally {
      this.loading = false;
    }
  }
}
