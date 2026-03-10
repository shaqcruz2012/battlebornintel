import pg from 'pg';
import cfg from '../config.js';

const pool = new pg.Pool({
  connectionString: cfg.databaseUrl,
  max: 20,
  min: 2,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,   // fail fast if DB unreachable
  statement_timeout: 10_000,        // 10 s hard cap per query
  application_name: 'bbi-api',
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

export default pool;
