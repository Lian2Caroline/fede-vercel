import { Router, type IRouter } from "express";
import { db, countriesTable } from "@workspace/db";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  try {
    const [row] = await db.select({ n: count() }).from(countriesTable);
    res.json({ status: "ok", countries_in_db: row?.n ?? 0 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.json({ status: "ok", countries_in_db: "error", db_error: msg });
  }
});

export default router;
