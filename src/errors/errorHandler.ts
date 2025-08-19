import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { fail } from '../utils/response';
import { translatePgError } from '../middlewares/pgErrorTranlator';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const pgMapped = translatePgError(err);

  const appErr =
    pgMapped ?? (err instanceof AppError ? err : AppError.internal('Internal Server Error'));
  if (appErr.status >= 500 && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res
    .status(appErr.status)
    .json(fail(appErr.code, appErr.message, appErr.details ? appErr.details : undefined));
}
