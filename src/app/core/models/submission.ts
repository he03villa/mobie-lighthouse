import { Activity } from './program';
import { Enrollment } from './enrollment';
import { User } from './user';

export type SubmissionStatus = 'pending' | 'submitted' | 'reviewed' | 'approved' | 'rejected';

export type EvidenceType = 'text' | 'image' | 'video' | 'audio' | 'file';

export interface ActivitySubmission {
  id: string;
  status: SubmissionStatus;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  activity: Activity;
  enrollment: Enrollment;
  evidences?: Evidence[];
  reviewed_by?: User;
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  content?: string | null;
  metadata?: unknown | null;
  created_at?: string | null;
}
