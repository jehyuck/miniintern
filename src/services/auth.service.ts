import bcrypt from 'bcrypt';
import { UserRepository } from '../repository/users.repository';
import { AppError } from '../errors/appError';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { sha256 } from '../lib/hash';
import { db } from '../db';
import type { UserSignInReqDto, LoginRes } from '../dto/authDto';

export const authService = {
  async signin(input: UserSignInReqDto): Promise<LoginRes> {
    const { email, password } = input;
    if (!email?.trim() || !password?.trim()) {
      throw AppError.badRequest('이메일과 비밀번호는 필수입니다.');
    }

    // 1) 사용자 조회
    const user = await UserRepository.findByEmail(db, email);
    if (!user) {
      throw AppError.unauthorized('일치하는 계정 정보가 없습니다.1');
    }

    // 2) 비밀번호 검증 (DB에 해시가 있다면 bcrypt.compare)
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw AppError.unauthorized('일치하는 계정 정보가 없습니다.2');
    }

    // 3) 토큰 준비 (아직 응답으로 내보내지 않음)
    const claims = { userId: user.userId, role: user.role };
    const refreshToken = signRefreshToken(claims); // 원문
    const refreshHash = sha256(refreshToken); // DB에는 해시 저장

    // 4) 트랜잭션: RT 해시 저장(단일 세션이므로 덮어쓰기)
    await db.transaction(async (tx) => {
      await UserRepository.updateRefreshToken(tx, user.userId, refreshHash);
    });

    // 5) 커밋 성공 이후에만 AT 생성 & RT 반환
    const accessToken = signAccessToken(claims);
    return { accessToken, refreshToken };
  },
};
