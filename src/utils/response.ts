import type { ErrorCode } from '../errors/appError';

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = {
  success: false;
  error: { code: ErrorCode; message: string; details?: unknown };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function fail(code: ErrorCode, message: string, details?: unknown): ApiError {
  return { success: false, error: { code, message, ...(details ? { details } : {}) } };
}
