import pg from 'pg';
import cfg from '../config.js';

const pool = new pg.Pool({
  connectionString: cfg.databaseUrl,
  max: 30,
  min: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,   // fail fast if DB unreachable
  statement_timeout: 30_000,        // 30 s — graph + risk aggregations need headroom
  application_name: 'bbi-api',
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

export default pool;
