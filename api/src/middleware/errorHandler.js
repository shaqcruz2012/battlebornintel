import { AppError } from '../errors.js';
import logger from '../logger.js';

const isProd = process.env.NODE_ENV === 'production';

export function errorHandler(err, req, res, _next) {
  const requestId = req.id || 'no-id';

  if (err instanceof AppError) {
    // Known operational errors — only log stack for 5xx
    if (err.statusCode >= 500) {
      logger.error('Operational error', { error: err, request_id: requestId, path: req.path, method: req.method });
    } else {
      logger.warn('Client error', { code: err.code, message: err.message, request_id: requestId, path: req.path, method: req.method });
    }
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      requestId,
    });
  }

  // Unexpected errors — always log full stack
  logger.error('Unhandled error', { error: err, request_id: requestId, path: req.path, method: req.method });
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: isProd ? 'Internal server error' : (err.message || 'Internal server error'),
    code: 'INTERNAL_ERROR',
    requestId,
  });
}
