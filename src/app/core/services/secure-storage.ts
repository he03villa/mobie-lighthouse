import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  async set(key: string, value: string): Promise<void> {
    if (isNative) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (isNative) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  }

  async remove(key: string): Promise<void> {
    if (isNative) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (isNative) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }
}
