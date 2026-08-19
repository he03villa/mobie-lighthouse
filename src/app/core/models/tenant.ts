export type TenantType = 'individual' | 'organization' | 'family';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: TenantType;
  config?: unknown | null;
  created_at?: string | null;
  is_active?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  roles: MemberRole[];
  joined_at?: string | null;
  is_active?: boolean | null;
}

export type MemberRole = 'owner' | 'admin' | 'coach' | 'parent' | 'participant' | 'staff';
