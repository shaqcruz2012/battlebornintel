import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import companiesRouter from "./routes/companies.js";
import fundsRouter from "./routes/funds.js";
import graphRouter from "./routes/graph.js";
import timelineRouter from "./routes/timeline.js";
import statsRouter from "./routes/stats.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "db", "bbi.db");

const db = new Database(dbPath, { readonly: true });
db.pragma("journal_mode = WAL");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use("/api/companies", companiesRouter);
app.use("/api/funds", fundsRouter);
app.use("/api/graph", graphRouter);
app.use("/api/timeline", timelineRouter);
app.use("/api/stats", statsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BBI API running on :${PORT}`));
