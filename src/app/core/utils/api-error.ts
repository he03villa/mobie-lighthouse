import { HttpErrorResponse } from '@angular/common/http';
import { ValidationErrorResponse } from '../models/api-response';

export function extractErrorMessage(error: unknown, fallback: string): string {
  const body = (error as HttpErrorResponse)?.error;
  if (!body || typeof body !== 'object') {
    return fallback;
  }

  const { message, errors } = body as Partial<ValidationErrorResponse>;

  if (errors && Object.keys(errors).length > 0) {
    const first = Object.values(errors).flat()[0];
    if (first) {
      return first;
    }
  }

  return message || fallback;
}

export function extractFieldErrors(error: unknown): Record<string, string[]> {
  const body = (error as HttpErrorResponse)?.error;
  if (body && typeof body === 'object' && (body as ValidationErrorResponse).errors) {
    return (body as ValidationErrorResponse).errors;
  }
  return {};
}
