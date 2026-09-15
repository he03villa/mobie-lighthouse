import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonCheckbox,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, chatbubbleOutline } from 'ionicons/icons';
import { ParticipantService } from '../../../core/services/participant';
import { MessagingService } from '../../../core/services/messaging';
import { Participant } from '../../../core/models/participant';
import { ToastService } from '../../../core/services/toast';
import { NavigationService } from '../../../core/services/navigation';

const AVATAR_COLORS = [
  '#4374ad', '#0e8a5f', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#4338ca', '#ea580c',
];

@Component({
  selector: 'app-chat-new-conversation-modal',
  templateUrl: './chat-new-conversation-modal.component.html',
  styleUrls: ['./chat-new-conversation-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonSearchbar,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonCheckbox,
    IonSpinner,
  ],
})
export class ChatNewConversationModalComponent implements OnInit {
  private participantService = inject(ParticipantService);
  private messagingService = inject(MessagingService);
  private toastService = inject(ToastService);
  private nav = inject(NavigationService);
  private modalCtrl = inject(ModalController);

  participants: Participant[] = [];
  filtered: Participant[] = [];
  selectedIds = new Set<string>();
  loading = true;
  creating = false;
  searchTerm = '';

  ngOnInit(): void {
    this.loadParticipants();
  }

  async loadParticipants(): Promise<void> {
    this.loading = true;
    try {
      this.participants = await this.participantService.listAsync();
      this.filtered = [...this.participants];
    } catch {
      this.participants = [];
      this.filtered = [];
    } finally {
      this.loading = false;
    }
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.filtered = this.participants.filter(p =>
      p.full_name.toLowerCase().includes(this.searchTerm)
    );
  }

  toggleSelection(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  getAvatarColor(index: number): string {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  async createConversation(): Promise<void> {
    if (this.selectedIds.size === 0) return;

    this.creating = true;
    try {
      const conversation = await this.messagingService.createConversationAsync({
        participant_ids: Array.from(this.selectedIds),
      });
      this.modalCtrl.dismiss();
      this.nav.forward(`/messages/${conversation.id}`);
    } catch {
      await this.toastService.show('Error al crear la conversación', 'danger');
    } finally {
      this.creating = false;
    }
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
