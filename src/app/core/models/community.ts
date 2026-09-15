import { User } from './user';

export interface ForumPost {
  id: string;
  author_user_id: string;
  title: string;
  content: string;
  category?: string | null;
  pinned: boolean;
  comments_count: number;
  reactions_count: number;
  user_reaction?: string | null;
  created_at: string;
  updated_at?: string | null;
  author?: User;
  comments?: ForumComment[];
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_user_id: string;
  content: string;
  reactions_count: number;
  user_reaction?: string | null;
  created_at: string;
  author?: User;
}

export type ReactionType = 'like' | 'heart' | 'helpful';

export interface CreatePostRequest {
  title: string;
  content: string;
  category?: string | null;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  category?: string | null;
  pinned?: boolean;
}

export interface CreateCommentRequest {
  content: string;
}
