import { Router } from "express";
import { computeIRS } from "../../../packages/ui-core/src/scoring.js";

const router = Router();

router.get("/", (req, res) => {
  const rows = req.db.prepare("SELECT * FROM companies ORDER BY momentum DESC").all();
  const companies = rows.map(r => ({
    ...r,
    sector: JSON.parse(r.sectors || "[]"),
    eligible: JSON.parse(r.eligible || "[]"),
  }));
  const scored = companies.map(computeIRS).sort((a, b) => b.irs - a.irs);
  res.json(scored);
});

router.get("/:id", (req, res) => {
  const row = req.db.prepare("SELECT * FROM companies WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const company = { ...row, sector: JSON.parse(row.sectors || "[]"), eligible: JSON.parse(row.eligible || "[]") };
  const scored = computeIRS(company);
  const edges = req.db.prepare("SELECT * FROM edges WHERE source = ? OR target = ?").all(`c_${row.id}`, `c_${row.id}`);
  const timeline = req.db.prepare("SELECT * FROM timeline_events WHERE company = ? ORDER BY date DESC").all(row.name);
  res.json({ ...scored, edges, timeline });
});

export default router;
