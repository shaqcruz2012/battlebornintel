import { Router } from "express";

const router = Router();

// GET /api/enrichment/pending — all quarantined items
router.get("/pending", (req, res) => {
  const pending = req.queryAll(
    "SELECT * FROM pending_review WHERE target_table IN ('entities', 'edges', 'new_entity') AND status = 'pending' ORDER BY created_at DESC"
  );
  const parsed = pending.map(p => ({
    ...p,
    proposed_data: JSON.parse(p.proposed_data || "{}"),
    sources: JSON.parse(p.sources || "[]"),
  }));
  res.json(parsed);
});

// POST /api/enrichment/:id/approve — promote to live tables
router.post("/:id/approve", (req, res) => {
  const id = parseInt(req.params.id);
  const pending = req.queryOne("SELECT * FROM pending_review WHERE id = ?", [id]);
  if (!pending) return res.status(404).json({ error: "Not found" });
  if (pending.status !== "pending") return res.status(400).json({ error: "Already reviewed" });

  const data = JSON.parse(pending.proposed_data);
  const now = new Date().toISOString();

  try {
    if (pending.target_table === "entities") {
      // Entity enrichment — apply COALESCE update with rich note
      const entityId = data.entity_id;
      if (entityId) {
        // Build note from LLM-extracted details (same logic as applyEnrichment)
        const parts = [];
        if (data.investment_thesis) parts.push(data.investment_thesis);
        if (data.stage_focus && data.stage_focus.length > 0) {
          parts.push(`Stage: ${data.stage_focus.join(", ")}`);
        }
        if (data.sector_focus && data.sector_focus.length > 0) {
          parts.push(`Sectors: ${data.sector_focus.join(", ")}`);
        }
        if (data.fund_size_millions) {
          parts.push(`Fund size: $${data.fund_size_millions}M`);
        }
        if (data.aum_millions) {
          parts.push(`AUM: $${data.aum_millions}M`);
        }
        if (data.key_partners && data.key_partners.length > 0) {
          const names = data.key_partners.map(p => p.name).join(", ");
          parts.push(`Key partners: ${names}`);
        }
        const newNote = parts.join(". ");

        req.db.run(
          `UPDATE entities SET
             city = COALESCE(city, ?),
             region = COALESCE(region, ?),
             founded = COALESCE(founded, ?),
             note = CASE WHEN (note IS NULL OR LENGTH(note) < 50) AND ? != '' THEN ? ELSE note END
           WHERE id = ?`,
          [data.hq_city || null, data.hq_state || null, data.founding_year || null,
           newNote, newNote, entityId]
        );
      }
    } else if (pending.target_table === "edges") {
      // Edge — insert into edges table
      req.db.run(
        `INSERT INTO edges (source, target, rel, note, year) VALUES (?, ?, ?, ?, ?)`,
        [data.source, data.target, data.rel, data.note || null, data.year || null]
      );
    } else if (pending.target_table === "new_entity") {
      // New entity — atomic insert of entity + edges (no-orphan enforcement)
      const entity = data.entity;
      const relationships = data.relationships || [];

      if (relationships.length === 0) {
        return res.status(400).json({ error: "Cannot approve entity with zero edges (orphan protection)" });
      }

      // Generate entity id
      const prefix = entity.etype === "Accelerator" ? "a_" : "x_";
      const slug = entity.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").substring(0, 30);
      const entityId = `${prefix}${slug}`;

      // Wrap in transaction for atomicity
      req.db.run("BEGIN TRANSACTION");
      try {
        // Insert entity
        req.db.run(
          `INSERT INTO entities (id, name, category, etype, city, region, founded, note)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [entityId, entity.name, entity.etype === "Accelerator" ? "accelerator" : "external",
           entity.etype, entity.city || null, entity.region || null, entity.founded || null, entity.note || null]
        );

        // Insert edges (resolve target names to IDs)
        for (const rel of relationships) {
          let target = req.queryOne("SELECT id FROM entities WHERE name = ?", [rel.target_name]);
          if (!target) {
            target = req.queryOne("SELECT CAST(id AS TEXT) as id FROM companies WHERE name = ?", [rel.target_name]);
          }
          if (target) {
            req.db.run(
              `INSERT INTO edges (source, target, rel, note, year) VALUES (?, ?, ?, ?, ?)`,
              [entityId, target.id, rel.rel_type, rel.note || null, rel.year || null]
            );
          }
        }

        req.db.run("COMMIT");
      } catch (txErr) {
        req.db.run("ROLLBACK");
        throw txErr;
      }
    }

    // Mark approved
    req.db.run("UPDATE pending_review SET status = 'approved', reviewed_at = ?, reviewer = 'human' WHERE id = ?",
      [now, id]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/enrichment/:id/reject — mark rejected
router.post("/:id/reject", (req, res) => {
  const id = parseInt(req.params.id);
  const pending = req.queryOne("SELECT * FROM pending_review WHERE id = ?", [id]);
  if (!pending) return res.status(404).json({ error: "Not found" });
  if (pending.status !== "pending") return res.status(400).json({ error: "Already reviewed" });

  const now = new Date().toISOString();
  req.db.run("UPDATE pending_review SET status = 'rejected', reviewed_at = ?, reviewer = 'human' WHERE id = ?",
    [now, id]);

  res.json({ ok: true });
});

export default router;
