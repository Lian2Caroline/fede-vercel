import { Router, type IRouter } from "express";
import { db, dossiersTable, documentsTable, fraisTable, messagesTable, dossierEventsTable } from "@workspace/db";
import { eq, and, count, ne, inArray } from "drizzle-orm";

import { requireAuth } from "../middlewares/auth";

// Chaque action admin débloque N documents officiels téléchargeables
const ACTION_DOC_COUNT: Record<string, number> = {
  accuser_reception:    1, // accuse_reception
  envoyer_eligibilite:  2, // rapport_eligibilite + fiche_collecte
  envoyer_contrat:      1, // contrat_mission
  marquer_favorable:    1, // notification
};

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
    description: d.description ?? null,
    justificationBudget: d.justificationBudget ?? null,
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
  let documentsRejetes = 0;
  let documentsOfficielsDisponibles = 0;
  let dossierActif = null;

  if (dossierIds.length > 0) {
    const [docsResult] = await db
      .select({ count: count() })
      .from(documentsTable)
      .where(and(eq(documentsTable.dossierId, dossierIds[0]), ne(documentsTable.statut, "manquant")));
    documentsCount = Number(docsResult?.count ?? 0);

    const fraisRows = await db
      .select({ count: count() })
      .from(fraisTable)
      .where(and(eq(fraisTable.dossierId, dossierIds[0]), eq(fraisTable.statut, "en_attente")));
    fraisEnAttente = Number(fraisRows[0]?.count ?? 0);

    // Compteur destiné au porteur : on exclut ses propres messages (user→admin)
    // qui restent "non-lus" tant que l'admin ne les a pas ouverts.
    const msgRows = await db
      .select({ count: count() })
      .from(messagesTable)
      .where(and(
        eq(messagesTable.dossierId, dossierIds[0]),
        eq(messagesTable.lu, false),
        ne(messagesTable.expediteurRole, "user"),
      ));
    messagesNonLus = Number(msgRows[0]?.count ?? 0);

    // Documents rejetés par l'admin → action requise (badge rouge)
    const rejRows = await db
      .select({ count: count() })
      .from(documentsTable)
      .where(and(
        eq(documentsTable.dossierId, dossierIds[0]),
        eq(documentsTable.statut, "rejete"),
      ));
    documentsRejetes = Number(rejRows[0]?.count ?? 0);

    // Documents officiels disponibles = actions admin enregistrées dans dossier_events
    const eventsRows = await db
      .select({ action: dossierEventsTable.action })
      .from(dossierEventsTable)
      .where(eq(dossierEventsTable.dossierId, dossierIds[0]));
    const doneActions = new Set(eventsRows.map(e => e.action));
    documentsOfficielsDisponibles = Object.entries(ACTION_DOC_COUNT)
      .filter(([action]) => doneActions.has(action))
      .reduce((sum, [, n]) => sum + n, 0);

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
    documentsRejetes,
    documentsOfficielsDisponibles,
    dossierActif,
  });
});

export default router;
