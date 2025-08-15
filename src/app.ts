import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { healthRouter } from './routes/health';
import { usersRouter } from './routes/users';
import { errorHandler } from './errors/errorHandler';

let swaggerSpec: any | undefined;
try {
  swaggerSpec = require('./config/swagger').swaggerSpec;
  // eslint-disable-next-line no-empty
} catch {}

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());

  if (swaggerSpec) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
  app.use('/health', healthRouter);

  app.use('/users', usersRouter);

  app.use(errorHandler);
  return app;
}
