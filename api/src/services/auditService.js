import pool from '../db/pool.js';
import { logger } from '../logger.js';

/**
 * Audit action constants.
 */
export const AuditAction = {
  LOGIN:            'LOGIN',
  LOGOUT:           'LOGOUT',
  LOGIN_FAILED:     'LOGIN_FAILED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  ADMIN_RECOMPUTE:  'ADMIN_RECOMPUTE',
  ADMIN_REFRESH:    'ADMIN_REFRESH',
  DATA_EXPORT:      'DATA_EXPORT',
  USER_CREATED:     'USER_CREATED',
  USER_UPDATED:     'USER_UPDATED',
};

/**
 * Insert an audit log entry.
 *
 * @param {number|null} userId
 * @param {string} action
 * @param {string|null} resourceType
 * @param {string|null} resourceId
 * @param {object|null} details
 * @param {import('express').Request} [req] - Express request (for IP / user-agent)
 */
export async function logAuditEvent(userId, action, resourceType, resourceId, details, req) {
  const ipAddress = req?.ip || null;
  const userAgent = req?.headers?.['user-agent'] || null;

  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, action, resource_type, resource_id, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, resourceType, resourceId, ipAddress, userAgent, details ? JSON.stringify(details) : null],
    );
  } catch (err) {
    // Audit logging should never break the request — log and continue
    logger.error('Failed to write audit log', { error: err, action, userId });
  }
}
