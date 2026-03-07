import pg from 'pg';
import cfg from '../config.js';

const pool = new pg.Pool({ connectionString: cfg.databaseUrl });

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

export default pool;
