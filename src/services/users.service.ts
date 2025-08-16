import { UserRepository } from '../repository/users.repository';
import { AppError } from '../errors/appError';
import type { UserSignupReqDto, UserCreatedRes } from '../dto/usersDto';
import { db } from '../db';
import bcrypt from 'bcrypt';

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
};
