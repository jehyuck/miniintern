import type { ErrorCode } from '../errors/appError';

export function ok<T>(data: T) {
  return { success: true, data };
}

export function fail(code: ErrorCode, message: string, details?: unknown) {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  };
}
