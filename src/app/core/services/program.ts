import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import { Program, ProgramRequest } from '../models/program';
import { environment } from '../../../environments/environment';

const BASE = environment.api.programs.name;

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private api = inject(ApiService);

  listAsync(options: { published?: boolean } = {}): Promise<Program[]> {
    const params = options.published !== undefined ? `?published=${options.published}` : '';
    return firstValueFrom(this.api.get<ApiResponse<Program[]>>(`/${BASE}${params}`)).then(res => res.data);
  }

  getAsync(id: string): Promise<Program> {
    return firstValueFrom(this.api.get<ApiResponse<Program>>(`/${BASE}/${id}`)).then(res => res.data);
  }

  createAsync(data: ProgramRequest): Promise<Program> {
    return firstValueFrom(this.api.post<ApiResponse<Program>>(`/${BASE}`, data)).then(res => res.data);
  }

  updateAsync(id: string, data: ProgramRequest): Promise<Program> {
    return firstValueFrom(this.api.put<ApiResponse<Program>>(`/${BASE}/${id}`, data)).then(res => res.data);
  }

  deleteAsync(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<ApiResponse<null>>(`/${BASE}/${id}`)).then(() => undefined);
  }

  publishAsync(id: string): Promise<Program> {
    return firstValueFrom(this.api.post<ApiResponse<Program>>(`/${BASE}/${id}/${environment.api.programs.services.publish}`))
      .then(res => res.data);
  }

  unpublishAsync(id: string): Promise<Program> {
    return firstValueFrom(this.api.post<ApiResponse<Program>>(`/${BASE}/${id}/${environment.api.programs.services.unpublish}`))
      .then(res => res.data);
  }

  uploadThumbnailAsync(file: File): Promise<string> {
    const path = `/${BASE}/${environment.api.programs.services.thumbnail}`;
    const formData = new FormData();
    formData.append('thumbnail', file);
    return firstValueFrom(this.api.postFormData<ApiResponse<{ url: string }>>(path, formData)).then(res => res.data.url);
  }
}
