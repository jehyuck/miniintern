import { Router } from 'express';

export const usersRouter = Router();

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: 회원가입
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 */
usersRouter.post('/', (req, res) => {
  res.status(200).json({ message: '' });
});

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: 회원수정
 *     responses:
 *       '200':
 *         description: OK
 */
usersRouter.patch('/me', (req, res) => {});

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
usersRouter.delete('/me', (req, res) => {});

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
usersRouter.post('/me/host', (req, res) => {});

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
usersRouter.get('/me', (req, res) => {});
