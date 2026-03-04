import { Router } from "express";
import { computeIRS } from "../../../packages/ui-core/src/scoring.js";

const router = Router();

router.get("/ssbci", (req, res) => {
  const ssbciFunds = req.queryAll("SELECT * FROM funds WHERE type = 'SSBCI'");
  const totalDeployed = ssbciFunds.reduce((s, f) => s + f.deployed, 0);
  const totalAllocated = ssbciFunds.reduce((s, f) => s + (f.allocated || 0), 0);
  const avgLeverage = ssbciFunds.filter(f => f.leverage).reduce((s, f) => s + f.leverage, 0) / ssbciFunds.filter(f => f.leverage).length;
  const privateLeveraged = Math.round(totalDeployed * avgLeverage);

  const companies = req.queryAll("SELECT * FROM companies").map(r => ({
    ...r, sector: JSON.parse(r.sectors || "[]"), eligible: JSON.parse(r.eligible || "[]"),
  }));
  const scored = companies.map(computeIRS);
  const ssbciCompanies = scored.filter(c => c.eligible.some(e => ["bbv", "fundnv", "1864"].includes(e)));
  const avgIRS = ssbciCompanies.length ? Math.round(ssbciCompanies.reduce((s, c) => s + c.irs, 0) / ssbciCompanies.length) : 0;

  res.json({
    deployed: totalDeployed,
    allocated: totalAllocated,
    utilization: Math.round(totalDeployed / totalAllocated * 100),
    privateLeveraged,
    avgLeverage: parseFloat(avgLeverage.toFixed(1)),
    portfolioCount: ssbciCompanies.length,
    totalCompanies: companies.length,
    avgIRS,
    funds: ssbciFunds,
  });
});

router.get("/ecosystem", (req, res) => {
  const companies = req.queryAll("SELECT * FROM companies");
  const totalFunding = companies.reduce((s, c) => s + c.funding, 0);
  const totalEmployees = companies.reduce((s, c) => s + c.employees, 0);
  res.json({ totalFunding, totalEmployees, companyCount: companies.length });
});

export default router;
