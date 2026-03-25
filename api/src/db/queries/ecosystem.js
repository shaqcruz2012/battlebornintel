import pool from '../pool.js';

/**
 * Get ecosystem map data — all non-company entities formatted for bubble chart.
 * Returns accelerators, funds, programs, ecosystem_orgs with display coordinates.
 */
export async function getEcosystemMap() {
  const { rows } = await pool.query(`
    SELECT
      er.canonical_id AS id,
      er.label AS name,
      er.entity_type AS type,
      er.confidence,
      er.verified,
      er.display_x AS x,
      er.display_y AS y,
      COALESCE(er.display_size, 2.0) AS size,
      er.display_category AS cat,
      er.display_track AS track,
      -- Additional detail from source tables
      a.accel_type, a.city AS accel_city, a.region AS accel_region, a.founded AS accel_founded,
      eo.entity_type AS eco_type, eo.city AS eco_city, eo.region AS eco_region,
      p.program_type, p.budget_m,
      gf.fund_type,
      -- Graph connectivity
      (SELECT count(*) FROM graph_edges ge
       WHERE ge.source_id = er.canonical_id OR ge.target_id = er.canonical_id) AS edge_count
    FROM entity_registry er
    LEFT JOIN accelerators a ON er.source_table = 'accelerators' AND er.source_table_id = a.id
    LEFT JOIN ecosystem_orgs eo ON er.source_table = 'ecosystem_orgs' AND er.source_table_id = eo.id
    LEFT JOIN programs p ON er.source_table = 'programs' AND er.source_table_id = p.id::text
    LEFT JOIN graph_funds gf ON er.source_table = 'graph_funds' AND er.source_table_id = gf.id
    WHERE er.entity_type IN ('accelerator', 'fund', 'program', 'ecosystem_org', 'gov_agency', 'university')
    ORDER BY er.entity_type, er.label
  `);

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    x: r.x,
    y: r.y,
    size: parseFloat(r.size),
    cat: r.cat || r.type,
    track: r.track || 'Hybrid',
    confidence: r.confidence,
    verified: r.verified,
    edgeCount: parseInt(r.edge_count),
    detail: {
      accelType: r.accel_type,
      city: r.accel_city || r.eco_city,
      region: r.accel_region || r.eco_region,
      founded: r.accel_founded,
      programType: r.program_type,
      budgetM: r.budget_m ? parseFloat(r.budget_m) : null,
      fundType: r.fund_type,
      ecoType: r.eco_type,
    },
  }));
}

/**
 * Get unified ecosystem gaps — combines framework gaps with structural analysis.
 */
export async function getEcosystemGapsUnified() {
  // Get company counts per stage for gap severity validation
  const stageCounts = await pool.query(`
    SELECT stage, count(*) AS cnt,
           avg(momentum) AS avg_momentum,
           sum(CASE WHEN funding_m < 5 THEN 1 ELSE 0 END) AS underfunded
    FROM companies
    GROUP BY stage
  `);

  // Get Series B+ investor coverage
  const seriesBCoverage = await pool.query(`
    SELECT count(DISTINCT ge.target_id) AS companies_with_b_investors
    FROM graph_edges ge
    JOIN companies c ON 'c_' || c.id = ge.target_id
    WHERE ge.rel = 'invested_in'
      AND c.stage IN ('series_b', 'series_c_plus')
      AND ge.edge_category = 'historical'
  `);

  // Get gap interventions
  const interventions = await pool.query(`
    SELECT * FROM gap_interventions ORDER BY created_at DESC LIMIT 50
  `);

  return {
    stageDistribution: stageCounts.rows.map(r => ({
      stage: r.stage,
      count: parseInt(r.cnt),
      avgMomentum: parseFloat(r.avg_momentum || 0),
      underfunded: parseInt(r.underfunded),
    })),
    seriesBCoverage: parseInt(seriesBCoverage.rows[0]?.companies_with_b_investors || 0),
    interventions: interventions.rows,
  };
}

/**
 * Propose a gap intervention (bridge between communities).
 */
export async function proposeIntervention({ gapType, gapName, bridgeId, communityA, communityB, proposedBy, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO gap_interventions (gap_type, gap_name, proposed_bridge_id, target_community_a, target_community_b, proposed_by, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [gapType, gapName, bridgeId, communityA, communityB, proposedBy, notes]
  );
  return rows[0];
}
