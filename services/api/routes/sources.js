import { Router } from "express";

const router = Router();

// GET /api/sources/:recordType/:recordId
router.get("/:recordType/:recordId", (req, res) => {
  const { recordType, recordId } = req.params;
  const sources = req.queryAll(
    "SELECT * FROM data_sources WHERE record_type = ? AND record_id = ? ORDER BY accessed_at DESC",
    [recordType, recordId]
  );
  res.json(sources);
});

export default router;
