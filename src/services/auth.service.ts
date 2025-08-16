import { UserRepository } from '../repository/users.repository';
import { AppError } from '../errors/appError';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import type { LoginRes, UserSignInReqDto } from '../dto/authDto';
import { sha256 } from '../lib/hash';

export const authService = {
  async signin(input: UserSignInReqDto): Promise<LoginRes> {
    const { email, password } = input;
    if (!email?.trim() || !password?.trim()) {
      throw AppError.badRequest('이메일과 비밀번호는 필수입니다.');
    }

    const user = await UserRepository.login(email, password);

    if (!user) {
      throw AppError.unauthorized('일치하는 계정 정보가 없습니다.');
    }
    const claims = { userId: user.userId, role: user.role };
    const accessToken = signAccessToken(claims);
    const refreshToken = signRefreshToken(claims);
    await UserRepository.updateRefreshToken(user.userId, sha256(refreshToken));
    return { accessToken, refreshToken };
  },
};
