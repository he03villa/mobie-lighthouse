import { Injectable } from '@angular/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

const REMINDER_KEY = 'lh_reminder_enabled';
const REMINDER_HOUR_KEY = 'lh_reminder_hour';

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private enabled = false;
  private hour = 19;

  async init(): Promise<void> {
    const [enabledRes, hourRes] = await Promise.all([
      Preferences.get({ key: REMINDER_KEY }),
      Preferences.get({ key: REMINDER_HOUR_KEY }),
    ]);
    this.enabled = enabledRes.value === 'true';
    this.hour = parseInt(hourRes.value ?? '19', 10);
  }

  isEnabled(): boolean { return this.enabled; }
  getHour(): number { return this.hour; }

  async toggle(): Promise<boolean> {
    await this.init();
    if (this.enabled) {
      await this.cancel();
      this.enabled = false;
    } else {
      const granted = await this.requestPermission();
      if (granted) {
        await this.schedule();
        this.enabled = true;
      }
    }
    await Preferences.set({ key: REMINDER_KEY, value: String(this.enabled) });
    return this.enabled;
  }

  async setHour(hour: number): Promise<void> {
    this.hour = hour;
    await Preferences.set({ key: REMINDER_HOUR_KEY, value: String(hour) });
    if (this.enabled) {
      await this.cancel();
      await this.schedule();
    }
  }

  private async requestPermission(): Promise<boolean> {
    try {
      const perm = await LocalNotifications.requestPermissions();
      return perm.display === 'granted';
    } catch {
      return false;
    }
  }

  private async schedule(): Promise<void> {
    try {
      const now = new Date();
      const scheduled = new Date(now);
      scheduled.setHours(this.hour, 0, 0, 0);
      if (scheduled <= now) scheduled.setDate(scheduled.getDate() + 1);

      const options: ScheduleOptions = {
        notifications: [{
          id: 1,
          title: 'Mantén tu 🔥 viva',
          body: '5 minutos de actividad es suficiente. ¡No pierdas tu racha!',
          schedule: { at: scheduled, repeats: true, every: 'day' },
        }],
      };
      await LocalNotifications.schedule(options);
    } catch { /* noop */ }
  }

  private async cancel(): Promise<void> {
    try { await LocalNotifications.cancel({ notifications: [{ id: 1 }] }); } catch { /* noop */ }
  }
}
