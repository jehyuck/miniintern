import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { healthRouter } from './routes/health';

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
  app.get('/health', healthRouter);
  return app;
}
