import { Router, type IRouter } from "express";
import { db, dossiersTable, documentsTable, fraisTable, messagesTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function formatDossier(d: typeof dossiersTable.$inferSelect) {
  return {
    id: d.id,
    reference: d.reference,
    titre: d.titre,
    territoire: d.territoire,
    dispositif: d.dispositif,
    secteur: d.secteur,
    statut: d.statut,
    montantDemande: Number(d.montantDemande),
    montantApport: Number(d.montantApport ?? 0),
    progressionEtape: d.progressionEtape,
    totalEtapes: d.totalEtapes,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const [dossiersResult] = await db
    .select({ count: count() })
    .from(dossiersTable)
    .where(eq(dossiersTable.userId, userId));

  const userDossiers = await db
    .select({ id: dossiersTable.id })
    .from(dossiersTable)
    .where(eq(dossiersTable.userId, userId));

  const dossierIds = userDossiers.map(d => d.id);

  let documentsCount = 0;
  let fraisEnAttente = 0;
  let messagesNonLus = 0;
  let dossierActif = null;

  if (dossierIds.length > 0) {
    const [docsResult] = await db
      .select({ count: count() })
      .from(documentsTable)
      .where(eq(documentsTable.dossierId, dossierIds[0]));
    documentsCount = Number(docsResult?.count ?? 0);

    const fraisRows = await db
      .select({ count: count() })
      .from(fraisTable)
      .where(and(eq(fraisTable.dossierId, dossierIds[0]), eq(fraisTable.statut, "en_attente")));
    fraisEnAttente = Number(fraisRows[0]?.count ?? 0);

    const msgRows = await db
      .select({ count: count() })
      .from(messagesTable)
      .where(and(eq(messagesTable.dossierId, dossierIds[0]), eq(messagesTable.lu, false)));
    messagesNonLus = Number(msgRows[0]?.count ?? 0);

    const [activeDossier] = await db
      .select()
      .from(dossiersTable)
      .where(eq(dossiersTable.id, dossierIds[0]));
    if (activeDossier) {
      dossierActif = formatDossier(activeDossier);
    }
  }

  res.json({
    dossiersCount: Number(dossiersResult?.count ?? 0),
    documentsCount,
    fraisEnAttente,
    messagesNonLus,
    dossierActif,
  });
});

export default router;
