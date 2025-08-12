import swaggerJsdoc from 'swagger-jsdoc';

const apis =
  process.env.NODE_ENV === 'production' ? ['dist/routes/**/*.js'] : ['src/routes/**/*.ts'];

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Miniintern API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis,
});
