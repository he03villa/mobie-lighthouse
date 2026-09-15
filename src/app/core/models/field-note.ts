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

export interface FieldNoteUpdateRequest {
  content?: string;
  visibility?: FieldNoteVisibility;
  session_date?: string | null;
}

export const FIELD_NOTE_VISIBILITY_LABELS: Record<FieldNoteVisibility, string> = {
  private: 'Privada',
  shared_family: 'Compartida con la familia',
  shared_participant: 'Compartida con el participante',
  public: 'Publica',
};
