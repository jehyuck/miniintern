export const baseDoc = {
  openapi: '3.0.0',
  info: { title: 'Miniintern API', version: '1.0.0' },

  servers: [{ url: 'http://localhost:4000' }],
  tags: [
    { name: 'Health', description: '헬스체크/진단' },
    { name: 'Users', description: '회원가입/내 정보/계정 관리' },
    { name: 'Auth', description: '로그인/리프래쉬 재발급/ 로그아웃' },
    { name: 'Classes', description: '클래스 CRUD(관리자)' },
    { name: 'Applications', description: '신청/취소/내 신청' },
  ],
  security: [{ bearerAuth: [] }],

  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                enum: [
                  'BAD_REQUEST',
                  'UNAUTHORIZED',
                  'FORBIDDEN',
                  'NOT_FOUND',
                  'CONFLICT',
                  'INTERNAL',
                ],
                example: 'BAD_REQUEST',
              },
              message: { type: 'string', example: 'Bad request' },
              details: { nullable: true },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: { code: 'BAD_REQUEST', message: 'Bad request' },
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
            },
          },
        },
      },
      Conflict: {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: {
                code: 'CONFLICT',
                message: 'Conflict',
              },
            },
          },
        },
      },
      // ✅ authGuard 전용 401: 다양한 예시 포함
      Auth_Unauthorized: {
        description: '인증 실패 (토큰 누락/형식 오류/만료/서명 불일치 등)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            examples: {
              missingToken: {
                summary: '토큰 누락',
                value: {
                  success: false,
                  error: { code: 'UNAUTHORIZED', message: '인증 토큰이 필요합니다.' },
                },
              },
              badFormat: {
                summary: 'Bearer 형식 아님',
                value: {
                  success: false,
                  error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authorization 헤더 형식이 올바르지 않습니다.',
                  },
                },
              },
              invalidToken: {
                summary: '서명 불일치/변조',
                value: {
                  success: false,
                  error: { code: 'UNAUTHORIZED', message: '토큰이 유효하지 않습니다.' },
                },
              },
              expiredToken: {
                summary: '만료',
                value: {
                  success: false,
                  error: { code: 'UNAUTHORIZED', message: '토큰이 만료되었습니다.' },
                },
              },
            },
          },
        },
      },
      Auth_Forbidden: {
        description: '인가 실패 (권한 부족)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' },
            },
          },
        },
      },
    },
  },
};
