import pg from 'pg';
import cfg from '../config.js';
import { logger } from '../logger.js';

const pool = new pg.Pool({
  connectionString: cfg.databaseUrl,
  max: 20,
  min: 2,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,   // fail fast if DB unreachable
  statement_timeout: 10_000,        // 10 s hard cap per query
  application_name: 'bbi-api',
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
