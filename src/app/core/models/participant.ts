import { Group } from './group';

export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  birth_date?: string | null;
  avatar?: string | null;
  metadata?: unknown | null;
  created_at?: string | null;
  guardians?: Guardian[];
  groups?: Group[];
}

export interface Guardian {
  id: string;
  name: string;
  email: string;
  relationship?: string | null;
  is_primary: boolean;
  permissions?: unknown | null;
}

export interface GuardianRequest {
  name?: string;
  email: string;
  relationship?: string;
  is_primary?: boolean;
  permissions?: unknown;
}

export interface ParticipantRequest {
  first_name: string;
  last_name: string;
  birth_date?: string | null;
  avatar?: string | null;
  metadata?: unknown | null;
  guardians?: GuardianRequest[];
}
