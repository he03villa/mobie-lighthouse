import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import { FieldNote, FieldNoteRequest } from '../models/field-note';
import { environment } from '../../../environments/environment';

const BASE = environment.api.fieldNotes.name;

@Injectable({ providedIn: 'root' })
export class FieldNoteService {
  private api = inject(ApiService);

  listAsync(participantId?: string): Promise<FieldNote[]> {
    const query = participantId ? `?participant_id=${participantId}` : '';
    return firstValueFrom(this.api.get<ApiResponse<FieldNote[]>>(`/${BASE}${query}`)).then(res => res.data);
  }

  getAsync(id: string): Promise<FieldNote> {
    return firstValueFrom(this.api.get<ApiResponse<FieldNote>>(`/${BASE}/${id}`)).then(res => res.data);
  }

  createAsync(data: FieldNoteRequest): Promise<FieldNote> {
    return firstValueFrom(this.api.post<ApiResponse<FieldNote>>(`/${BASE}`, data)).then(res => res.data);
  }
}
