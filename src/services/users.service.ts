import { UserRepository } from '../repository/users.repository';
import { AppError } from '../errors/appError';
import type { UserSignupReqDto, UserCreatedRes } from '../dto/usersDto';
import { db } from '../db';
import bcrypt from 'bcrypt';
import type { AuthUser } from '../lib/jwt';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import type { LoginRes } from '../dto/authDto';
import { sha256 } from '../lib/hash';
import type { Role } from '../lib/jwt';

type JwtPrincipal = { userId: number; role: Role };

export const UsersService = {
  async signUp(input: UserSignupReqDto): Promise<UserCreatedRes> {
    const { email, password } = input;
    if (!email?.trim() || !password?.trim()) {
      throw AppError.badRequest('이메일과 비밀번호는 필수입니다.');
    }
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
    const hashed = await bcrypt.hash(password, saltRounds);

    return await db.transaction(async (tx) => {
      const dup = await UserRepository.findByEmail(tx, email);
      if (dup) {
        throw AppError.conflict('이미 이메일이 존재합니다.');
      }

      const [{ userId }] = await UserRepository.create(tx, email, hashed);
      return { userId };
    });
  },
  async patchMe(
    userId: number,
    input: { currentPassword?: string; newPassword?: string },
  ): Promise<undefined> {
    const cur = input.currentPassword?.trim();
    const next = input.newPassword?.trim();

    if (cur === next) {
      throw AppError.badRequest('현재 비밀번호와 새 비밀번호가 동일합니다.');
    }

    if (!cur || !next) {
      throw AppError.badRequest('현재 비밀번호와 새 비밀번호가 필요합니다.');
    }

    const me = await UserRepository.findById(db, userId);
    if (!me) throw AppError.notFound('유저를 찾을 수 없습니다.');

    const ok = await bcrypt.compare(cur, me.password);
    if (!ok) throw AppError.unauthorized('현재 비밀번호가 일치하지 않습니다.');

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
    const hashed = await bcrypt.hash(next, saltRounds);

    await db.transaction(async (tx) => {
      await UserRepository.updatePassword(tx, userId, hashed);
    });
    return;
  },

  async applyHost(user: AuthUser): Promise<LoginRes> {
    // 1) DB 기준 상태 확인 (토큰 role은 신뢰 X)
    const me = await UserRepository.findById(db, user.userId);
    if (!me) throw AppError.notFound('유저를 찾을 수 없습니다.');
    if (me.role === 'HOST' || me.role === 'ADMIN') {
      throw AppError.badRequest('이미 호스트 권한이 있습니다.');
    }

    // 해시 준비 (아직 반환 금지)
    const nextPrincipal: JwtPrincipal = { userId: me.userId, role: 'HOST' };
    const refreshTokenPlain = signRefreshToken(nextPrincipal); // 평문
    const refreshHash = sha256(refreshTokenPlain); // DB 저장용 해시

    // 3) 하나의 트랜잭션으로 role 변경 + RT 해시 저장
    const updated = await db.transaction(async (tx) => {
      const [u] = await UserRepository.updateRole(tx, me.userId, 'HOST');
      await UserRepository.updateRefreshToken(tx, me.userId, refreshHash);
      return u;
    });

    // 4) 커밋 성공 이후에만 새 AT/RT 발급 반환
    const accessToken = signAccessToken(updated); // AT는 최신 role 반영
    return { accessToken, refreshToken: refreshTokenPlain };
  },
};
