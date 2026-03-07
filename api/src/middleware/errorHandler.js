export function errorHandler(err, req, res, _next) {
  console.error(`[${req.method} ${req.path}]`, err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}
