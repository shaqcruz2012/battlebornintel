import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const funds = req.db.prepare("SELECT * FROM funds").all();
  res.json(funds);
});

export default router;
