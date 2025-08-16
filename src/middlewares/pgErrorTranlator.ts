import { AppError } from '../errors/appError';
import type { Request, Response, NextFunction } from 'express';

// Postgres 에러를 AppError로 매핑
export function pgErrorTranslator(
  err: Error | AppError, // 최소한 Error로 지정
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const code = err instanceof Error ? (err as any).code : undefined;

  if (code === '23505') {
    // unique_violation
    return next(AppError.conflict('이미 해당 값이 존재합니다.'));
  }

  return next(err); // 모르는 건 그대로
}
