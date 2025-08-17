export const mclassDoc = {
  components: {
    requestBodies: {
      MclassCreate: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'capacity', 'applyDeadline', 'startDate', 'endDate'],
              properties: {
                title: { type: 'string', example: '알고리즘 스터디' },
                description: { type: 'string', example: '기초부터 심화까지' },
                capacity: { type: 'integer', minimum: 1, example: 50 },
                applyDeadline: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-09-01T08:59:00+09:00',
                },
                startDate: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-09-01T09:00:00+09:00',
                },
                endDate: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-09-01T11:00:00+09:00',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      MclassCreated201: {
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
                  required: ['mclassId'],
                  properties: { mclassId: { type: 'integer', example: 1 } },
                },
              },
            },
          },
        },
      },
      MclassGetAll: {
        description: 'mclass 전부 조회',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'mclassId',
                  'title',
                  'capacity',
                  'applyDeadline',
                  'startDate',
                  'endDate',
                ],
                properties: {
                  mclassId: { type: 'integer', format: 'int64', example: 1 }, // ← 수정
                  title: { type: 'string', example: '알고리즘 스터디' },
                  description: { type: 'string', nullable: true, example: '기초부터 심화까지' },
                  capacity: { type: 'integer', minimum: 1, example: 50 },
                  applyDeadline: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-09-01T08:59:00+09:00',
                  },
                  startDate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-09-01T09:00:00+09:00',
                  },
                  endDate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-09-01T11:00:00+09:00',
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
