import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private ctrl = inject(ToastController);

  async show(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'medium' = 'danger',
    duration = 2000,
    position: 'bottom' | 'top' | 'middle' = 'bottom',
  ): Promise<void> {
    const toast = await this.ctrl.create({ message, color, duration, position });
    await toast.present();
  }
}
