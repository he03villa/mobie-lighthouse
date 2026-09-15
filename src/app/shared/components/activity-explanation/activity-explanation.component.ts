import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { AiAssistantService } from '../../../core/services/ai-assistant';
import { AiActivityExplanationResponse } from '../../../core/models/ai-assistant';

@Component({
  selector: 'app-activity-explanation',
  templateUrl: './activity-explanation.component.html',
  styleUrls: ['./activity-explanation.component.scss'],
  standalone: true,
  imports: [CommonModule, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonSpinner],
})
export class ActivityExplanationComponent {
  @Input() activityId = '';
  @Input() activityName = '';
  isOpen = false;

  private aiService = inject(AiAssistantService);

  loading = false;
  explanation: AiActivityExplanationResponse | null = null;
  error = false;

  constructor() {
    addIcons({ closeOutline });
  }

  async open(): Promise<void> {
    this.isOpen = true;
    if (!this.explanation && this.activityId) {
      await this.loadExplanation();
    }
  }

  close(): void {
    this.isOpen = false;
  }

  async loadExplanation(): Promise<void> {
    this.loading = true;
    this.error = false;
    try {
      this.explanation = await this.aiService.explainActivityAsync(this.activityId);
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }
}
