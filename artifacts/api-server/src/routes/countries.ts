import { Router } from "express";
import { db, countriesTable, programsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

// GET /api/countries — liste tous les pays actifs avec le nombre de programmes
router.get("/countries", async (_req, res) => {
  const countries = await db
    .select()
    .from(countriesTable)
    .where(eq(countriesTable.isActive, true))
    .orderBy(asc(countriesTable.sortOrder), asc(countriesTable.name));

  const programs = await db
    .select()
    .from(programsTable)
    .where(eq(programsTable.isActive, true));

  const programCountByCountry = programs.reduce<Record<string, number>>((acc, p) => {
    acc[p.countryCode] = (acc[p.countryCode] ?? 0) + 1;
    return acc;
  }, {});

  res.json(
    countries.map((c) => ({
      code: c.code,
      name: c.name,
      currency: c.currency,
      isEu: c.isEu,
      sortOrder: c.sortOrder,
      programCount: programCountByCountry[c.code] ?? 0,
    }))
  );
});

// GET /api/countries/:code/programs — programmes d'un pays
router.get("/countries/:code/programs", async (req, res) => {
  const code = req.params.code.toUpperCase();

  const country = await db
    .select()
    .from(countriesTable)
    .where(eq(countriesTable.code, code))
    .limit(1);

  if (country.length === 0) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  const programs = await db
    .select()
    .from(programsTable)
    .where(eq(programsTable.countryCode, code))
    .orderBy(asc(programsTable.sortOrder));

  res.json({
    country: country[0],
    programs: programs.filter((p) => p.isActive),
  });
});

export default router;
