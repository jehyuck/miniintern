import { ok } from '../utils/response';
import { UsersService } from '../services/users.service';
import type { Handler } from '../utils/http';
import type { UserCreatedRes, UserPatchReqDto, UserSignupReqDto } from '../dto/usersDto';
import type { LoginRes } from '../dto/authDto';
import { refreshCookieName, refreshCookieOpts } from './auth.controller';

type UsersController = {
  signup: Handler<UserCreatedRes, UserSignupReqDto>;
  patchMe: Handler<null, UserPatchReqDto>;
  applyHost: Handler<null, LoginRes>;
};

export const usersController = {
  signup: (async (req, res) => {
    const { userId } = await UsersService.signUp(req.body);
    res.status(201).json(ok({ userId }));
  }) satisfies Handler<UserCreatedRes, UserSignupReqDto>,
  patchMe: (async (req, res) => {
    await UsersService.patchMe(req.user.userId, req.body);
    return res.status(204).json(ok(null));
  }) satisfies Handler<null, UserPatchReqDto>,
  applyHost: (async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = await UsersService.applyHost(req.user);

      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.cookie(refreshCookieName, refreshToken, refreshCookieOpts);

      return res.status(200).json(ok(null));
    } catch (error) {
      next(error);
    }
  }) satisfies Handler<null, LoginRes>,
} satisfies UsersController;
