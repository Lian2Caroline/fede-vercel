import { Router, type IRouter } from "express";
import { db, dossiersTable, documentsTable, messagesTable, fraisTable, fraisLignesTable, usersTable, dossierEventsTable, settingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { generateAccuseReception, generateRapportEligibilite, generateContratMission, generateNotificationAttribution, generateFicheCollecte, generateFacture } from "../lib/pdf";
import {
  CreateDossierBody,
  UpdateDossierBody,
} from "@workspace/api-zod";
import { requireAuth, requireAuthForPdf } from "../middlewares/auth";
import { sendDossierSoumis, sendNewDossierAdmin } from "../lib/mailer";
import { generatePdfToken } from "../lib/pdfToken";
import { t as i18nT, territoireToLang } from "../lib/i18n";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fede-financement.com";

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
    description: d.description,
    justificationBudget: d.justificationBudget,
    dateDebut: d.dateDebut,
    dureeProjet: d.dureeProjet,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `FD-${year}-${rand}`;
}

router.get("/dossiers", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const dossiers = await db
    .select()
    .from(dossiersTable)
    .where(eq(dossiersTable.userId, userId));

  res.json(dossiers.map(formatDossier));
});

router.post("/dossiers", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CreateDossierBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // ── One dossier per user ───────────────────────────────────────────────────
  const existing = await db.select({ id: dossiersTable.id }).from(dossiersTable).where(eq(dossiersTable.userId, userId));
  if (existing.length > 0) {
    res.status(409).json({
      error: "Vous avez déjà un dossier en cours. Une seule demande de financement est autorisée par compte.",
      dossierId: existing[0].id,
    });
    return;
  }

  const { titre, territoire, dispositif, secteur, description, montantDemande, montantApport, justificationBudget, dateDebut, dureeProjet } = parsed.data;

  const [dossier] = await db.insert(dossiersTable).values({
    userId,
    reference: generateReference(),
    titre,
    territoire,
    dispositif,
    secteur,
    description: description ?? null,
    montantDemande: String(montantDemande),
    montantApport: montantApport != null ? String(montantApport) : null,
    justificationBudget: justificationBudget ?? null,
    dateDebut: dateDebut ?? null,
    dureeProjet: dureeProjet ?? null,
    statut: "brouillon",
    progressionEtape: 1,
    totalEtapes: 5,
  }).returning();

  // Note: document records are NOT pre-created — they are inserted on first upload.
  // This avoids showing "Manquant"/"Supprimer" on documents the user has never touched.

  const userLangCreate = territoireToLang(territoire);
  await db.insert(messagesTable).values({
    dossierId: dossier.id,
    expediteur: "FEDE",
    expediteurRole: "system",
    contenu: i18nT(userLangCreate, "sys_msg_created", { ref: dossier.reference }),
    lu: true,
  });

  res.status(201).json(formatDossier(dossier));
});

router.get("/dossiers/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [userRecord] = await db.select({ territoire: usersTable.territoire }).from(usersTable).where(eq(usersTable.id, userId));
  const userLang = territoireToLang(userRecord?.territoire);

  const [dossier] = await db
    .select()
    .from(dossiersTable)
    .where(and(eq(dossiersTable.id, id), eq(dossiersTable.userId, userId)));

  if (!dossier) {
    res.status(404).json({ error: i18nT(userLang, "err_dossier_introuvable") });
    return;
  }

  const documents = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.dossierId, id));

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.dossierId, id));

  const frais = await db
    .select()
    .from(fraisTable)
    .where(eq(fraisTable.dossierId, id));

  const lang = territoireToLang(dossier.territoire);
  const TIMELINE = [
    { etape: 1, titre: i18nT(lang, "timeline_1_titre"), description: i18nT(lang, "timeline_1_desc") },
    { etape: 2, titre: i18nT(lang, "timeline_2_titre"), description: i18nT(lang, "timeline_2_desc") },
    { etape: 3, titre: i18nT(lang, "timeline_3_titre"), description: i18nT(lang, "timeline_3_desc") },
    { etape: 4, titre: i18nT(lang, "timeline_4_titre"), description: i18nT(lang, "timeline_4_desc") },
    { etape: 5, titre: i18nT(lang, "timeline_5_titre"), description: i18nT(lang, "timeline_5_desc") },
  ];

  const timeline = TIMELINE.map(tl => ({
    ...tl,
    statut: tl.etape < dossier.progressionEtape ? "fait" : tl.etape === dossier.progressionEtape ? "en_cours" : "en_attente",
    date: tl.etape <= dossier.progressionEtape ? dossier.updatedAt.toISOString() : null,
  }));

  res.json({
    ...formatDossier(dossier),
    documents: documents.map(doc => ({
      ...doc,
      uploadedAt: doc.uploadedAt?.toISOString() ?? null,
    })),
    messages: messages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    })),
    frais: frais.map(f => ({
      ...f,
      montantHT: Number(f.montantHT),
      montantTVA: Number(f.montantTVA),
      montantTTC: Number(f.montantTTC),
      echeance: f.echeance.toISOString(),
      paidAt: f.paidAt?.toISOString() ?? null,
      createdAt: f.createdAt.toISOString(),
    })),
    timeline,
  });
});

router.put("/dossiers/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const parsed = UpdateDossierBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { montantDemande, montantApport, ...rest } = parsed.data;

  const [dossier] = await db
    .update(dossiersTable)
    .set({
      ...rest,
      ...(montantDemande != null ? { montantDemande: String(montantDemande) } : {}),
      ...(montantApport != null ? { montantApport: String(montantApport) } : {}),
    })
    .where(and(eq(dossiersTable.id, id), eq(dossiersTable.userId, userId)))
    .returning();

  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  res.json(formatDossier(dossier));
});

router.post("/dossiers/:id/submit", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [dossier] = await db
    .update(dossiersTable)
    .set({ statut: "soumis", progressionEtape: 2 })
    .where(and(eq(dossiersTable.id, id), eq(dossiersTable.userId, userId)))
    .returning();

  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  const userLangSubmit = territoireToLang(dossier.territoire);
  await db.insert(messagesTable).values({
    dossierId: id,
    expediteur: "FEDE",
    expediteurRole: "system",
    contenu: i18nT(userLangSubmit, "sys_msg_soumis"),
    lu: false,
  });

  // Vérifier si tous les documents obligatoires ont été déposés
  const REQUIRED_TYPES = ["identite", "domicile", "business_plan", "financement", "rib"];
  const docs = await db
    .select({ type: documentsTable.type, statut: documentsTable.statut })
    .from(documentsTable)
    .where(eq(documentsTable.dossierId, id));
  const uploadedTypes = new Set(
    docs.filter((d) => d.statut !== "manquant").map((d) => d.type)
  );
  const allDocsComplete = REQUIRED_TYPES.every((t) => uploadedTypes.has(t));

  // Email: accusé de soumission (utilisateur) + alerte admin
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (user) {
    sendDossierSoumis({
      to: user.email,
      prenom: user.prenom,
      reference: dossier.reference,
      titre: dossier.titre,
      allDocsComplete,
      lang: userLangSubmit,
    }).catch((err) => console.error("[mailer] dossier soumis:", err));

    sendNewDossierAdmin({
      to: ADMIN_EMAIL,
      userPrenom: user.prenom,
      userNom: user.nom,
      userEmail: user.email,
      dossierRef: dossier.reference,
      dossierTitre: dossier.titre,
      territoire: dossier.territoire ?? undefined,
      secteur: dossier.secteur ?? undefined,
      montantDemande: dossier.montantDemande ? Number(dossier.montantDemande) : undefined,
      description: dossier.description,
    }).catch((err) => console.error("[mailer] new dossier admin:", err));
  }

  res.json(formatDossier(dossier));
});

// GET /dossiers/:id/events — liste des événements de phase (porteur, documents exécutés seulement)
router.get("/dossiers/:id/events", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

  const [dossier] = await db.select().from(dossiersTable).where(and(eq(dossiersTable.id, id), eq(dossiersTable.userId, userId)));
  if (!dossier) { res.status(404).json({ error: "Dossier introuvable" }); return; }

  const events = await db.select().from(dossierEventsTable).where(eq(dossierEventsTable.dossierId, id));
  res.json(events);
});

// GET /dossiers/:id/pdf/:type — télécharger un document officiel (seulement si l'événement correspondant est exécuté)
router.get("/dossiers/:id/pdf/:type", requireAuthForPdf, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const id = parseInt(req.params.id);
  const { type } = req.params;
  if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

  const [dossier] = await db.select().from(dossiersTable).where(and(eq(dossiersTable.id, id), eq(dossiersTable.userId, userId)));
  if (!dossier) { res.status(404).json({ error: "Dossier introuvable" }); return; }

  // Vérification de sécurité : l'action correspondant au type doit avoir été exécutée
  const DOC_TO_ACTION: Record<string, string> = {
    accuse_reception:    "accuser_reception",
    rapport_eligibilite: "envoyer_eligibilite",
    fiche_collecte:      "envoyer_eligibilite",
    contrat_mission:     "envoyer_contrat",
    notification:        "marquer_favorable",
    facture:             "confirmer_paiement",
  };
  const requiredAction = DOC_TO_ACTION[type];
  if (requiredAction) {
    const events = await db.select().from(dossierEventsTable).where(
      and(eq(dossierEventsTable.dossierId, id), eq(dossierEventsTable.action, requiredAction))
    );
    if (events.length === 0) { res.status(403).json({ error: "Document non disponible" }); return; }
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "Utilisateur introuvable" }); return; }

  try {
    const d = { reference: dossier.reference, titre: dossier.titre, territoire: dossier.territoire, dispositif: dossier.dispositif ?? "", secteur: dossier.secteur ?? "", montantDemande: dossier.montantDemande ?? 0, description: dossier.description ?? "", expertDesigne: dossier.expertDesigne ?? "", createdAt: dossier.createdAt?.toISOString() ?? new Date().toISOString() };
    const u = { prenom: user.prenom, nom: user.nom, email: user.email, telephone: user.telephone ?? "", organisation: user.organisation ?? "", typePorteur: user.typePorteur ?? "" };
    const contactRow = await db.query.settingsTable.findFirst({ where: eq(settingsTable.key, "contact_info") });
    let contact: { telephone?: string; email?: string; adresse?: string } = { telephone: "+33 (0) 800 123 456", email: "support@fede-financement.com", adresse: "Disponible pour toute l'Europe" };
    try { if (contactRow?.value) contact = { ...contact, ...JSON.parse(contactRow.value) }; } catch { /* keep defaults */ }
    let buf: Buffer;
    let filename = `${type}-${dossier.reference}.pdf`;
    switch (type) {
      case "accuse_reception":    buf = await generateAccuseReception(d, u, "fr", contact);           filename = `accuse-reception-${dossier.reference}.pdf`; break;
      case "rapport_eligibilite": buf = await generateRapportEligibilite(d, u, undefined, "fr", contact); filename = `rapport-eligibilite-${dossier.reference}.pdf`; break;
      case "fiche_collecte":      buf = await generateFicheCollecte(d, u, "fr", contact);             filename = `fiche-collecte-${dossier.reference}.pdf`; break;
      case "contrat_mission":     buf = await generateContratMission(d, u, "fr", contact);            filename = `contrat-mission-${dossier.reference}.pdf`; break;
      case "notification":        buf = await generateNotificationAttribution(d, u, undefined, undefined, "fr", contact); filename = `notification-attribution-${dossier.reference}.pdf`; break;
      case "facture":             buf = await generateFacture(d, u, dossier.reference ?? "", "fr", contact); filename = `facture-${dossier.reference}.pdf`; break;
      default: res.status(400).json({ error: "Type de document inconnu" }); return;
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(buf);
  } catch (err: any) {
    res.status(500).json({ error: "Erreur génération PDF", details: err.message });
  }
});

// POST /pdf-token — émet un jeton HMAC à durée limitée (15 min) pour télécharger un PDF
// Le mobile app (ou webview) doit appeler cet endpoint avec son Bearer token,
// puis ouvrir l'URL PDF avec ?token=<jwt_court> dans le navigateur.
router.post("/pdf-token", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const token = generatePdfToken(userId);
  res.json({ token, expiresInSeconds: 15 * 60 });
});

export default router;
