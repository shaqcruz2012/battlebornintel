const isProd = process.env.NODE_ENV === 'production';

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const log = {
    timestamp: new Date().toISOString(),
    requestId: req.id,
    method: req.method,
    path: req.path,
    status,
    error: err.message,
  };
  if (!isProd && err.stack) log.stack = err.stack;
  console.error(JSON.stringify(log));

  const body = { error: isProd ? 'Internal server error' : (err.message || 'Internal server error') };
  if (req.id) body.requestId = req.id;
  res.status(status).json(body);
}
