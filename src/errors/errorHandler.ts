import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { fail } from '../utils/response';
import type { ErrorCode } from '../errors/appError';

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.status : 500;
  const code = isAppError ? err.code : ('INTERNAL' as ErrorCode);
  const message = isAppError ? err.message : 'Internal Server Error';

  res.status(status).json(fail(code, message, err.details ? err.details : undefined));
}
