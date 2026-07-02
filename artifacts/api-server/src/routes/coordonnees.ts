import { Router, type IRouter } from "express";
import { db, coordonneesBancairesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function formatCoordonnees(row: typeof coordonneesBancairesTable.$inferSelect) {
  return {
    id: row.id,
    beneficiaire: row.beneficiaire,
    iban: row.iban,
    bic: row.bic,
    banque: row.banque,
    domiciliation: row.domiciliation,
    libelleVirement: row.libelleVirement,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function getOrCreateCoordonnees() {
  const [row] = await db.select().from(coordonneesBancairesTable).limit(1);
  if (row) return row;
  const [created] = await db.insert(coordonneesBancairesTable).values({}).returning();
  return created;
}

// GET /api/coordonnees-bancaires — lecture pour utilisateur connecté (page Paiement)
router.get("/coordonnees-bancaires", requireAuth, async (_req, res): Promise<void> => {
  const row = await getOrCreateCoordonnees();
  res.json(formatCoordonnees(row));
});

// GET /api/admin/coordonnees-bancaires — lecture admin
router.get("/admin/coordonnees-bancaires", requireAdmin, async (_req, res): Promise<void> => {
  const row = await getOrCreateCoordonnees();
  res.json(formatCoordonnees(row));
});

// PUT /api/admin/coordonnees-bancaires — mise à jour admin
router.put("/admin/coordonnees-bancaires", requireAdmin, async (req, res): Promise<void> => {
  const { beneficiaire, iban, bic, banque, domiciliation, libelleVirement } = req.body as {
    beneficiaire?: string; iban?: string; bic?: string;
    banque?: string; domiciliation?: string; libelleVirement?: string;
  };

  const existing = await getOrCreateCoordonnees();

  const [updated] = await db
    .update(coordonneesBancairesTable)
    .set({
      beneficiaire: beneficiaire?.trim() ?? existing.beneficiaire,
      iban: iban?.trim() ?? existing.iban,
      bic: bic?.trim().toUpperCase() ?? existing.bic,
      banque: banque?.trim() ?? existing.banque,
      domiciliation: domiciliation?.trim() ?? existing.domiciliation,
      libelleVirement: libelleVirement?.trim() ?? existing.libelleVirement,
    })
    .where(eq(coordonneesBancairesTable.id, existing.id))
    .returning();

  res.json(formatCoordonnees(updated));
});

export default router;
