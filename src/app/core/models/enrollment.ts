import { Participant } from './participant';
import { Program } from './program';

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  enrolled_at?: string | null;
  completed_at?: string | null;
  participant: Participant;
  program: Program;
  progress?: Progress;
}

export interface Progress {
  enrollment_id: string;
  percentage: number;
  completed_activities: number;
  total_activities: number;
  updated_at?: string | null;
}
