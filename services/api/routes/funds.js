import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const funds = req.queryAll("SELECT * FROM funds");
  res.json(funds);
});

export default router;
