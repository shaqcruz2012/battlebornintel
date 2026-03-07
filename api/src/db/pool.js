import pg from 'pg';
import cfg from '../config.js';

const pool = new pg.Pool({
  connectionString: cfg.databaseUrl,
  max: 20,
  min: 2,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 10_000,
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

export default pool;
