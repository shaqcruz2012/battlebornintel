import express from 'express';
import { errorHandler } from '../middleware/errorHandler.js';

export function createApp(router, mountPath) {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);
  app.use(errorHandler);
  return app;
}
