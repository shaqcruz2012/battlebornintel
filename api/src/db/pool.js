import pg from 'pg';
import cfg from '../config.js';
import { logger } from '../logger.js';

// SSL configuration for production/staging environments
const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
  : undefined;

const pool = new pg.Pool({
  connectionString: cfg.databaseUrl,
  max: 20,                           // Railway Postgres allows ~20 concurrent connections
  min: 2,                            // keep 2 warm connections; scale up on demand
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,    // fail fast if DB unreachable
  statement_timeout: 30_000,         // 30 s — graph + risk aggregations need headroom
  application_name: 'bbi-api',
  ...(sslConfig && { ssl: sslConfig }),
});

// Connection lifecycle tracking
let totalConnections = 0;
let activeConnections = 0;
let connectionErrors = 0;

pool.on('connect', () => {
  totalConnections++;
  activeConnections++;
});

pool.on('acquire', () => {
  // Connection checked out from pool
});

pool.on('release', () => {
  // Connection returned to pool
});

pool.on('remove', () => {
  activeConnections--;
});

pool.on('error', (err) => {
  connectionErrors++;
  logger.error('Unexpected pool error:', { error: err });
});

export function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    totalConnections,
    connectionErrors,
  };
}

export default pool;
