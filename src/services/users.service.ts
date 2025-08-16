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
};
