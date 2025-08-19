// src/errors/appError.ts
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL'
  | 'NOT_IMPLEMENTED'
  | 'UNKNOWN';

export const DefaultMessage: Record<ErrorCode, string> = {
  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  CONFLICT: 'Conflict',
  INTERNAL: 'Internal server error',
  NOT_IMPLEMENTED: 'Not implemented',
  UNKNOWN: 'Unknown error',
};

export class AppError extends Error {
  status: number;
  code: ErrorCode;
  details?: unknown;

  constructor(status: number, code: ErrorCode, message?: string, details?: unknown) {
    super(message ?? DefaultMessage[code]);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  static badRequest(msg?: string, d?: unknown) {
    return new AppError(400, 'BAD_REQUEST', msg, d);
  }
  static unauthorized(msg?: string, d?: unknown) {
    return new AppError(401, 'UNAUTHORIZED', msg, d);
  }
  static forbidden(msg?: string, d?: unknown) {
    return new AppError(403, 'FORBIDDEN', msg, d);
  }
  static notFound(msg?: string, d?: unknown) {
    return new AppError(404, 'NOT_FOUND', msg, d);
  }
  static conflict(msg?: string, d?: unknown) {
    return new AppError(409, 'CONFLICT', msg, d);
  }
  static notImplemented(msg?: string, d?: unknown) {
    return new AppError(501, 'NOT_IMPLEMENTED', msg, d);
  }
  static unknown(msg?: string, d?: unknown) {
    return new AppError(520, 'UNKNOWN', msg, d);
  }
  static internal(msg?: string, d?: unknown) {
    return new AppError(500, 'INTERNAL', msg, d);
  }
}
