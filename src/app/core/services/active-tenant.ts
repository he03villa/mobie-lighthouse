import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TenantMembership, User } from '../models/user';

const ACTIVE_TENANT_KEY = 'lighthouse_active_tenant_id';

@Injectable({ providedIn: 'root' })
export class ActiveTenantService {
  private tenantsSubject = new BehaviorSubject<TenantMembership[]>([]);
  private activeTenantSubject = new BehaviorSubject<TenantMembership | null>(null);

  tenants$ = this.tenantsSubject.asObservable();
  activeTenant$ = this.activeTenantSubject.asObservable();

  restoreFromUser(user: User | null): void {
    this.syncFromUser(user);
  }

  syncFromUser(user: User | null): void {
    const tenants = user?.tenants ?? [];
    this.tenantsSubject.next(tenants);

    if (!tenants.length) {
      this.activeTenantSubject.next(null);
      localStorage.removeItem(ACTIVE_TENANT_KEY);
      return;
    }

    const storedId = this.getStoredId();
    const selected = tenants.find(t => t.id === storedId) ?? tenants[0];
    this.setActiveTenant(selected);
  }

  setActiveTenant(tenant: TenantMembership): void {
    this.activeTenantSubject.next(tenant);
    localStorage.setItem(ACTIVE_TENANT_KEY, tenant.id);
  }

  getActiveTenant(): TenantMembership | null {
    return this.activeTenantSubject.value;
  }

  getActiveTenantId(): string {
    return this.activeTenantSubject.value?.id ?? '';
  }

  hasActiveTenant(): boolean {
    return !!this.activeTenantSubject.value;
  }

  isCoachOrAbove(): boolean {
    const tenant = this.activeTenantSubject.value;
    if (!tenant) return false;
    return tenant.roles.some(r => ['owner', 'admin', 'coach'].includes(r));
  }

  isParticipant(): boolean {
    const tenant = this.activeTenantSubject.value;
    if (!tenant) return false;
    return tenant.roles.includes('participant');
  }

  isParent(): boolean {
    const tenant = this.activeTenantSubject.value;
    if (!tenant) return false;
    return tenant.roles.includes('parent');
  }

  clear(): void {
    this.tenantsSubject.next([]);
    this.activeTenantSubject.next(null);
    localStorage.removeItem(ACTIVE_TENANT_KEY);
  }

  private getStoredId(): string | null {
    return localStorage.getItem(ACTIVE_TENANT_KEY);
  }
}
