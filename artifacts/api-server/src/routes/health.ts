import { Router, type IRouter } from "express";
import { db, countriesTable, programsTable } from "@workspace/db";
import { count, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  const result: Record<string, unknown> = { status: "ok" };

  try {
    const [all] = await db.select({ n: count() }).from(countriesTable);
    result.countries_total = all?.n ?? 0;
  } catch (err) {
    result.countries_total = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  try {
    const [active] = await db.select({ n: count() }).from(countriesTable).where(eq(countriesTable.isActive, true));
    result.countries_active = active?.n ?? 0;
  } catch (err) {
    result.countries_active = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  try {
    const [progs] = await db.select({ n: count() }).from(programsTable).where(eq(programsTable.isActive, true));
    result.programs_active = progs?.n ?? 0;
  } catch (err) {
    result.programs_active = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  try {
    const sample = await db.select().from(countriesTable).limit(3);
    result.sample = sample.map(c => ({ code: c.code, name: c.name, isActive: c.isActive }));
  } catch (err) {
    result.sample = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  res.json(result);
});

export default router;
