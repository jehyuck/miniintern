import { Router } from 'express';
import { AppError } from '../errors/appError';
import { usersController } from '../controllers/users.controller';

export const usersRouter = Router();

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: 회원가입
 *     requestBody:
 *       $ref: '#/components/requestBodies/UserSignUp'
 *     responses:
 *       201: { $ref: '#/components/responses/UserCreated' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
usersRouter.post('/', usersController.signup);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: 회원수정
 *     responses:
 *       '200':
 *         description: OK
 *
 */
usersRouter.patch('/me', async (req, res) => {
  throw AppError.notImplemented();
});

/**
 * @openapi
 * /users/me:
 *   delete:
 *     tags: [Users]
 *     summary: 회원삭제
 *     responses:
 *       '200':
 *         description: OK
 */
usersRouter.delete('/me', async (req, res) => {
  throw AppError.notImplemented();
});

/**
 * @openapi
 * /users/me/host:
 *   post:
 *     tags: [Users]
 *     summary: 호스트 신청
 *     responses:
 *       '200':
 *         description: OK
 */
usersRouter.post('/me/host', async (req, res) => {
  throw AppError.notImplemented();
});

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: 상세정보 조회
 *     responses:
 *       '200':
 *         description: OK
 */
usersRouter.get('/me', async (req, res) => {
  throw AppError.notImplemented();
});
