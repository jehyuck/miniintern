export const authDoc = {
  components: {
    requestBodies: {
      AuthTokenRequest: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'test@example.com' },
                password: { type: 'string', example: 'secret12' },
              },
            },
          },
        },
      },
    },
    responses: {
      AuthTokenIssued: {
        description: '토큰 발급 성공',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['success', 'data'],
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  required: ['accessToken', 'refreshToken'],
                  properties: {
                    accessToken: {
                      description: '엑세스 토큰, 헤더에 담김.',
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                    refreshToken: {
                      description: '리프레시 토큰, httpOnly 쿠키에 담김.',
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
