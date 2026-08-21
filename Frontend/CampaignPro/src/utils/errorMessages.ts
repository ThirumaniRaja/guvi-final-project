import { isAxiosError } from 'axios';
import type { ApiResponse } from '../types/api';

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    if (!error.response) {
      return 'Network error. Please check your connection and try again.';
    }
    const status = error.response.status;
    const backendMessage = error.response.data?.message;
    switch (status) {
      case 400:
        return backendMessage || 'Please check the information entered.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return backendMessage || 'The requested resource was not found.';
      case 409:
        return backendMessage || 'This record already exists.';
      case 422:
        return backendMessage || 'Please check the information entered.';
      case 429:
        return 'Too many requests. Please try again shortly.';
      case 500:
        return 'Something went wrong. Please try again.';
      default:
        return backendMessage || 'Something went wrong. Please try again.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
