import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const events = req.db.prepare("SELECT * FROM timeline_events ORDER BY date DESC").all();
  res.json(events);
});

export default router;
