import swaggerJsdoc from 'swagger-jsdoc';

const apis =
  process.env.NODE_ENV === 'production' ? ['dist/routes/**/*.js'] : ['src/routes/**/*.ts'];

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Miniintern API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    tags: [
      { name: 'Health', description: '헬스체크/진단' },
      { name: 'Users', description: '회원가입/내 정보/계정 관리' },
      { name: 'Classes', description: '클래스 CRUD(관리자)' },
      { name: 'Applications', description: '신청/취소/내 신청' },
    ],
    security: [{ bearerAuth: [] }],
  },
  apis,
});
