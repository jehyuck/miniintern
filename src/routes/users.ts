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
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       '201':
 *         description: Created (userId 반환)
 *       '400':
 *         description: 잘못된 요청(필수값 누락 등)
 *       '409':
 *         description: 이미 존재하는 이메일
 *       '500':
 *         description: 서버 에러
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
