export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
}

export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: Record<string, string[]>;
}
