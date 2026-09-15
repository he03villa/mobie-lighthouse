import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import { Enrollment, Progress } from '../models/enrollment';
import { environment } from '../../../environments/environment';

const BASE = environment.api.enrollments.name;

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private api = inject(ApiService);

  listAsync(): Promise<Enrollment[]> {
    return firstValueFrom(this.api.get<ApiResponse<Enrollment[]>>(`/${BASE}`)).then(res => res.data);
  }

  listByParticipantAsync(participantId: string): Promise<Enrollment[]> {
    return firstValueFrom(this.api.get<ApiResponse<Enrollment[]>>(`/${BASE}?participant_id=${participantId}`)).then(res => res.data);
  }

  getAsync(id: string): Promise<Enrollment> {
    return firstValueFrom(this.api.get<ApiResponse<Enrollment>>(`/${BASE}/${id}`)).then(res => res.data);
  }

  createAsync(participantId: string, programId: string): Promise<Enrollment> {
    return firstValueFrom(
      this.api.post<ApiResponse<Enrollment>>(`/${BASE}`, { participant_id: participantId, program_id: programId }),
    ).then(res => res.data);
  }

  deleteAsync(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<ApiResponse<null>>(`/${BASE}/${id}`)).then(() => undefined);
  }

  progressAsync(id: string): Promise<Progress> {
    const path = `/${BASE}/${id}/${environment.api.enrollments.services.progress}`;
    return firstValueFrom(this.api.get<ApiResponse<Progress>>(path)).then(res => res.data);
  }
}
