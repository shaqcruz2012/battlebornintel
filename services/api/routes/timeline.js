import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const events = req.queryAll("SELECT * FROM timeline_events ORDER BY date DESC");
  res.json(events);
});

export default router;
