import { Router, type IRouter } from "express";
import { db, dossiersTable, fraisTable, fraisLignesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { PayFraisBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function formatFrais(f: typeof fraisTable.$inferSelect) {
  return {
    id: f.id,
    dossierId: f.dossierId,
    reference: f.reference,
    montantHT: Number(f.montantHT),
    montantTVA: Number(f.montantTVA),
    montantTTC: Number(f.montantTTC),
    statut: f.statut,
    echeance: f.echeance.toISOString(),
    paidAt: f.paidAt?.toISOString() ?? null,
    createdAt: f.createdAt.toISOString(),
  };
}

router.get("/frais", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const userDossiers = await db
    .select({ id: dossiersTable.id })
    .from(dossiersTable)
    .where(eq(dossiersTable.userId, userId));

  if (userDossiers.length === 0) {
    res.json([]);
    return;
  }

  const dossierIds = userDossiers.map(d => d.id);
  const allFrais = [];
  for (const did of dossierIds) {
    const rows = await db.select().from(fraisTable).where(eq(fraisTable.dossierId, did));
    allFrais.push(...rows);
  }

  res.json(allFrais.map(formatFrais));
});

router.get("/frais/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [frais] = await db.select().from(fraisTable).where(eq(fraisTable.id, id));
  if (!frais) {
    res.status(404).json({ error: "Frais introuvable" });
    return;
  }

  const [dossier] = await db
    .select()
    .from(dossiersTable)
    .where(and(eq(dossiersTable.id, frais.dossierId), eq(dossiersTable.userId, userId)));

  if (!dossier) {
    res.status(403).json({ error: "Accès interdit" });
    return;
  }

  const lignes = await db
    .select()
    .from(fraisLignesTable)
    .where(eq(fraisLignesTable.fraisId, id));

  res.json({
    ...formatFrais(frais),
    lignes: lignes.map(l => ({
      label: l.label,
      description: l.description,
      montantHT: Number(l.montantHT),
    })),
    dossier: {
      id: dossier.id,
      reference: dossier.reference,
      titre: dossier.titre,
      territoire: dossier.territoire,
      dispositif: dossier.dispositif,
      secteur: dossier.secteur,
      statut: dossier.statut,
      montantDemande: Number(dossier.montantDemande),
      montantApport: Number(dossier.montantApport ?? 0),
      progressionEtape: dossier.progressionEtape,
      totalEtapes: dossier.totalEtapes,
      createdAt: dossier.createdAt.toISOString(),
      updatedAt: dossier.updatedAt.toISOString(),
    },
  });
});

router.post("/frais/:id/pay", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const parsed = PayFraisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [frais] = await db.select().from(fraisTable).where(eq(fraisTable.id, id));
  if (!frais) {
    res.status(404).json({ error: "Frais introuvable" });
    return;
  }

  const [dossier] = await db
    .select()
    .from(dossiersTable)
    .where(and(eq(dossiersTable.id, frais.dossierId), eq(dossiersTable.userId, userId)));

  if (!dossier) {
    res.status(403).json({ error: "Accès interdit" });
    return;
  }

  if (frais.statut === "paye") {
    res.status(400).json({ error: "Ces frais ont déjà été payés" });
    return;
  }

  const [updated] = await db
    .update(fraisTable)
    .set({ statut: "paye", paidAt: new Date() })
    .where(eq(fraisTable.id, id))
    .returning();

  res.json(formatFrais(updated));
});

export default router;
