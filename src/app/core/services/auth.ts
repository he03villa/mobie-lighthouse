import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ActiveTenantService } from './active-tenant';
import { SecureStorageService } from './secure-storage';
import { ApiResponse } from '../models/api-response';
import { LoginResponse, RegisterResponse, RefreshResponse, User } from '../models/user';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'lighthouse_token';
const USER_KEY = 'lighthouse_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private activeTenant = inject(ActiveTenantService);
  private secureStorage = inject(SecureStorageService);
  private base = environment.api.auth.name;

  private _token: string | null = null;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<User | null>(null);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  user$ = this.userSubject.asObservable();

  constructor() {
    this.initSession();
  }

  private async initSession(): Promise<void> {
    const token = await this.secureStorage.get(TOKEN_KEY);
    if (token) {
      this._token = token;
      this.isAuthenticatedSubject.next(true);
      const user = await this.loadUser();
      this.userSubject.next(user);
      this.activeTenant.restoreFromUser(user);
    }
  }

  async getToken(): Promise<string | null> {
    return this.secureStorage.get(TOKEN_KEY);
  }

  getTokenSync(): string | null {
    return this._token;
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  async loginAsync(email: string, password: string): Promise<LoginResponse> {
    const res = await firstValueFrom(
      this.api.post<ApiResponse<LoginResponse>>(`/${this.base}/${environment.api.auth.services.login}`, { email, password })
    );
    await this.setSession(res.data.user, res.data.token);
    await this.meAsync();
    return res.data;
  }

  async registerAsync(data: {
    name: string;
    email: string;
    password: string;
    tenant_name?: string;
    tenant_type?: string;
  }): Promise<RegisterResponse> {
    const res = await firstValueFrom(
      this.api.post<ApiResponse<RegisterResponse>>(`/${this.base}/${environment.api.auth.services.register}`, data)
    );
    await this.setSession(res.data.user, res.data.token);
    await this.meAsync();
    return res.data;
  }

  async acceptInvitationAsync(token: string, name: string, password: string): Promise<LoginResponse> {
    const res = await firstValueFrom(
      this.api.post<ApiResponse<LoginResponse>>(`/${this.base}/${environment.api.auth.services.acceptInvitation}`, {
        token,
        name,
        password,
        password_confirmation: password,
      })
    );
    await this.setSession(res.data.user, res.data.token);
    await this.meAsync();
    return res.data;
  }

  async forgotPasswordAsync(email: string): Promise<void> {
    await firstValueFrom(
      this.api.post<ApiResponse<void>>(`/${this.base}/${environment.api.auth.services.forgotPassword}`, { email })
    );
  }

  async resetPasswordAsync(token: string, password: string): Promise<void> {
    await firstValueFrom(
      this.api.post<ApiResponse<void>>(`/${this.base}/${environment.api.auth.services.resetPassword}`, {
        token,
        password,
        password_confirmation: password,
      })
    );
  }

  async refreshTokenAsync(): Promise<RefreshResponse> {
    const res = await firstValueFrom(
      this.api.post<ApiResponse<RefreshResponse>>(`/${this.base}/${environment.api.auth.services.refresh}`)
    );
    if (res.data.token) {
      this._token = res.data.token;
      await this.secureStorage.set(TOKEN_KEY, res.data.token);
    }
    return res.data;
  }

  async logoutAsync(): Promise<void> {
    try {
      await firstValueFrom(this.api.post(`/${this.base}/${environment.api.auth.services.logout}`));
    } finally {
      await this.clearSession();
    }
  }

  async meAsync(): Promise<User> {
    const res = await firstValueFrom(
      this.api.get<ApiResponse<User>>(`/${this.base}/${environment.api.auth.services.me}`)
    );
    this.userSubject.next(res.data);
    await this.secureStorage.set(USER_KEY, JSON.stringify(res.data));
    this.activeTenant.syncFromUser(res.data);
    return res.data;
  }

  isAuthenticatedSync(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.secureStorage.get(TOKEN_KEY);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        await this.clearSession();
        return false;
      }
      return true;
    } catch {
      await this.clearSession();
      return false;
    }
  }

  async clearSession(): Promise<void> {
    this._token = null;
    await this.secureStorage.remove(TOKEN_KEY);
    await this.secureStorage.remove(USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);
    this.activeTenant.clear();
  }

  private async setSession(user: User, token: string): Promise<void> {
    this._token = token;
    await this.secureStorage.set(TOKEN_KEY, token);
    await this.secureStorage.set(USER_KEY, JSON.stringify(user));
    this.isAuthenticatedSubject.next(true);
    this.userSubject.next(user);
  }

  private async loadUser(): Promise<User | null> {
    const raw = await this.secureStorage.get(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
