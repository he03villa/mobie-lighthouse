import { Injectable, inject } from '@angular/core';
import Pusher from 'pusher-js';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';
import { Message, Conversation } from '../models/message';

/* eslint-disable @typescript-eslint/no-explicit-any */
type PusherChannel = any;

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private authService = inject(AuthService);

  private pusher: Pusher | null = null;
  private channels: Map<string, PusherChannel> = new Map();
  private messageSubject = new Subject<Message>();
  private typingSubject = new Subject<{ userId: string; isTyping: boolean }>();
  private conversationCreatedSubject = new Subject<Conversation>();
  private conversationUpdatedSubject = new Subject<{ id: string; type: string; lastMessage?: Message | null; unreadCount?: number | null }>();
  private connected = false;
  private connectPromise: Promise<void> | null = null;

  get messages$(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  get typing$(): Observable<{ userId: string; isTyping: boolean }> {
    return this.typingSubject.asObservable();
  }

  get conversationCreated$(): Observable<Conversation> {
    return this.conversationCreatedSubject.asObservable();
  }

  get conversationUpdated$(): Observable<{ id: string; type: string; lastMessage?: Message | null; unreadCount?: number | null }> {
    return this.conversationUpdatedSubject.asObservable();
  }

  get isConnected(): boolean {
    return this.connected;
  }

  connect(): Promise<void> {
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise<void>((resolve) => {
      if (this.pusher) { resolve(); return; }

      const token = this.authService.getToken();
      if (!token) { resolve(); return; }

      try {
        this.pusher = new Pusher(environment.VITE_REVERB_APP_KEY, {
          cluster: environment.cluster,
          wsHost: environment.VITE_REVERB_HOST,
          wsPort: environment.VITE_REVERB_PORT,
          wssPort: environment.VITE_REVERB_PORT,
          forceTLS: environment.VITE_REVERB_SCHEME === 'https',
          enabledTransports: ['ws', 'wss', 'xhr_streaming', 'xhr_polling'],
          authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
          auth: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });

        this.pusher.connection.bind('connected', () => {
          this.connected = true;
          resolve();
        });

        this.pusher.connection.bind('disconnected', () => {
          this.connected = false;
        });

        this.pusher.connection.bind('error', () => {
          this.connected = false;
          resolve();
        });
      } catch {
        resolve();
      }
    });

    return this.connectPromise;
  }

  disconnect(): void {
    if (this.pusher) {
      this.channels.forEach((_, channelName) => {
        this.pusher?.unsubscribe(channelName);
      });
      this.channels.clear();
      this.pusher.disconnect();
      this.pusher = null;
      this.connected = false;
      this.connectPromise = null;
    }
  }

  joinConversation(conversationId: string): void {
    if (!this.pusher) return;

    const channelName = `private-conversation.${conversationId}`;

    const channel = this.pusher.subscribe(channelName);

    channel.bind('message.sent', (data: Message) => {
      this.messageSubject.next(data);
    });

    channel.bind('user.typing', (data: { user_id: string; is_typing: boolean }) => {
      this.typingSubject.next({ userId: data.user_id, isTyping: data.is_typing });
    });

    this.channels.set(channelName, channel);
  }

  leaveConversation(conversationId: string): void {
    const channelName = `private-conversation.${conversationId}`;

    if (this.pusher) {
      this.pusher.unsubscribe(channelName);
    }
    this.channels.delete(channelName);
  }

  joinUserChannel(userId: string): void {
    if (!this.pusher) return;

    const channelName = `private-user.${userId}`;
    if (this.channels.has(channelName)) return;

    const channel = this.pusher.subscribe(channelName);

    channel.bind('conversation.created', (data: Conversation) => {
      this.conversationCreatedSubject.next(data);
    });

    channel.bind('conversation.updated', (data: { id: string; type: string; last_message?: Message | null; unread_count?: number | null }) => {
      this.conversationUpdatedSubject.next({
        id: data.id,
        type: data.type,
        lastMessage: data.last_message,
        unreadCount: data.unread_count,
      });
    });

    this.channels.set(channelName, channel);
  }

  leaveUserChannel(userId: string): void {
    const channelName = `private-user.${userId}`;

    if (this.pusher) {
      this.pusher.unsubscribe(channelName);
    }
    this.channels.delete(channelName);
  }

  onMessage(callback: (message: Message) => void): () => void {
    const subscription = this.messageSubject.subscribe(callback);
    return () => subscription.unsubscribe();
  }

  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void): () => void {
    const subscription = this.typingSubject.subscribe(callback);
    return () => subscription.unsubscribe();
  }

  onConversationCreated(callback: (conversation: Conversation) => void): () => void {
    const subscription = this.conversationCreatedSubject.subscribe(callback);
    return () => subscription.unsubscribe();
  }

  onConversationUpdated(callback: (data: { id: string; type: string; lastMessage?: Message | null; unreadCount?: number | null }) => void): () => void {
    const subscription = this.conversationUpdatedSubject.subscribe(callback);
    return () => subscription.unsubscribe();
  }
}
