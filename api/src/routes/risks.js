import { Router } from 'express';
import pool from '../db/pool.js';
import { getRiskData } from '../db/queries/risks.js';
import { computeRiskSignals } from '../engine/risk-signals.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [data, stageRes, stalledRes] = await Promise.all([
      getRiskData(),
      pool.query(`
        SELECT canonical_id, old_value, new_value, changed_at
        FROM entity_state_history
        WHERE change_type = 'stage_change'
          AND changed_at > NOW() - INTERVAL '6 months'
      `),
      pool.query(`
        SELECT er.canonical_id, er.label, er.valid_from
        FROM entity_registry er
        WHERE er.entity_type = 'company'
          AND NOT EXISTS (
            SELECT 1 FROM entity_state_history esh
            WHERE esh.canonical_id = er.canonical_id
              AND esh.change_type != 'created'
              AND esh.changed_at > NOW() - INTERVAL '2 years'
          )
      `),
    ]);

    data.stage_transitions = stageRes.rows;
    data.stalled_companies = stalledRes.rows;

    const result = computeRiskSignals(data);

    // Optional filters
    const { severity, signal_type } = req.query;
    let signals = result.signals;
    if (severity) signals = signals.filter(s => s.severity === severity);
    if (signal_type) signals = signals.filter(s => s.signal_type === signal_type);

    res.json({
      data: {
        portfolio_risk_score: result.portfolioRiskScore,
        risk_grade: result.riskGrade,
        signal_counts: result.signalCounts,
        signals,
        computed_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
