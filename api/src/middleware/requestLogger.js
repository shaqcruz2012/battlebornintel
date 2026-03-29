import logger from '../logger.js';

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      request_id: req.id,
    };
    if (res.statusCode >= 500) {
      logger.error('Request failed', meta);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', meta);
    } else {
      logger.info('Request completed', meta);
    }
  });
  next();
}
