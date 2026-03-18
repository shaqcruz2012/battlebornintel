import jwt from 'jsonwebtoken';
import cfg from '../config.js';

export function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const user = jwt.verify(token, cfg.jwtSecret);
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Optional auth — sets req.user if token present, but doesn't block
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, cfg.jwtSecret); } catch {}
  }
  next();
}
