import { Router } from "express";

const router = Router();

// GET /api/snapshots?entity=c_1&period=monthly
router.get("/", (req, res) => {
  const { entity, period } = req.query;
  let sql = "SELECT * FROM entity_snapshots WHERE 1=1";
  const params = [];

  if (entity) { sql += " AND entity_id = ?"; params.push(entity); }
  if (period) { sql += " AND period = ?"; params.push(period); }

  sql += " ORDER BY snapshot_date DESC";

  const snapshots = req.queryAll(sql, params);
  // Parse metrics JSON
  const parsed = snapshots.map(s => ({ ...s, metrics: JSON.parse(s.metrics || "{}") }));
  res.json(parsed);
});

export default router;
