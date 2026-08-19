import { Participant } from './participant';
import { ActivitySubmission } from './submission';
import { User } from './user';

export type FieldNoteVisibility = 'private' | 'shared_family' | 'shared_participant' | 'public';

export interface FieldNote {
  id: string;
  content: string;
  visibility: FieldNoteVisibility;
  session_date?: string | null;
  created_at?: string | null;
  author: User;
  participant: Participant;
  submission?: ActivitySubmission | null;
}

export interface FieldNoteRequest {
  participant_id: string;
  content: string;
  visibility?: FieldNoteVisibility;
  session_date?: string | null;
}
