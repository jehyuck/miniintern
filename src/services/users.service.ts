import { UserRepository } from '../repository/users.repository';
import { AppError } from '../errors/appError';
import type { UserSignupReqDto, UserCreatedRes } from '../dto/usersDto';

export const UsersService = {
  async signUp(input: UserSignupReqDto): Promise<UserCreatedRes> {
    const { email, password } = input;
    if (!email?.trim() || !password?.trim()) {
      throw AppError.badRequest('이메일과 비밀번호는 필수입니다.');
    }
    const dup = await UserRepository.findByEmail(email);
    if (dup.length) throw AppError.conflict('이미 이메일이 존재합니다.');

    const [{ userId }] = await UserRepository.create(email, password); // 해시는 다음 브랜치에서
    return { userId };
  },
};
