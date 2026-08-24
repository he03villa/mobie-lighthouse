import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import { FieldNote } from '../models/field-note';
import { GuardianRequest, Participant, ParticipantRequest } from '../models/participant';
import { environment } from '../../../environments/environment';

const BASE = environment.api.participants.name;

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private api = inject(ApiService);

  listAsync(): Promise<Participant[]> {
    return firstValueFrom(this.api.get<ApiResponse<Participant[]>>(`/${BASE}`)).then(res => res.data);
  }

  myParticipantsAsync(): Promise<Participant[]> {
    return firstValueFrom(this.api.get<ApiResponse<Participant[]>>(`/my/participants`)).then(res => res.data);
  }

  getAsync(id: string): Promise<Participant> {
    return firstValueFrom(this.api.get<ApiResponse<Participant>>(`/${BASE}/${id}`)).then(res => res.data);
  }

  createAsync(data: ParticipantRequest): Promise<Participant> {
    return firstValueFrom(this.api.post<ApiResponse<Participant>>(`/${BASE}`, data)).then(res => res.data);
  }

  updateAsync(id: string, data: Partial<ParticipantRequest>): Promise<Participant> {
    return firstValueFrom(this.api.put<ApiResponse<Participant>>(`/${BASE}/${id}`, data)).then(res => res.data);
  }

  deleteAsync(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<ApiResponse<null>>(`/${BASE}/${id}`)).then(() => undefined);
  }

  addGuardianAsync(participantId: string, guardian: GuardianRequest): Promise<Participant> {
    const path = `/${BASE}/${participantId}/${environment.api.participants.services.guardians}`;
    return firstValueFrom(this.api.post<ApiResponse<Participant>>(path, guardian)).then(res => res.data);
  }

  removeGuardianAsync(participantId: string, userId: string): Promise<void> {
    const path = `/${BASE}/${participantId}/${environment.api.participants.services.guardians}/${userId}`;
    return firstValueFrom(this.api.delete<ApiResponse<null>>(path)).then(() => undefined);
  }

  fieldNotesAsync(participantId: string): Promise<FieldNote[]> {
    const path = `/${BASE}/${participantId}/${environment.api.participants.services.fieldNotes}`;
    return firstValueFrom(this.api.get<ApiResponse<FieldNote[]>>(path)).then(res => res.data);
  }
}
