import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { Message } from '../../../core/models/message';

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class ChatBubbleComponent {
  @Input() message!: Message;
  @Input() isOwn = false;

  constructor() {
    addIcons({ checkmarkOutline, checkmarkDoneOutline });
  }

  get senderName(): string {
    return this.message.sender?.name ?? 'Desconocido';
  }

  get formattedTime(): string {
    if (!this.message.created_at) return '';
    const date = new Date(this.message.created_at);
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  get isRead(): boolean {
    return !!this.message.read_at;
  }
}
