import pool from '../pool.js';

export async function getAllConstants() {
  const { rows } = await pool.query(`SELECT key, value FROM constants`);
  const result = {};
  for (const r of rows) {
    result[r.key] = r.value;
  }
  return result;
}
