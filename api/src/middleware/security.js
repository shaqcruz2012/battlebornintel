/**
 * Security hardening middleware for CMMC/GovTech compliance.
 * Provides defense-in-depth on top of helmet.
 */

/**
 * Redirect HTTP to HTTPS in production.
 * Checks x-forwarded-proto header (set by reverse proxies / load balancers).
 */
export function enforceHttps(req, res, next) {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
}

/**
 * Additional security headers for defense-in-depth.
 * Some overlap with helmet intentionally — belt-and-suspenders approach.
 */
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}
