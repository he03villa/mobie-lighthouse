import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import {
  ForumPost,
  ForumComment,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  ReactionType,
} from '../models/community';
import { environment } from '../../../environments/environment';

const BASE = environment.api.forum.name;
const POSTS = environment.api.forum.services.posts;
const COMMENTS = environment.api.forum.services.comments;
const REACTIONS = environment.api.forum.services.reactions;

@Injectable({ providedIn: 'root' })
export class CommunityService {
  private api = inject(ApiService);

  listPostsAsync(category?: string): Promise<ForumPost[]> {
    const query = category ? `?category=${category}` : '';
    return firstValueFrom(this.api.get<ApiResponse<ForumPost[]>>(`/${BASE}/${POSTS}${query}`)).then(res => res.data);
  }

  getPostAsync(id: string): Promise<ForumPost> {
    return firstValueFrom(this.api.get<ApiResponse<ForumPost>>(`/${BASE}/${POSTS}/${id}`)).then(res => res.data);
  }

  createPostAsync(data: CreatePostRequest): Promise<ForumPost> {
    return firstValueFrom(this.api.post<ApiResponse<ForumPost>>(`/${BASE}/${POSTS}`, data)).then(res => res.data);
  }

  updatePostAsync(id: string, data: UpdatePostRequest): Promise<ForumPost> {
    return firstValueFrom(this.api.patch<ApiResponse<ForumPost>>(`/${BASE}/${POSTS}/${id}`, data)).then(res => res.data);
  }

  deletePostAsync(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<ApiResponse<null>>(`/${BASE}/${POSTS}/${id}`)).then(() => undefined);
  }

  createCommentAsync(postId: string, data: CreateCommentRequest): Promise<ForumComment> {
    return firstValueFrom(
      this.api.post<ApiResponse<ForumComment>>(`/${BASE}/${POSTS}/${postId}/${COMMENTS}`, data)
    ).then(res => res.data);
  }

  deleteCommentAsync(commentId: string): Promise<void> {
    return firstValueFrom(this.api.delete<ApiResponse<null>>(`/${BASE}/${COMMENTS}/${commentId}`)).then(() => undefined);
  }

  togglePostReactionAsync(postId: string, type: ReactionType): Promise<void> {
    return firstValueFrom(
      this.api.post<ApiResponse<null>>(`/${BASE}/${POSTS}/${postId}/${REACTIONS}`, { type })
    ).then(() => undefined);
  }

  toggleCommentReactionAsync(commentId: string, type: ReactionType): Promise<void> {
    return firstValueFrom(
      this.api.post<ApiResponse<null>>(`/${BASE}/${COMMENTS}/${commentId}/${REACTIONS}`, { type })
    ).then(() => undefined);
  }
}
