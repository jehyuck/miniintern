import { Router } from 'express';
import { AppError } from '../errors/appError';
import { authGuard, requireHost } from '../lib/auth';
import { mClassController } from '../controllers/mclass.controller';

export const mclassRouter = Router();

/**
 * @openapi
 * /mclass:
 *   get:
 *     tags: [Mclass]
 *     summary: mclass 리스트 조회
 *     description: |
 *        mclass리스트를 조회하는 api입니다.
 *     security: []
 *     requestBody:
 *     responses:
 *        '500': {$ref: '#/components/responses/NotImplemented' }
 */
mclassRouter.get('', async (req, res) => {
  throw AppError.notImplemented();
});

/**
 * @openapi
 * /mclass:
 *   post:
 *     tags: [Mclass]
 *     summary: mclass 등록
 *     description: |
 *        mclass리스트를 등록하는 api입니다. 이는 Host권한을 가진 유저만 등록 가능합니다.
 *     requestBody:
 *        $ref: {'#/components/requestBodies/MclassCreate'}
 *     responses:
 *        '201': {$ref: '#/components/responses/MclassCreated201'}
 *        '400': {$ref: '#/components/responses/BadRequest'}
 *        '401': {$ref: '#/components/responses/Unauthorized'}
 *        '409': {$ref: '#/components/responses/Conflict'}
 */
mclassRouter.post('', authGuard, requireHost, mClassController.create);

/**
 * @openapi
 * /mclass:
 *   patch:
 *     tags: [Mclass]
 *     summary: mclass 등록
 *     description: |
 *        mclass리스트를 수정하는 api입니다. 이는 Host권한을 가지며, 소유권을 가진 유저만 수정 가능합니다.
 *     requestBody:
 *     responses:
 *        '500': {$ref: '#/components/responses/NotImplemented' }
 */
mclassRouter.patch('', async (req, res) => {
  throw AppError.notImplemented();
});

/**
 * @openapi
 * /mclass:
 *   delete:
 *     tags: [Mclass]
 *     summary: mclass 삭제
 *     description: |
 *        mclass리스트를 삭제하는 api입니다. 이는 Host권한을 가지며, 소유권을 가진 유저만 삭제 가능합니다.
 *     requestBody:
 *     responses:
 *        '500': {$ref: '#/components/responses/NotImplemented' }
 */
mclassRouter.delete('', async (req, res) => {
  throw AppError.notImplemented();
});
