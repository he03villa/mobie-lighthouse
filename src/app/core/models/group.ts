import { Participant } from './participant';

export interface Group {
  id: string;
  name: string;
  created_at?: string | null;
  participants?: Participant[];
}
