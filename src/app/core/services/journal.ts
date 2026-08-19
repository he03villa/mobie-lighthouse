import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import { JournalEntry, JournalEntryRequest } from '../models/journal';
import { environment } from '../../../environments/environment';

const BASE = environment.api.journal.name;

@Injectable({ providedIn: 'root' })
export class JournalService {
  private api = inject(ApiService);

  listAsync(options: { participantId?: string; from?: string; to?: string } = {}): Promise<JournalEntry[]> {
    const params = new URLSearchParams();
    if (options.participantId) params.set('participant_id', options.participantId);
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    const query = params.toString();
    return firstValueFrom(this.api.get<ApiResponse<JournalEntry[]>>(`/${BASE}${query ? `?${query}` : ''}`))
      .then(res => res.data);
  }

  getAsync(id: string): Promise<JournalEntry> {
    return firstValueFrom(this.api.get<ApiResponse<JournalEntry>>(`/${BASE}/${id}`)).then(res => res.data);
  }

  createAsync(data: JournalEntryRequest): Promise<JournalEntry> {
    return firstValueFrom(this.api.post<ApiResponse<JournalEntry>>(`/${BASE}`, data)).then(res => res.data);
  }

  updateAsync(id: string, data: JournalEntryRequest): Promise<JournalEntry> {
    return firstValueFrom(this.api.patch<ApiResponse<JournalEntry>>(`/${BASE}/${id}`, data)).then(res => res.data);
  }

  deleteAsync(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<ApiResponse<null>>(`/${BASE}/${id}`)).then(() => undefined);
  }
}
