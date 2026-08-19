export type ActivityType = 'upload' | 'reflection' | 'completion' | 'quiz';

export interface Activity {
  id: string;
  name: string;
  description?: string | null;
  type: ActivityType;
  order: number;
  config?: unknown | null;
  created_at?: string | null;
}

export interface Module {
  id: string;
  name: string;
  description?: string | null;
  order: number;
  created_at?: string | null;
  activities?: Activity[];
}

export interface Program {
  id: string;
  name: string;
  description?: string | null;
  age_group?: string | null;
  duration_weeks?: number | null;
  is_published: boolean;
  thumbnail?: string | null;
  config?: unknown | null;
  created_at?: string | null;
  modules?: Module[];
}

export interface ActivityRequest {
  name: string;
  description?: string;
  type?: ActivityType;
  order?: number;
  config?: unknown;
}

export interface ModuleRequest {
  name: string;
  description?: string;
  order?: number;
  activities?: ActivityRequest[];
}

export interface ProgramRequest {
  name: string;
  description?: string;
  age_group?: string;
  duration_weeks?: number;
  is_published?: boolean;
  thumbnail?: string;
  config?: unknown;
  modules?: ModuleRequest[];
}
