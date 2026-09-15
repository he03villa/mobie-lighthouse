import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import {
  AiProgressSummaryResponse,
  AiActivityExplanationResponse,
  AiSuggestActivitiesResponse,
  AiGenerateDraftResponse,
} from '../models/ai-assistant';
import { environment } from '../../../environments/environment';

const BASE = environment.api.ai.name;
const SERVICES = environment.api.ai.services;

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private api = inject(ApiService);

  summarizeProgressAsync(participantId: string): Promise<AiProgressSummaryResponse> {
    return firstValueFrom(
      this.api.post<ApiResponse<AiProgressSummaryResponse>>(`/${BASE}/${SERVICES.summarizeProgress}`, {
        participant_id: participantId,
      })
    ).then(res => res.data);
  }

  suggestActivitiesAsync(activityId: string): Promise<AiSuggestActivitiesResponse> {
    return firstValueFrom(
      this.api.post<ApiResponse<AiSuggestActivitiesResponse>>(`/${BASE}/${SERVICES.suggestActivities}`, {
        activity_id: activityId,
      })
    ).then(res => res.data);
  }

  explainActivityAsync(activityId: string): Promise<AiActivityExplanationResponse> {
    return firstValueFrom(
      this.api.post<ApiResponse<AiActivityExplanationResponse>>(`/${BASE}/${SERVICES.explainActivity}`, {
        activity_id: activityId,
      })
    ).then(res => res.data);
  }

  generateDraftAsync(type: 'goal' | 'activity', context?: Record<string, unknown>): Promise<AiGenerateDraftResponse> {
    return firstValueFrom(
      this.api.post<ApiResponse<AiGenerateDraftResponse>>(`/${BASE}/${SERVICES.generateDraft}`, {
        type,
        context,
      })
    ).then(res => res.data);
  }
}
