import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import { ActivitySubmission } from '../models/submission';
import { environment } from '../../../environments/environment';

const BASE = environment.api.submissions.name;

export interface SubmissionFilters {
  status?: string;
  enrollmentId?: string;
  activityId?: string;
}

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private api = inject(ApiService);

  listAsync(filters: SubmissionFilters = {}): Promise<ActivitySubmission[]> {
    const params = new URLSearchParams();
    if (filters.status) {
      params.set('status', filters.status);
    }
    if (filters.enrollmentId) {
      params.set('enrollment_id', filters.enrollmentId);
    }
    if (filters.activityId) {
      params.set('activity_id', filters.activityId);
    }

    const query = params.toString();
    return firstValueFrom(this.api.get<ApiResponse<ActivitySubmission[]>>(`/${BASE}${query ? `?${query}` : ''}`))
      .then(res => res.data);
  }

  getAsync(id: string): Promise<ActivitySubmission> {
    return firstValueFrom(this.api.get<ApiResponse<ActivitySubmission>>(`/${BASE}/${id}`)).then(res => res.data);
  }

  submitAsync(activityId: string, formData: FormData): Promise<ActivitySubmission> {
    const path = `/activities/${activityId}/${environment.api.submissions.services.submit}`;
    return firstValueFrom(this.api.postFormData<ApiResponse<ActivitySubmission>>(path, formData)).then(res => res.data);
  }

  reviewAsync(id: string, status: 'approved' | 'rejected', observation?: string): Promise<ActivitySubmission> {
    const path = `/${BASE}/${id}/${environment.api.submissions.services.review}`;
    return firstValueFrom(
      this.api.patch<ApiResponse<ActivitySubmission>>(path, { status, observation: observation ?? null }),
    ).then(res => res.data);
  }
}
