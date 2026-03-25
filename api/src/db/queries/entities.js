import pool from '../pool.js';

/**
 * Resolve node IDs to { id, label, type } from the unified entity_registry.
 * Replaces the 7-table prefix-dispatch pattern in graph.js and graph-traversal.js.
 *
 * @param {string[]} nodeIds - Array of canonical node IDs (e.g. ['c_42', 'f_ssbci-1'])
 * @returns {Promise<Map<string, {id: string, label: string, type: string}>>}
 */
export async function resolveNodesFromRegistry(nodeIds) {
  if (!nodeIds || nodeIds.length === 0) return new Map();

  const uniqueIds = [...new Set(nodeIds)];
  const nodeMap = new Map();

  try {
    const { rows } = await pool.query(
      `SELECT canonical_id, entity_type, label
       FROM entity_registry
       WHERE canonical_id = ANY($1::text[])`,
      [uniqueIds]
    );

    for (const row of rows) {
      nodeMap.set(row.canonical_id, {
        id: row.canonical_id,
        label: row.label,
        type: row.entity_type,
      });
    }
  } catch (err) {
    console.error('[entities] resolveNodesFromRegistry failed:', err.message);
  }

  // Fallback for unresolved IDs (derived nodes like sectors/regions, or missing data)
  for (const id of uniqueIds) {
    if (!nodeMap.has(id)) {
      const pfx = id.split('_')[0];
      const typeMap = {
        c: 'company', f: 'fund', p: 'person', a: 'accelerator',
        e: 'ecosystem', x: 'external', i: 'external', u: 'external',
        v: 'external', gov: 'external', s: 'sector', r: 'region', ex: 'exchange',
      };
      nodeMap.set(id, { id, label: id, type: typeMap[pfx] || 'unknown' });
    }
  }

  return nodeMap;
}

/**
 * Search entities by text query using the search_vector.
 *
 * @param {string} query - Search text
 * @param {object} opts - { types, limit }
 * @returns {Promise<Array<{id: string, label: string, type: string}>>}
 */
export async function searchEntities(query, { types = [], limit = 20 } = {}) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const tsQuery = query.trim().split(/\s+/).join(' & ');

  let sql = `SELECT canonical_id, entity_type, label
             FROM entity_registry
             WHERE search_vector @@ to_tsquery('english', $1)`;
  const params = [tsQuery];

  if (types.length > 0) {
    sql += ` AND entity_type = ANY($2::text[])`;
    params.push(types);
  }

  sql += ` ORDER BY ts_rank(search_vector, to_tsquery('english', $1)) DESC LIMIT $${params.length + 1}`;
  params.push(safeLimit);

  try {
    const { rows } = await pool.query(sql, params);
    return rows.map(r => ({
      id: r.canonical_id,
      label: r.label,
      type: r.entity_type,
    }));
  } catch (err) {
    console.error('[entities] searchEntities failed:', err.message);
    return [];
  }
}

/**
 * Get entity count by type for diagnostics.
 */
export async function getRegistryStats() {
  try {
    const { rows } = await pool.query(
      `SELECT entity_type, COUNT(*) AS count, SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS verified_count
       FROM entity_registry
       GROUP BY entity_type
       ORDER BY count DESC`
    );
    return rows;
  } catch (err) {
    console.error('[entities] getRegistryStats failed:', err.message);
    return [];
  }
}
