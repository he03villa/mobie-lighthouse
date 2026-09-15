import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonSpinner,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, callOutline, videocamOutline, addCircleOutline, micOutline, arrowUp, chatbubbleOutline } from 'ionicons/icons';
import { MessagingService } from '../../../core/services/messaging';
import { WebSocketService } from '../../../core/services/websocket';
import { Message, Conversation } from '../../../core/models/message';
import { AuthService } from '../../../core/services/auth';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ChatBubbleComponent } from '../../../shared/components/chat-bubble/chat-bubble.component';
import { ToastService } from '../../../core/services/toast';

const AVATAR_COLORS = [
  '#4374ad', '#0e8a5f', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#4338ca', '#ea580c',
];

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.page.html',
  styleUrls: ['./chat-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonInput,
    IonSpinner,
    IonButtons,
    IonBackButton,
    LoadingSpinnerComponent,
    ChatBubbleComponent,
  ],
})
export class ChatDetailPage implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLElement>;

  private route = inject(ActivatedRoute);
  private messagingService = inject(MessagingService);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  conversationId = '';
  conversation: Conversation | null = null;
  messages: Message[] = [];
  loading = true;
  sending = false;
  newMessage = '';
  currentUserId = '';
  typingUsers: Set<string> = new Set();
  private scrollToBottom = false;
  private unsubscribeMessage?: () => void;
  private unsubscribeTyping?: () => void;
  private typingTimeout?: ReturnType<typeof setTimeout>;
  private isTypingSent = false;

  constructor() {
    addIcons({ sendOutline, callOutline, videocamOutline, addCircleOutline, micOutline, arrowUp, chatbubbleOutline });
  }

  async ngOnInit(): Promise<void> {
    this.conversationId = this.route.snapshot.paramMap.get('conversationId') ?? '';
    const user = this.authService.getUser();
    this.currentUserId = user?.id ?? '';
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadConversation();
    await this.loadMessages();
    await this.wsService.connect();
    this.wsService.joinConversation(this.conversationId);

    this.unsubscribeMessage = this.wsService.onMessage((message) => {
      if (message.conversation_id === this.conversationId) {
        const alreadyExists = this.messages.some(m => m.id === message.id);
        if (!alreadyExists) {
          this.messages = [...this.messages, message];
          this.scrollToBottom = true;
          this.messagingService.markAsReadAsync(this.conversationId).catch(() => {});
        }
      }
    });

    this.unsubscribeTyping = this.wsService.onTyping((data) => {
      if (data.userId !== this.currentUserId) {
        if (data.isTyping) {
          this.typingUsers.add(data.userId);
        } else {
          this.typingUsers.delete(data.userId);
        }
      }
    });

    this.messagingService.markAsReadAsync(this.conversationId).catch(() => {});
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottom) {
      this.scrollToBottom = false;
      this.scroll();
    }
  }

  ngOnDestroy(): void {
    this.wsService.leaveConversation(this.conversationId);
    this.unsubscribeMessage?.();
    this.unsubscribeTyping?.();
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  }

  async loadConversation(): Promise<void> {
    try {
      this.conversation = await this.messagingService.getConversationAsync(this.conversationId);
    } catch {
      this.conversation = null;
    }
  }

  getParticipantName(): string {
    const other = this.conversation?.participants?.find(p => p.id !== this.currentUserId);
    return other?.name ?? 'Chat';
  }

  getParticipantInitial(): string {
    const name = this.getParticipantName();
    return name.charAt(0).toUpperCase();
  }

  getParticipantStatus(): string {
    return this.hasTypingUsers ? 'escribiendo...' : 'en línea';
  }

  getAvatarColor(): string {
    const hash = this.conversationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }

  async loadMessages(): Promise<void> {
    this.loading = true;
    try {
      const result = await this.messagingService.listMessagesAsync(this.conversationId);
      this.messages = Array.isArray(result) ? result : [];
      this.scrollToBottom = true;
    } catch {
      this.messages = [];
    } finally {
      this.loading = false;
    }
  }

  async sendMessage(): Promise<void> {
    const content = this.newMessage.trim();
    if (!content || this.sending) return;

    this.sending = true;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: this.conversationId,
      sender_user_id: this.currentUserId,
      content,
      created_at: new Date().toISOString(),
      sender: { id: this.currentUserId, name: '', email: '', is_super_admin: false },
    };

    this.messages = [...this.messages, optimisticMessage];
    this.newMessage = '';
    this.scrollToBottom = true;

    try {
      const sent = await this.messagingService.sendMessageAsync(this.conversationId, { content });
      this.messages = Array.isArray(this.messages)
        ? this.messages.map(m => m.id === tempId ? sent : m)
        : [];
    } catch {
      this.messages = Array.isArray(this.messages)
        ? this.messages.filter(m => m.id !== tempId)
        : [];
      await this.toast.show('Error al enviar mensaje');
    } finally {
      this.sending = false;
    }

    this.sendTyping(false);
  }

  onInputChange(): void {
    if (!this.isTypingSent) {
      this.sendTyping(true);
      this.isTypingSent = true;
    }
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
    this.sendTyping(false);
    this.isTypingSent = false;
      this.isTypingSent = false;
    }, 2000);
  }

  private sendTyping(isTyping: boolean): void {
    this.messagingService.sendTypingAsync(this.conversationId, isTyping).catch(() => {});
  }

  private scroll(): void {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch {}
  }

  get hasTypingUsers(): boolean {
    return this.typingUsers.size > 0;
  }
}
