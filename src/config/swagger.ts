import swaggerJsdoc from 'swagger-jsdoc';
import merge from 'lodash.merge';
import { baseDoc } from '../docs/base';
import { usersDoc } from '../docs/users';

const apis =
  process.env.NODE_ENV === 'production' ? ['dist/routes/**/*.js'] : ['src/routes/**/*.ts'];

const definition = merge({}, baseDoc, usersDoc); // 나중에 mclassDoc, applicationsDoc 추가
export const swaggerSpec = swaggerJsdoc({
  definition,
  apis,
});
