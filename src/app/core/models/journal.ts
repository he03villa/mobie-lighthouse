import { Participant } from './participant';
import { User } from './user';

export type JournalVisibility = 'private' | 'shared_family' | 'shared_participant' | 'public';

export interface JournalEntry {
  id: string;
  participant_id?: string | null;
  entry_date?: string | null;
  content: string;
  visibility: JournalVisibility;
  author?: User;
  participant?: Participant;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface JournalEntryRequest {
  participant_id?: string | null;
  entry_date?: string | null;
  content: string;
  visibility?: JournalVisibility;
}

export const JOURNAL_VISIBILITY_LABELS: Record<JournalVisibility, string> = {
  private: 'Privada',
  shared_family: 'Compartida con la familia',
  shared_participant: 'Compartida con el participante',
  public: 'Pública',
};
