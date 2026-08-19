export interface User {
  id: string;
  name: string;
  email: string;
  timezone?: string | null;
  locale?: string | null;
  is_super_admin: boolean;
  created_at?: string | null;
  tenants?: TenantMembership[];
  roles?: string[];
  permissions?: string[];
}

export interface TenantMembership {
  id: string;
  name: string;
  slug: string;
  type: string;
  config?: unknown | null;
  created_at?: string | null;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  tenant?: unknown | null;
}

export interface RefreshResponse {
  token: string;
}
