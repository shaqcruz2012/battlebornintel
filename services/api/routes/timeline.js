import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const fund = req.query.fund;
  if (!fund || fund === "all") {
    const events = req.queryAll("SELECT * FROM timeline_events ORDER BY date DESC");
    return res.json(events);
  }

  // Get company names for the fund filter
  const companies = req.queryAll("SELECT * FROM companies").map(r => ({
    ...r, eligible: JSON.parse(r.eligible || "[]"),
  }));
  const fundCompanyNames = new Set(
    companies.filter(c => c.eligible.includes(fund)).map(c => c.name)
  );

  const events = req.queryAll("SELECT * FROM timeline_events ORDER BY date DESC");
  const filtered = events.filter(e => fundCompanyNames.has(e.company));
  res.json(filtered);
});

router.get("/pending", (req, res) => {
  const pending = req.queryAll(
    "SELECT * FROM pending_review WHERE target_table = 'timeline_events' AND status = 'pending' ORDER BY created_at DESC"
  );
  const parsed = pending.map(p => ({ ...p, proposed_data: JSON.parse(p.proposed_data || "{}"), sources: JSON.parse(p.sources || "[]") }));
  res.json(parsed);
});

router.post("/:id/verify", (req, res) => {
  const id = parseInt(req.params.id);
  const pending = req.queryOne("SELECT * FROM pending_review WHERE id = ?", [id]);
  if (!pending) return res.status(404).json({ error: "Not found" });

  const data = JSON.parse(pending.proposed_data);
  // Promote to live timeline_events
  req.db.run(
    `INSERT INTO timeline_events (date, type, company, detail, icon, amount, round_type, investors, source_url, confidence, agent_id, created_at, verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.date, data.type, data.company, data.detail, data.icon || "📰", data.amount || null,
     data.round_type || null, data.investors ? JSON.stringify(data.investors) : null,
     null, pending.confidence, pending.agent_id, pending.created_at, 1]
  );

  // Mark as approved
  req.db.run("UPDATE pending_review SET status = 'approved', reviewed_at = ? WHERE id = ?",
    [new Date().toISOString(), id]);

  res.json({ ok: true });
});

export default router;
