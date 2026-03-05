import "dotenv/config";
import { getDb, queryAll, run, saveDb } from "../lib/db.js";

async function main() {
  const period = process.argv[2] || "monthly";
  const snapshotDate = new Date().toISOString().slice(0, 10);

  console.log(`\nBBI Snapshot Agent — ${period} snapshot for ${snapshotDate}\n`);

  const db = await getDb();

  // Check if snapshot already exists for this date+period
  const existing = queryAll(db,
    "SELECT COUNT(*) as count FROM entity_snapshots WHERE snapshot_date = ? AND period = ?",
    [snapshotDate, period]
  );
  if (existing[0]?.count > 0) {
    console.log(`Snapshot already exists for ${snapshotDate} (${period}). Skipping.`);
    return;
  }

  // Snapshot all companies
  const companies = queryAll(db, "SELECT * FROM companies");
  let count = 0;

  for (const c of companies) {
    const metrics = {
      funding: c.funding,
      momentum: c.momentum,
      employees: c.employees,
      stage: c.stage,
      sectors: c.sectors,
    };

    run(db, `INSERT INTO entity_snapshots (entity_id, snapshot_date, period, metrics)
             VALUES (?, ?, ?, ?)`, [
      `c_${c.id}`,
      snapshotDate,
      period,
      JSON.stringify(metrics),
    ]);
    count++;
  }

  // Snapshot funds
  const funds = queryAll(db, "SELECT * FROM funds");
  for (const f of funds) {
    const metrics = {
      deployed: f.deployed,
      allocated: f.allocated,
      leverage: f.leverage,
      companies: f.companies,
    };

    run(db, `INSERT INTO entity_snapshots (entity_id, snapshot_date, period, metrics)
             VALUES (?, ?, ?, ?)`, [
      f.id,
      snapshotDate,
      period,
      JSON.stringify(metrics),
    ]);
    count++;
  }

  saveDb(db);
  console.log(`Snapshot complete: ${count} entities captured for ${snapshotDate} (${period})`);
}

main().catch(err => {
  console.error("Snapshot agent failed:", err);
  process.exit(1);
});
