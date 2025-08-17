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

export type Role = 'USER' | 'HOST' | 'ADMIN';

// 이미 써온 assert 헬퍼(선택): req.user 확정
export function requireUser(
  req: Request,
): asserts req is Request & { user: { userId: number; role: Role } } {
  if (!req.user) throw AppError.unauthorized('인증이 필요합니다.');
}

// 특정 역할만 허용 (여러 개 가능)
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    requireUser(req);
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('접근 권한이 없습니다.');
    }
    next();
  };

// 편의 가드
export const requireHost = requireRole('HOST');
export const requireHostOrAdmin = requireRole('HOST', 'ADMIN');
export const requireAdmin = requireRole('ADMIN');
