import { Router } from 'express';
import { getRiskData } from '../db/queries/risks.js';
import { computeRiskSignals } from '../engine/risk-signals.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getRiskData();
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
