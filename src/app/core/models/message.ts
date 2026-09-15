import { User } from './user';

export interface Conversation {
  id: string;
  title?: string | null;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  content: string;
  media?: MessageMedia[];
  read_at?: string | null;
  created_at: string;
  sender?: User;
}

export interface MessageMedia {
  url: string;
  type: string;
  name: string;
}

export interface SendMessageRequest {
  content: string;
  media?: MessageMedia[] | null;
}

export interface CreateConversationRequest {
  participant_ids: string[];
  title?: string | null;
}
