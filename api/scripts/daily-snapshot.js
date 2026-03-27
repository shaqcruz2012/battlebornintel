/**
 * daily-snapshot.js
 *
 * Automated daily snapshot for T-GNN training data generation.
 * - Refreshes materialized views
 * - Runs VACUUM ANALYZE on key tables
 * - Takes a temporal snapshot with full metadata
 * - Stores graph statistics
 * - Backfills historical monthly snapshots if missing
 *
 * Usage: node scripts/daily-snapshot.js
 * Schedule: crontab -e -> 0 2 * * * cd /path/to/api && node scripts/daily-snapshot.js
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5433', 10),
  user: process.env.PGUSER || 'bbi',
  password: process.env.PGPASSWORD || 'bbi_dev_password',
  database: process.env.PGDATABASE || 'battlebornintel',
});

async function refreshViews() {
  console.log('[snapshot] Refreshing materialized views...');
  await pool.query('REFRESH MATERIALIZED VIEW mv_interaction_stream');
  await pool.query('REFRESH MATERIALIZED VIEW mv_node_type_degree');
  console.log('[snapshot] Views refreshed');
}

async function vacuumAnalyze() {
  console.log('[snapshot] Running VACUUM ANALYZE on key tables...');
  await pool.query('VACUUM ANALYZE entity_registry');
  await pool.query('VACUUM ANALYZE graph_edges');
  await pool.query('VACUUM ANALYZE events');
  console.log('[snapshot] VACUUM ANALYZE done');
}

async function takeSnapshot() {
  console.log('[snapshot] Taking temporal snapshot...');

  const snap = await pool.query(`
    INSERT INTO temporal_snapshots (snapshot_at, snapshot_type, node_count, edge_count, metadata)
    SELECT NOW(), 'daily',
      (SELECT count(*) FROM entity_registry WHERE merged_into IS NULL),
      (SELECT count(*) FROM graph_edges WHERE edge_category = 'historical'),
      jsonb_build_object(
        'active_entities', (SELECT count(*) FROM entity_registry WHERE merged_into IS NULL),
        'merged_entities', (SELECT count(*) FROM entity_registry WHERE merged_into IS NOT NULL),
        'total_edges', (SELECT count(*) FROM graph_edges),
        'interactions', (SELECT count(*) FROM mv_interaction_stream),
        'verified_entities', (SELECT count(*) FROM entity_registry WHERE verified = TRUE AND merged_into IS NULL),
        'verified_edges', (SELECT count(*) FROM graph_edges WHERE verified = TRUE),
        'companies_with_scores', (SELECT count(DISTINCT company_id) FROM computed_scores),
        'events_verified', (SELECT count(*) FROM events WHERE verified = TRUE),
        'events_linked', (SELECT count(*) FROM events WHERE entity_id IS NOT NULL AND quarantined = FALSE),
        'avg_confidence', (SELECT round(avg(confidence)::numeric, 3) FROM entity_registry WHERE merged_into IS NULL),
        'source_url_coverage_pct', (SELECT round(count(source_url)::numeric / NULLIF(count(*),0) * 100, 1) FROM graph_edges),
        'communities', (SELECT count(DISTINCT community_id) FROM graph_metrics_cache)
      )
    RETURNING id, snapshot_at, node_count, edge_count
  `);

  const s = snap.rows[0];
  console.log(`[snapshot] Snapshot #${s.id}: ${s.node_count} nodes, ${s.edge_count} edges at ${s.snapshot_at}`);
  return s;
}

async function storeGraphStatistics() {
  console.log('[snapshot] Computing graph statistics...');

  const stats = await pool.query(`
    INSERT INTO graph_statistics (total_nodes, total_edges, avg_degree, density, node_type_dist, edge_type_dist, temporal_coverage)
    SELECT
      (SELECT count(*) FROM entity_registry WHERE merged_into IS NULL),
      (SELECT count(*) FROM graph_edges),
      (SELECT round((2.0 * count(*) / NULLIF((SELECT count(*) FROM entity_registry WHERE merged_into IS NULL), 0))::numeric, 2) FROM graph_edges),
      (SELECT round((2.0 * count(*) / NULLIF((SELECT count(*) FROM entity_registry WHERE merged_into IS NULL) * ((SELECT count(*) FROM entity_registry WHERE merged_into IS NULL) - 1), 0))::numeric, 6) FROM graph_edges),
      (SELECT jsonb_object_agg(entity_type, cnt) FROM (SELECT entity_type, count(*) AS cnt FROM entity_registry WHERE merged_into IS NULL GROUP BY entity_type) t),
      (SELECT jsonb_object_agg(rel, cnt) FROM (SELECT rel, count(*) AS cnt FROM graph_edges GROUP BY rel) t),
      jsonb_build_object(
        'earliest', (SELECT min(valid_from) FROM graph_edges),
        'latest', (SELECT max(valid_from) FROM graph_edges),
        'edges_by_year', (SELECT jsonb_object_agg(yr, cnt) FROM (SELECT EXTRACT(YEAR FROM valid_from)::int AS yr, count(*) AS cnt FROM graph_edges WHERE valid_from IS NOT NULL GROUP BY yr ORDER BY yr) t)
      )
    RETURNING id
  `);

  console.log(`[snapshot] Graph stats #${stats.rows[0].id} stored`);
  return stats.rows[0];
}

async function backfillHistoricalSnapshots() {
  console.log('[snapshot] Checking for historical snapshot backfill...');

  // Count existing backfill snapshots
  const existing = await pool.query(
    "SELECT count(*)::int AS cnt FROM temporal_snapshots WHERE snapshot_type = 'backfill'"
  );

  if (existing.rows[0].cnt > 0) {
    console.log(`[snapshot] Already have ${existing.rows[0].cnt} backfill snapshots, skipping`);
    return existing.rows[0].cnt;
  }

  // Get earliest edge date
  const earliest = await pool.query(
    'SELECT min(valid_from) AS earliest FROM graph_edges WHERE valid_from IS NOT NULL'
  );

  if (!earliest.rows[0].earliest) {
    console.log('[snapshot] No dated edges found, skipping backfill');
    return 0;
  }

  const startDate = earliest.rows[0].earliest;
  console.log(`[snapshot] Backfilling monthly snapshots from ${startDate} to now...`);

  const result = await pool.query(`
    INSERT INTO temporal_snapshots (snapshot_at, snapshot_type, node_count, edge_count, metadata)
    SELECT
      date_trunc('month', gs)::timestamptz AS snap_time,
      'backfill',
      (SELECT count(DISTINCT x.id) FROM (
        SELECT DISTINCT source_id AS id FROM graph_edges WHERE valid_from <= gs
        UNION
        SELECT DISTINCT target_id AS id FROM graph_edges WHERE valid_from <= gs
      ) x),
      (SELECT count(*) FROM graph_edges WHERE valid_from <= gs AND edge_category = 'historical'),
      jsonb_build_object(
        'backfilled', true,
        'generated_at', NOW(),
        'total_edges_at_time', (SELECT count(*) FROM graph_edges WHERE valid_from <= gs),
        'edge_types_at_time', (SELECT jsonb_object_agg(rel, cnt) FROM (
          SELECT rel, count(*) AS cnt FROM graph_edges WHERE valid_from <= gs GROUP BY rel
        ) t)
      )
    FROM generate_series(
      date_trunc('month', $1::timestamptz),
      CURRENT_DATE,
      '1 month'::interval
    ) gs
    RETURNING id
  `, [startDate]);

  console.log(`[snapshot] Backfilled ${result.rowCount} monthly snapshots`);
  return result.rowCount;
}

async function run() {
  const start = Date.now();
  console.log('[snapshot] Starting daily snapshot pipeline...');
  console.log(`[snapshot] Time: ${new Date().toISOString()}`);

  try {
    // 1. Refresh materialized views
    await refreshViews();

    // 2. VACUUM ANALYZE key tables
    await vacuumAnalyze();

    // 3. Take today's snapshot
    await takeSnapshot();

    // 4. Store graph statistics
    await storeGraphStatistics();

    // 5. Backfill historical snapshots if needed
    await backfillHistoricalSnapshots();

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`[snapshot] Pipeline complete in ${elapsed}s`);
  } catch (err) {
    console.error('[snapshot] Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
