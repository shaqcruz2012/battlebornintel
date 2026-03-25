import pg from 'pg';

// Test database pool — connects to same DB but isolated test concerns
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel',
  max: 3,
});

// Helper to make API requests
export function makeApp() {
  // Dynamic import to avoid module caching issues
  return import('../src/index.js');
}

export { pool };

export async function cleanup() {
  await pool.end();
}
