import { Router, type IRouter } from "express";
import { db, virementsTable, dossiersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { sendVirementCodeEmail, sendVirementCodeAdmin, sendVirementComplete } from "../lib/mailer";
import { t as i18nT, territoireToLang } from "../lib/i18n";

const router: IRouter = Router();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const VIREMENT_LIBELLES: Record<number, string> = {
  1: "Validation d'identité",
  2: "Frais de dossier de transfert",
  3: "TAF (Taxe d'administration financière)",
  4: "Frais de validation",
};

function formatVirement(v: typeof virementsTable.$inferSelect) {
  return {
    id: v.id,
    dossierId: v.dossierId,
    statut: v.statut,
    etapeCourante: v.etapeCourante,
    iban: v.iban,
    bic: v.bic,
    titulaire: v.titulaire,
    montant: Number(v.montant),
    emailCodeValidatedAt1: v.emailCodeValidatedAt1?.toISOString() ?? null,
    codeFinancierSentAt2: v.codeFinancierSentAt2?.toISOString() ?? null,
    codeFinancierSentAt3: v.codeFinancierSentAt3?.toISOString() ?? null,
    codeFinancierSentAt4: v.codeFinancierSentAt4?.toISOString() ?? null,
    etape1CompletedAt: v.etape1CompletedAt?.toISOString() ?? null,
    etape2CompletedAt: v.etape2CompletedAt?.toISOString() ?? null,
    etape3CompletedAt: v.etape3CompletedAt?.toISOString() ?? null,
    etape4CompletedAt: v.etape4CompletedAt?.toISOString() ?? null,
    paiementMontant2: v.paiementMontant2 ? Number(v.paiementMontant2) : null,
    paiementMontant3: v.paiementMontant3 ? Number(v.paiementMontant3) : null,
    paiementMontant4: v.paiementMontant4 ? Number(v.paiementMontant4) : null,
    paiementDemandeAt2: v.paiementDemandeAt2?.toISOString() ?? null,
    paiementDemandeAt3: v.paiementDemandeAt3?.toISOString() ?? null,
    paiementDemandeAt4: v.paiementDemandeAt4?.toISOString() ?? null,
    paiementConfirmeAt2: v.paiementConfirmeAt2?.toISOString() ?? null,
    paiementConfirmeAt3: v.paiementConfirmeAt3?.toISOString() ?? null,
    paiementConfirmeAt4: v.paiementConfirmeAt4?.toISOString() ?? null,
    completedAt: v.completedAt?.toISOString() ?? null,
    createdAt: v.createdAt.toISOString(),
  };
}

// GET /api/virements/mon-virement
router.get("/virements/mon-virement", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const virement = await db.query.virementsTable.findFirst({
    where: eq(virementsTable.userId, userId),
    orderBy: (v, { desc }) => [desc(v.createdAt)],
  });
  if (!virement) {
    res.json(null);
    return;
  }
  res.json(formatVirement(virement));
});

// POST /api/virements/initier
router.post("/virements/initier", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { iban, bic, titulaire } = req.body;

  if (!iban || !bic || !titulaire) {
    res.status(400).json({ error: "IBAN, BIC et titulaire sont requis" });
    return;
  }

  const dossier = await db.query.dossiersTable.findFirst({
    where: and(eq(dossiersTable.userId, userId), eq(dossiersTable.statut, "verse")),
  });

  if (!dossier) {
    res.status(403).json({ error: "Aucun dossier versé éligible au transfert de fonds" });
    return;
  }

  const existing = await db.query.virementsTable.findFirst({
    where: and(eq(virementsTable.userId, userId), eq(virementsTable.dossierId, dossier.id)),
  });

  if (existing && existing.statut !== "annule") {
    res.json(formatVirement(existing));
    return;
  }

  const code1 = generateCode();
  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
  const now = new Date();

  const [virement] = await db.insert(virementsTable).values({
    dossierId: dossier.id,
    userId,
    statut: "en_cours",
    etapeCourante: 1,
    iban: iban.toUpperCase().replace(/\s/g, ""),
    bic: bic.toUpperCase().trim(),
    titulaire: titulaire.trim(),
    montant: dossier.montantDemande,
    codeEmail1: code1,
    codeEmailSentAt: now,
    codeFinancier2: generateCode(),
    codeFinancier3: generateCode(),
    codeFinancier4: generateCode(),
  }).returning();

  if (user) {
    await sendVirementCodeEmail({
      to: user.email,
      prenom: user.prenom,
      etape: 1,
      code: code1,
      reference: dossier.reference,
      montant: Number(dossier.montantDemande),
      lang: territoireToLang(user.territoire),
    }).catch(console.error);
  }

  res.status(201).json(formatVirement(virement));
});

// POST /api/virements/:id/valider-email — étape 1 : vérification d'identité + complétion immédiate
router.post("/virements/:id/valider-email", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const virementId = parseInt(req.params.id);
  const { code } = req.body;

  const [ulrE] = await db.select({ territoire: usersTable.territoire }).from(usersTable).where(eq(usersTable.id, userId));
  const lang = territoireToLang(ulrE?.territoire);

  const virement = await db.query.virementsTable.findFirst({
    where: and(eq(virementsTable.id, virementId), eq(virementsTable.userId, userId)),
  });

  if (!virement || virement.statut !== "en_cours") {
    res.status(404).json({ error: "Virement introuvable ou non actif" });
    return;
  }

  if (virement.etapeCourante !== 1) {
    res.status(400).json({ error: "La vérification d'identité est déjà complétée" });
    return;
  }

  if (virement.emailCodeValidatedAt1) {
    res.status(400).json({ error: "Code email déjà validé" });
    return;
  }

  const sentAt = virement.codeEmailSentAt;
  if (!sentAt || Date.now() - sentAt.getTime() > 30 * 60 * 1000) {
    res.status(400).json({ error: "Ce code a expiré. Veuillez demander un nouveau code." });
    return;
  }

  if (virement.codeEmail1 !== code) {
    res.status(400).json({ error: i18nT(lang, "err_code_incorrect") });
    return;
  }

  const now = new Date();
  const [updated] = await db.update(virementsTable).set({
    emailCodeValidatedAt1: now,
    etape1CompletedAt: now,
    etapeCourante: 2,
  }).where(eq(virementsTable.id, virementId)).returning();

  res.json(formatVirement(updated));
});

// POST /api/virements/:id/renvoyer-code-email — uniquement étape 1
router.post("/virements/:id/renvoyer-code-email", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const virementId = parseInt(req.params.id);

  const virement = await db.query.virementsTable.findFirst({
    where: and(eq(virementsTable.id, virementId), eq(virementsTable.userId, userId)),
  });

  if (!virement || virement.statut !== "en_cours") {
    res.status(404).json({ error: "Virement introuvable ou non actif" });
    return;
  }

  if (virement.etapeCourante !== 1 || virement.emailCodeValidatedAt1) {
    res.status(400).json({ error: "Cette action n'est disponible qu'à l'étape 1" });
    return;
  }

  const newCode = generateCode();
  await db.update(virementsTable).set({
    codeEmail1: newCode,
    codeEmailSentAt: new Date(),
  }).where(eq(virementsTable.id, virementId));

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
  const dossier = await db.query.dossiersTable.findFirst({ where: eq(dossiersTable.id, virement.dossierId) });
  if (user && dossier) {
    await sendVirementCodeEmail({
      to: user.email,
      prenom: user.prenom,
      etape: 1,
      code: newCode,
      reference: dossier.reference,
      montant: Number(virement.montant),
      lang: territoireToLang(user.territoire),
    }).catch(console.error);
  }

  res.json({ success: true });
});

// POST /api/virements/:id/valider-financier — étapes 2, 3, 4 : valider le code envoyé par l'admin
router.post("/virements/:id/valider-financier", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const virementId = parseInt(req.params.id);
  const { code } = req.body;

  const [ulrF] = await db.select({ territoire: usersTable.territoire }).from(usersTable).where(eq(usersTable.id, userId));
  const langF = territoireToLang(ulrF?.territoire);

  const virement = await db.query.virementsTable.findFirst({
    where: and(eq(virementsTable.id, virementId), eq(virementsTable.userId, userId)),
  });

  if (!virement || virement.statut !== "en_cours") {
    res.status(404).json({ error: "Virement introuvable ou non actif" });
    return;
  }

  const etape = virement.etapeCourante;

  if (etape < 2 || etape > 4) {
    res.status(400).json({ error: "Cette étape ne nécessite pas de code de service financier" });
    return;
  }

  const sentAtKey = `codeFinancierSentAt${etape}` as keyof typeof virement;
  if (!virement[sentAtKey]) {
    res.status(400).json({ error: "Le code n'a pas encore été transmis par le service financier" });
    return;
  }

  const codeFinKey = `codeFinancier${etape}` as keyof typeof virement;
  if (!virement[codeFinKey]) {
    res.status(400).json({ error: "Code non disponible" });
    return;
  }

  if (virement[codeFinKey] !== code) {
    res.status(400).json({ error: i18nT(langF, "err_code_incorrect") });
    return;
  }

  const isLastEtape = etape === 4;
  const now = new Date();
  const updates: Record<string, unknown> = { [`etape${etape}CompletedAt`]: now };

  if (isLastEtape) {
    updates.statut = "complete";
    updates.completedAt = now;
    // Dossier clôturé définitivement après transfert des fonds
    await db.update(dossiersTable)
      .set({ statut: "transfert_effectue", progressionEtape: 5, updatedAt: now })
      .where(eq(dossiersTable.id, virement.dossierId));
  } else {
    updates.etapeCourante = etape + 1;
  }

  const [updated] = await db.update(virementsTable).set(updates).where(eq(virementsTable.id, virementId)).returning();

  if (isLastEtape) {
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    const dossier = await db.query.dossiersTable.findFirst({ where: eq(dossiersTable.id, virement.dossierId) });
    if (user && dossier) {
      await sendVirementComplete({
        to: user.email,
        prenom: user.prenom,
        reference: dossier.reference,
        montant: Number(virement.montant),
        iban: virement.iban,
      }).catch(console.error);
    }
  }

  res.json(formatVirement(updated));
});

// POST /api/virements/:id/annuler — uniquement si étape 1 non complétée
router.post("/virements/:id/annuler", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const virementId = parseInt(req.params.id);

  const virement = await db.query.virementsTable.findFirst({
    where: and(eq(virementsTable.id, virementId), eq(virementsTable.userId, userId)),
  });

  if (!virement) {
    res.status(404).json({ error: "Virement introuvable" });
    return;
  }

  if (virement.statut !== "en_cours") {
    res.status(400).json({ error: "Seul un virement en cours peut être annulé" });
    return;
  }

  if (virement.etape1CompletedAt) {
    res.status(400).json({ error: "La vérification d'identité étant complétée, le transfert ne peut plus être annulé." });
    return;
  }

  await db.update(virementsTable)
    .set({ statut: "annule" })
    .where(eq(virementsTable.id, virementId));

  res.json({ success: true });
});

export default router;
