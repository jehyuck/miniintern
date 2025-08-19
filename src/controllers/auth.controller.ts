import { ok } from '../utils/response';
import { authService } from '../services/auth.service';
import type { Handler } from '../utils/http';
import type { UserSignInReqDto } from '../dto/authDto';
import type { CookieOptions } from 'express';
import { DEFAULT_REFRESH_EXPIRES_IN } from '../lib/jwt';

export const refreshCookieName = 'refreshToken';
export const refreshCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  path: '/api/auth/refresh',
  maxAge: DEFAULT_REFRESH_EXPIRES_IN === '30d' ? 30 * 24 * 60 * 60 * 1000 : undefined,
  expires:
    DEFAULT_REFRESH_EXPIRES_IN === '30d'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : undefined,
};

type AuthContoller = {
  signin: Handler<null, UserSignInReqDto>;
};
export const authController = {
  signin: (async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = await authService.signin(req.body);

      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.cookie(refreshCookieName, refreshToken, refreshCookieOpts);

      return res.status(200).json(ok(null));
    } catch (error) {
      next(error);
    }
  }) satisfies Handler<null, UserSignInReqDto>,
} satisfies AuthContoller;
