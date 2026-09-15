import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import {
  Conversation,
  Message,
  SendMessageRequest,
  CreateConversationRequest,
} from '../models/message';
import { environment } from '../../../environments/environment';

const BASE = environment.api.conversations.name;
const MESSAGES = environment.api.conversations.services.messages;
const READ = environment.api.conversations.services.read;
const TYPING = environment.api.conversations.services.typing;

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private api = inject(ApiService);

  listConversationsAsync(): Promise<Conversation[]> {
    return firstValueFrom(this.api.get<ApiResponse<Conversation[]>>(`/${BASE}`)).then(res => res.data);
  }

  createConversationAsync(data: CreateConversationRequest): Promise<Conversation> {
    return firstValueFrom(this.api.post<ApiResponse<Conversation>>(`/${BASE}`, data)).then(res => res.data);
  }

  getConversationAsync(id: string): Promise<Conversation> {
    return firstValueFrom(this.api.get<ApiResponse<Conversation>>(`/${BASE}/${id}`)).then(res => res.data);
  }

  listMessagesAsync(conversationId: string, page = 1): Promise<Message[]> {
    return firstValueFrom(
      this.api.get<ApiResponse<{ messages: Message[] }>>(`/${BASE}/${conversationId}/${MESSAGES}?page=${page}`)
    ).then(res => res.data?.messages ?? []);
  }

  sendMessageAsync(conversationId: string, data: SendMessageRequest): Promise<Message> {
    return firstValueFrom(
      this.api.post<ApiResponse<Message>>(`/${BASE}/${conversationId}/${MESSAGES}`, data)
    ).then(res => res.data);
  }

  markAsReadAsync(conversationId: string): Promise<void> {
    return firstValueFrom(
      this.api.patch<ApiResponse<null>>(`/${BASE}/${conversationId}/${READ}`)
    ).then(() => undefined);
  }

  sendTypingAsync(conversationId: string, isTyping: boolean): Promise<void> {
    return firstValueFrom(
      this.api.post<ApiResponse<null>>(`/${BASE}/${conversationId}/${TYPING}`, { is_typing: isTyping })
    ).then(() => undefined);
  }

  deleteConversationAsync(conversationId: string): Promise<void> {
    return firstValueFrom(
      this.api.delete<ApiResponse<null>>(`/${BASE}/${conversationId}`)
    ).then(() => undefined);
  }
}
