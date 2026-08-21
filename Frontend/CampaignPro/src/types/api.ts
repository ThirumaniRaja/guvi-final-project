export interface ApiResponse<T> {
  success: boolean;
  errorCode?: string;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string[];
}
