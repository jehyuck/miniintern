export const baseDoc = {
  openapi: '3.0.0',
  info: { title: 'Miniintern API', version: '1.0.0' },

  servers: [{ url: 'http://localhost:4000' }],
  tags: [
    { name: 'Health', description: '헬스체크/진단' },
    { name: 'Users', description: '회원가입/내 정보/계정 관리' },
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
    },
  },
};
