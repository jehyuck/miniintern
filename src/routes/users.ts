import { ok } from '../utils/response';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { AppError } from '../errors/appError';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

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
usersRouter.post('/', async (req: Request, res: Response) => {
  const { email, password } = (req.body ?? {}) as { email?: string; password?: string };

  if (!email || !password) {
    throw AppError.badRequest();
  }

  const dup = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (dup.length) {
    throw AppError.conflict();
  }

  // insert (해시는 추후)
  const inserted = await db
    .insert(users)
    .values({ email, password })
    .returning({ userId: users.userId });

  return res.status(201).json(ok<{ userId: number }>({ userId: inserted[0].userId }));
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
