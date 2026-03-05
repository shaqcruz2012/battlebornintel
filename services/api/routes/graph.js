import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const companies = req.queryAll("SELECT * FROM companies").map(r => ({
    ...r, sector: JSON.parse(r.sectors || "[]"), eligible: JSON.parse(r.eligible || "[]"),
  }));
  const entities = req.queryAll("SELECT * FROM entities");
  const edges = req.queryAll("SELECT * FROM edges");
  const listings = req.queryAll("SELECT * FROM listings");

  const fund = req.query.fund;
  const filteredCompanies = (!fund || fund === "all")
    ? companies
    : companies.filter(c => c.eligible.includes(fund));

  const companyIds = new Set(filteredCompanies.map(c => `c_${c.id}`));

  // Keep edges where at least one endpoint is a filtered company
  const filteredEdges = edges.filter(e => companyIds.has(e.source) || companyIds.has(e.target));

  // Collect entity IDs referenced by filtered edges
  const referencedEntityIds = new Set();
  filteredEdges.forEach(e => {
    if (!companyIds.has(e.source)) referencedEntityIds.add(e.source);
    if (!companyIds.has(e.target)) referencedEntityIds.add(e.target);
  });

  const filteredEntities = entities.filter(e => referencedEntityIds.has(e.id));

  const nodes = [];
  filteredCompanies.forEach(c => nodes.push({
    id: `c_${c.id}`, label: c.name, type: "company", stage: c.stage,
    funding: c.funding, momentum: c.momentum, employees: c.employees,
    city: c.city, region: c.region, sector: c.sector, eligible: c.eligible,
    founded: c.founded,
  }));
  filteredEntities.forEach(e => {
    const type = e.category === "graph_fund" ? "fund" : e.category;
    nodes.push({
      id: e.id, label: e.name, type, etype: e.etype, atype: e.atype,
      role: e.role, city: e.city, region: e.region, founded: e.founded,
      note: e.note, companyId: e.company_id,
    });
  });

  // Validate edges — only include edges whose source AND target exist as node IDs
  const nodeIds = new Set(nodes.map(n => n.id));
  const validEdges = filteredEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

  res.json({ nodes, edges: validEdges, listings });
});

export default router;
