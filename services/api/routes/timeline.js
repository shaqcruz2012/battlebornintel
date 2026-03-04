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

export default router;
