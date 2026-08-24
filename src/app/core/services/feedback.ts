import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  async tap(): Promise<void> {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* noop */ }
  }

  async success(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      await Haptics.notification({ type: NotificationType.Success });
    } catch { /* noop */ }
  }

  async error(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await Haptics.notification({ type: NotificationType.Error });
    } catch { /* noop */ }
  }

  async achievement(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await Haptics.notification({ type: NotificationType.Success });
    } catch { /* noop */ }
  }
}
