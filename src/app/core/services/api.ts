import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const REQUEST_TIMEOUT = 30000; // 30 seconds

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`).pipe(timeout(REQUEST_TIMEOUT));
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(timeout(REQUEST_TIMEOUT));
  }

  postFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, formData).pipe(timeout(REQUEST_TIMEOUT));
  }

  put<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body).pipe(timeout(REQUEST_TIMEOUT));
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body).pipe(timeout(REQUEST_TIMEOUT));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`).pipe(timeout(REQUEST_TIMEOUT));
  }
}
