import { Router } from 'express';
import { AppError } from '../errors/appError';
import { authGuard } from '../lib/auth';
import { authController } from '../controllers/auth.controller';

export const authRouter = Router();

/**
 * @openapi
 * /auth/token:
 *   post:
 *     tags: [Auth]
 *     summary: 로그인
 *     description: |
 *       로그인 API입니다. 이메일과 비밀번호를 통해 사용자를 인증하고, JWT 토큰을 반환합니다.
 *       성공 시 `Authorization` 헤더에 Bearer 토큰이 포함됩니다.
 *     security: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/AuthTokenRequest'
 *     responses:
 *       '200': {$ref: '#/components/responses/AuthTokenIssued'}
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 */
authRouter.post('/token', authController.signin);

/**
 * @openapi
 * /auth/token/refresh:
 *   post:
 *    tags: [Auth]
 *    summary: 토큰 재발급
 *    description:
 *       Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.
 *       성공 시 `Authorization` 헤더에 Bearer 토큰이 포함됩니다.
 */
authRouter.post('/refresh', async (req, res) => {
  throw AppError.notImplemented();
});

/**
 * @openapi
 * /auth/token:
 *  delete:
 *    tags: [Auth]
 *    summary: 로그아웃
 *    description:
 *      로그아웃 API입니다. 현재 사용자의 Access Token과 Refresh Token을 무효화합니다.
 *    responses:
 *     '204':
 *      description: 로그아웃 성공
 *     '401':
 *      description: 인증되지 않은 사용자
 * */
authRouter.delete('/token', authGuard, async (req, res) => {
  throw AppError.notImplemented();
});
