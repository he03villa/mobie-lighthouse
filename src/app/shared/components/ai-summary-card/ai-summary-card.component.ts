import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonSpinner } from '@ionic/angular/standalone';
import { AiAssistantService } from '../../../core/services/ai-assistant';
import { AiProgressSummaryResponse } from '../../../core/models/ai-assistant';
import { NavigationService } from '../../../core/services/navigation';

@Component({
  selector: 'app-ai-summary-card',
  templateUrl: './ai-summary-card.component.html',
  styleUrls: ['./ai-summary-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonSpinner],
})
export class AiSummaryCardComponent implements OnInit {
  @Input() participantId = '';
  @Input() participantName = '';

  private aiService = inject(AiAssistantService);
  private nav = inject(NavigationService);

  loading = true;
  summary: AiProgressSummaryResponse | null = null;
  error = false;

  ngOnInit(): void {
    if (this.participantId) {
      this.loadSummary();
    }
  }

  async loadSummary(): Promise<void> {
    this.loading = true;
    this.error = false;
    try {
      this.summary = await this.aiService.summarizeProgressAsync(this.participantId);
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  goToParticipant(): void {
    this.nav.forward(`/participants/${this.participantId}`);
  }
}
