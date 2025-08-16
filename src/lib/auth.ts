import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { verifyJwt, type AuthUser } from '../lib/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    user: AuthUser;
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Authorization 헤더 형식이 올바르지 않습니다.');
  }
  req.user = verifyJwt(h.slice(7));
  next();
}
