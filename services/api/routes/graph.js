import { Router } from "express";
import { getReapPillar } from "../../../packages/ui-core/src/reap.js";

const router = Router();

router.get("/", (req, res) => {
  const companies = req.queryAll("SELECT * FROM companies").map(r => ({
    ...r, sector: JSON.parse(r.sectors || "[]"), eligible: JSON.parse(r.eligible || "[]"),
  }));
  const entities = req.queryAll("SELECT * FROM entities");
  const edges = req.queryAll("SELECT * FROM edges");
  const listings = req.queryAll("SELECT * FROM listings");

  const nodes = [];
  companies.forEach(c => nodes.push({ id: `c_${c.id}`, label: c.name, type: "company", stage: c.stage, funding: c.funding, momentum: c.momentum, employees: c.employees, city: c.city, region: c.region, sector: c.sector, eligible: c.eligible, founded: c.founded }));
  entities.forEach(e => {
    const type = e.category === "graph_fund" ? "fund" : e.category;
    nodes.push({ id: e.id, label: e.name, type, etype: e.etype, atype: e.atype, role: e.role, city: e.city, region: e.region, founded: e.founded, note: e.note, companyId: e.company_id });
  });

  res.json({ nodes, edges, listings });
});

export default router;
