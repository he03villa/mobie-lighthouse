import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ActiveTenantService } from './active-tenant';
import { ApiResponse } from '../models/api-response';
import { LoginResponse, RegisterResponse, RefreshResponse, User } from '../models/user';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'lighthouse_token';
const USER_KEY = 'lighthouse_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private activeTenant = inject(ActiveTenantService);
  private base = environment.api.auth.name;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  user$ = this.userSubject.asObservable();

  constructor() {
    this.activeTenant.restoreFromUser(this.userSubject.value);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  async loginAsync(email: string, password: string): Promise<LoginResponse> {
    const res = await firstValueFrom(
      this.api.post<ApiResponse<LoginResponse>>(`/${this.base}/${environment.api.auth.services.login}`, { email, password })
    );
    this.setSession(res.data.user, res.data.token);
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
    this.setSession(res.data.user, res.data.token);
    await this.meAsync();
    return res.data;
  }

  async refreshTokenAsync(): Promise<RefreshResponse> {
    const res = await firstValueFrom(
      this.api.post<ApiResponse<RefreshResponse>>(`/${this.base}/${environment.api.auth.services.refresh}`)
    );
    if (res.data.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
    }
    return res.data;
  }

  async logoutAsync(): Promise<void> {
    try {
      await firstValueFrom(this.api.post(`/${this.base}/${environment.api.auth.services.logout}`));
    } finally {
      this.clearSession();
    }
  }

  async meAsync(): Promise<User> {
    const res = await firstValueFrom(
      this.api.get<ApiResponse<User>>(`/${this.base}/${environment.api.auth.services.me}`)
    );
    this.userSubject.next(res.data);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    this.activeTenant.syncFromUser(res.data);
    return res.data;
  }

  isAuthenticatedSync(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.clearSession();
        return false;
      }
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return this.isAuthenticatedSync();
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);
    this.activeTenant.clear();
  }

  private setSession(user: User, token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.isAuthenticatedSubject.next(true);
    this.userSubject.next(user);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
