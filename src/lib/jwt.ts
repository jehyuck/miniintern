import jwt, {
  type SignOptions,
  type VerifyOptions,
  type JwtPayload as StdJwtPayload,
} from 'jsonwebtoken';
import { AppError } from '../errors/appError';

export type Role = 'USER' | 'ADMIN' | 'HOST';

export type TokenClaims = Readonly<{ userId: number; role: Role }>;
export type AuthUser = TokenClaims;

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('시크릿 키가 존재하지 않습니다. JWT_SECRET 환경 변수를 설정하세요.');

// env의 TTL이 '2h', '15m' 같은 포맷일 때만 사용, 아니면 '2h'로 폴백
const envAccessTtl = process.env.JWT_ACCESS_TTL;
const envRefreshTtl = process.env.JWT_REFRESH_TTL;

const DEFAULT_EXPIRES_IN: SignOptions['expiresIn'] =
  envAccessTtl && /^\d+(ms|s|m|h|d|y)$/i.test(envAccessTtl)
    ? (envAccessTtl as SignOptions['expiresIn'])
    : '2h';
export const DEFAULT_REFRESH_EXPIRES_IN: SignOptions['expiresIn'] =
  envRefreshTtl && /^\d+(ms|s|m|h|d|y)$/i.test(envRefreshTtl)
    ? (envRefreshTtl as SignOptions['expiresIn'])
    : '30d';

const SIGN_DEFAULTS: SignOptions = {
  algorithm: 'HS256',
  expiresIn: DEFAULT_EXPIRES_IN,
  issuer: 'miniintern',
};

const VERIFY_DEFAULTS: VerifyOptions = {
  algorithms: ['HS256'],
  issuer: 'miniintern',
};

/**
 * 액세스 토큰 발급
 */
export function signJwt(claims: TokenClaims, opts?: SignOptions): string {
  return jwt.sign(claims, SECRET!, { ...SIGN_DEFAULTS, ...opts });
}

export function signAccessToken(claims: TokenClaims): string {
  return signJwt(claims, { expiresIn: DEFAULT_EXPIRES_IN });
}

export function signRefreshToken(claims: TokenClaims): string {
  return signJwt(claims, { expiresIn: DEFAULT_REFRESH_EXPIRES_IN });
}

/** * 액세스 토큰 검증
 * @throws {Error} 토큰이 유효하지 않거나 claims가 올바르지 않은 경우
 */
export function verifyJwt(token: string): AuthUser {
  const decoded = jwt.verify(token, SECRET!, VERIFY_DEFAULTS);
  if (!decoded || typeof decoded !== 'object') {
    throw AppError.unauthorized('토큰이 유효하지 않습니다.');
  }

  const d = decoded as StdJwtPayload & Record<string, unknown>;
  const role = d.role;
  if (typeof d.userId !== 'number') throw AppError.unauthorized('토큰이 유효하지 않습니다.');
  if (role !== 'USER' && role !== 'ADMIN' && role !== 'HOST') {
    throw AppError.unauthorized('토큰이 유효하지 않습니다.');
  }

  return { userId: d.userId, role };
}
