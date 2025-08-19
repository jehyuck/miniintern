import { Router } from 'express';
import { authGuard } from '../lib/auth';
import { applicationContrller } from '../controllers/application.controller';

export const applicationRouter = Router();

/**
 * @openapi
 * /applications/mclass/:id:
 *   post:
 *     tags: [Applications]
 *     summary: M클래스 신청
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, format: int64 }
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     applicationId: { type: integer, example: 1 }
 *       '401': { description: Unauthorized }
 *       '404': { description: Not Found }
 *       '409': { description: Conflict (중복/마감/정원초과) }
 */
applicationRouter.post('/mclass/:id', authGuard, applicationContrller.apply);

/**
 * @openapi
 * /applications/me:
 *   get:
 *     tags: [Applications]
 *     summary: 내 신청 내역 조회
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   applicationId: { type: integer }
 *                   mclassId: { type: integer }
 *                   title: { type: string }
 *                   description: { type: string, nullable: true }
 *                   capacity: { type: integer }
 *                   applyDeadline: { type: string, format: date-time }
 *                   startDate: { type: string, format: date-time }
 *                   endDate: { type: string, format: date-time }
 *                   appliedAt: { type: string, format: date-time }
 *       '401': { description: Unauthorized }
 */
applicationRouter.get('/me', authGuard, applicationContrller.listMine);
