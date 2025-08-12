import { Router } from 'express';
export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 */
healthRouter.get('/', (_req, res) => res.json({ ok: true }));
