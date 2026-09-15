import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonNote,
  IonAvatar,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonBadge,
  IonRippleEffect,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  searchOutline,
  checkmarkDoneOutline,
  trashOutline,
} from 'ionicons/icons';
import { MessagingService } from '../../../core/services/messaging';
import { Conversation } from '../../../core/models/message';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';
import { AuthService } from '../../../core/services/auth';
import { WebSocketService } from '../../../core/services/websocket';
import { ToastService } from '../../../core/services/toast';
import { ChatNewConversationModalComponent } from '../chat-new-conversation-modal/chat-new-conversation-modal.component';

const AVATAR_COLORS = [
  '#4374ad', '#0e8a5f', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#4338ca', '#ea580c',
];

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  styleUrls: ['./chat-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonNote,
    IonAvatar,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonBadge,
    IonRippleEffect,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class ChatListPage implements OnInit, OnDestroy {
  private messagingService = inject(MessagingService);
  private nav = inject(NavigationService);
  private authService = inject(AuthService);
  private wsService = inject(WebSocketService);
  private toastService = inject(ToastService);
  private modalCtrl = inject(ModalController);

  loading = true;
  conversations: Conversation[] = [];
  currentUserId = '';
  searchTerm = '';
  filter: 'all' | 'unread' = 'all';
  typingUsers = new Map<string, string>();
  hasResults = true;

  private typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private unsubTyping: (() => void) | null = null;
  private unsubConvCreated: (() => void) | null = null;
  private unsubConvUpdated: (() => void) | null = null;

  get filteredConversations(): Conversation[] {
    let result = this.conversations;

    if (this.filter === 'unread') {
      result = result.filter(c => c.unread_count > 0);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        this.getOtherParticipants(c).some(name => name.toLowerCase().includes(term))
      );
    }

    return result;
  }

  constructor() {
    addIcons({
      addOutline,
      searchOutline,
      checkmarkDoneOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.currentUserId = user?.id ?? '';
  }

  ngOnDestroy(): void {
    this.unsubTyping?.();
    this.unsubConvCreated?.();
    this.unsubConvUpdated?.();
    this.typingTimers.forEach(timer => clearTimeout(timer));
    if (this.currentUserId) {
      this.wsService.leaveUserChannel(this.currentUserId);
    }
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadConversations();
    this.startTypingListener();
    this.startConversationListeners();
  }

  async loadConversations(): Promise<void> {
    this.loading = true;
    try {
      this.conversations = await this.messagingService.listConversationsAsync();
    } catch {
      this.conversations = [];
    } finally {
      this.loading = false;
      this.updateHasResults();
    }
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    await this.loadConversations();
    (event.target as HTMLIonRefresherElement).complete();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.updateHasResults();
  }

  onFilterChange(value: string): void {
    this.filter = value as 'all' | 'unread';
    this.updateHasResults();
  }

  updateHasResults(): void {
    this.hasResults = this.filteredConversations.length > 0;
  }

  openConversation(conversation: Conversation): void {
    this.nav.forward(`/messages/${conversation.id}`);
  }

  async openNewConversation(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ChatNewConversationModalComponent,
      showBackdrop: true,
      cssClass: 'modal-full-height',
    });
    await modal.present();
  }

  getOtherParticipants(conversation: Conversation): string[] {
    return (conversation.participants ?? [])
      .filter(p => p.id !== this.currentUserId)
      .map(p => p.name ?? 'Desconocido');
  }

  getDisplayName(conversation: Conversation): string {
    const names = this.getOtherParticipants(conversation);
    if (names.length === 0) return 'Desconocido';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names[0]}, ${names[1]} y ${names.length - 2} más`;
  }

  getOtherInitial(conversation: Conversation): string {
    const names = this.getOtherParticipants(conversation);
    return names[0]?.charAt(0).toUpperCase() ?? '?';
  }

  getAvatarColor(conversation: Conversation): string {
    const index = this.conversations.indexOf(conversation);
    return AVATAR_COLORS[Math.abs(index) % AVATAR_COLORS.length];
  }

  getLastMessagePreview(conversation: Conversation): string {
    return conversation.last_message?.content ?? 'Sin mensajes';
  }

  formatTime(date: string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('es-MX', { weekday: 'short' });
    }
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }

  getTypingName(conversationId: string): string | null {
    return this.typingUsers.get(conversationId) ?? null;
  }

  async toggleRead(conversation: Conversation, sliding: IonItemSliding): Promise<void> {
    await sliding.close();
    try {
      if (conversation.unread_count > 0) {
        await this.messagingService.markAsReadAsync(conversation.id);
        conversation.unread_count = 0;
      }
    } catch {
      await this.toastService.show('Error al actualizar', 'danger');
    }
  }

  async deleteConversation(conversation: Conversation, sliding: IonItemSliding): Promise<void> {
    await sliding.close();
    try {
      await this.messagingService.deleteConversationAsync(conversation.id);
      this.conversations = this.conversations.filter(c => c.id !== conversation.id);
      this.updateHasResults();
    } catch {
      await this.toastService.show('Error al eliminar', 'danger');
    }
  }

  private startTypingListener(): void {
    this.unsubTyping?.();
    this.unsubTyping = this.wsService.onTyping(({ userId, isTyping }) => {
      if (userId === this.currentUserId) return;

      const conv = this.conversations.find(c =>
        c.participants?.some(p => p.id === userId)
      );
      if (!conv) return;

      const name = conv.participants?.find(p => p.id === userId)?.name ?? '';

      if (isTyping) {
        this.typingUsers.set(conv.id, name);
        this.clearTypingTimer(conv.id);
      } else {
        this.clearTypingTimer(conv.id);
        this.typingUsers.delete(conv.id);
      }
    });
  }

  private startConversationListeners(): void {
    if (!this.currentUserId) return;

    this.wsService.joinUserChannel(this.currentUserId);

    this.unsubConvCreated?.();
    this.unsubConvCreated = this.wsService.onConversationCreated((conversation) => {
      const alreadyExists = this.conversations.some(c => c.id === conversation.id);
      if (!alreadyExists) {
        this.conversations = [conversation, ...this.conversations];
        this.updateHasResults();
      }
    });

    this.unsubConvUpdated?.();
    this.unsubConvUpdated = this.wsService.onConversationUpdated(({ id, type, unreadCount }) => {
      const conv = this.conversations.find(c => c.id === id);
      if (!conv) return;
      if (type === 'last_message') {
        if (unreadCount != null) {
          conv.unread_count = unreadCount;
        } else {
          conv.unread_count += 1;
        }
      }
    });
  }

  private clearTypingTimer(conversationId: string): void {
    const existing = this.typingTimers.get(conversationId);
    if (existing) {
      clearTimeout(existing);
      this.typingTimers.delete(conversationId);
    }

    const timer = setTimeout(() => {
      this.typingUsers.delete(conversationId);
      this.typingTimers.delete(conversationId);
    }, 3000);
    this.typingTimers.set(conversationId, timer);
  }
}
