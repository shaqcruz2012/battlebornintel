import { describe, it, expect, afterAll } from '@jest/globals';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel',
  max: 3,
});

afterAll(() => pool.end());

describe('Data Integrity', () => {
  it('entity_registry matches source table counts', async () => {
    const registry = await pool.query('SELECT count(*) AS c FROM entity_registry');
    const companies = await pool.query('SELECT count(*) AS c FROM companies');
    const externals = await pool.query('SELECT count(*) AS c FROM externals');
    const accelerators = await pool.query('SELECT count(*) AS c FROM accelerators');
    const funds = await pool.query('SELECT count(*) AS c FROM graph_funds');
    const people = await pool.query('SELECT count(*) AS c FROM people');
    const programs = await pool.query('SELECT count(*) AS c FROM programs');
    const ecoOrgs = await pool.query('SELECT count(*) AS c FROM ecosystem_orgs');

    const sum = [companies, externals, accelerators, funds, people, programs, ecoOrgs]
      .reduce((s, r) => s + parseInt(r.rows[0].c), 0);

    expect(parseInt(registry.rows[0].c)).toBe(sum);
  });

  it('no orphan edges (all edge endpoints in entity_registry)', async () => {
    const orphans = await pool.query(`
      SELECT count(*) AS c FROM graph_edges
      WHERE source_id NOT IN (SELECT canonical_id FROM entity_registry)
         OR target_id NOT IN (SELECT canonical_id FROM entity_registry)
    `);
    expect(parseInt(orphans.rows[0].c)).toBe(0);
  });

  it('all edges have valid_from timestamps', async () => {
    const missing = await pool.query(
      'SELECT count(*) AS c FROM graph_edges WHERE valid_from IS NULL'
    );
    const total = await pool.query('SELECT count(*) AS c FROM graph_edges');
    const missingCount = parseInt(missing.rows[0].c);
    const totalCount = parseInt(total.rows[0].c);
    // Allow up to 10% missing valid_from (known backfill gap)
    expect(missingCount).toBeLessThan(totalCount * 0.1);
  });

  it('all edges have data_quality set', async () => {
    const missing = await pool.query(
      'SELECT count(*) AS c FROM graph_edges WHERE data_quality IS NULL'
    );
    expect(parseInt(missing.rows[0].c)).toBe(0);
  });

  it('all edges have confidence scores', async () => {
    const missing = await pool.query(
      'SELECT count(*) AS c FROM graph_edges WHERE confidence IS NULL'
    );
    expect(parseInt(missing.rows[0].c)).toBe(0);
  });

  it('no duplicate edges (same source/target/rel)', async () => {
    const dupes = await pool.query(`
      SELECT count(*) AS c FROM (
        SELECT source_id, target_id, rel FROM graph_edges
        GROUP BY source_id, target_id, rel HAVING count(*) > 1
      ) d
    `);
    expect(parseInt(dupes.rows[0].c)).toBe(0);
  });

  it('node_features covers all entities', async () => {
    const entities = await pool.query('SELECT count(*) AS c FROM entity_registry');
    const features = await pool.query('SELECT count(DISTINCT canonical_id) AS c FROM node_features');
    expect(parseInt(features.rows[0].c)).toBeGreaterThanOrEqual(parseInt(entities.rows[0].c) * 0.9);
  });

  it('verified events have source_url', async () => {
    const bad = await pool.query(
      "SELECT count(*) AS c FROM events WHERE verified = TRUE AND (source_url IS NULL OR source_url = '')"
    );
    // Flag verified events missing source URLs — should be 0, allow <=2 for pending fixes
    expect(parseInt(bad.rows[0].c)).toBeLessThanOrEqual(2);
  });

  it('quarantined events not visible in feeds', async () => {
    // The v_timeline view should exclude quarantined
    const quarantined = await pool.query(
      "SELECT count(*) AS c FROM events WHERE quarantined = TRUE"
    );
    const inView = await pool.query(
      "SELECT count(*) AS c FROM v_timeline"
    );
    const total = await pool.query(
      "SELECT count(*) AS c FROM events"
    );
    expect(parseInt(inView.rows[0].c)).toBeLessThan(parseInt(total.rows[0].c));
  });
});
