export const usersDoc = {
  components: {
    requestBodies: {
      UserSignUp: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'test@example.com' },
                password: { type: 'string', minLength: 6, example: 'secret12' },
              },
            },
          },
        },
      },
    },
    responses: {
      UserCreated: {
        description: 'Created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['success', 'data'],
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  required: ['userId'],
                  properties: { userId: { type: 'integer', example: 123 } },
                },
              },
            },
          },
        },
      },
    },
  },
};
