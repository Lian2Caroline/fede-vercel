import { Router, type IRouter } from "express";
import { db, dossiersTable, documentsTable, messagesTable, fraisTable, fraisLignesTable, usersTable, dossierEventsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { generateAccuseReception, generateRapportEligibilite, generateContratMission, generateNotificationAttribution, generateFicheCollecte, generateFacture } from "../lib/pdf";
import {
  CreateDossierBody,
  UpdateDossierBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { sendDossierCreated, sendDossierSoumis } from "../lib/sendpulse";

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

  const docTypes = [
    { type: "kbis", nom: "Extrait Kbis / Statuts", obligatoire: true },
    { type: "identite", nom: "Pièce d'identité", obligatoire: true },
    { type: "rib", nom: "Relevé d'identité bancaire (RIB)", obligatoire: true },
    { type: "plan_financement", nom: "Plan de financement", obligatoire: true },
    { type: "business_plan", nom: "Business plan / Projet", obligatoire: true },
    { type: "devis", nom: "Devis des travaux / investissements", obligatoire: false },
  ];

  await db.insert(documentsTable).values(
    docTypes.map(d => ({
      dossierId: dossier.id,
      type: d.type,
      nom: d.nom,
      filename: null,
      statut: "manquant" as const,
      obligatoire: d.obligatoire,
    }))
  );

  await db.insert(messagesTable).values({
    dossierId: dossier.id,
    expediteur: "CapSubvention",
    expediteurRole: "system",
    contenu: `Votre dossier ${dossier.reference} a été créé avec succès. Veuillez compléter les informations manquantes et soumettre vos documents justificatifs pour commencer l'instruction.`,
    lu: false,
  });

  // Email: confirmation de création
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (user) {
    sendDossierCreated({
      to: user.email,
      prenom: user.prenom,
      reference: dossier.reference,
      titre: dossier.titre,
      territoire: dossier.territoire,
    }).catch((err) => console.error("[sendpulse] dossier created:", err));
  }

  res.status(201).json(formatDossier(dossier));
});

router.get("/dossiers/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [dossier] = await db
    .select()
    .from(dossiersTable)
    .where(and(eq(dossiersTable.id, id), eq(dossiersTable.userId, userId)));

  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
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

  const TIMELINE = [
    { etape: 1, titre: "Dépôt du dossier", description: "Votre dossier a été soumis et reçu par nos services." },
    { etape: 2, titre: "Instruction administrative", description: "Vérification des pièces justificatives et de la conformité administrative." },
    { etape: 3, titre: "Expertise technique", description: "Évaluation technique et financière de votre projet." },
    { etape: 4, titre: "Validation", description: "Décision finale du comité de financement." },
    { etape: 5, titre: "Versement", description: "Mise en place du versement de la subvention." },
  ];

  const timeline = TIMELINE.map(t => ({
    ...t,
    statut: t.etape < dossier.progressionEtape ? "fait" : t.etape === dossier.progressionEtape ? "en_cours" : "en_attente",
    date: t.etape <= dossier.progressionEtape ? dossier.updatedAt.toISOString() : null,
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

  await db.insert(messagesTable).values({
    dossierId: id,
    expediteur: "CapSubvention",
    expediteurRole: "system",
    contenu: "Votre dossier a été soumis avec succès. Nos équipes procèdent actuellement à l'instruction administrative. Vous serez notifié de toute évolution.",
    lu: false,
  });

  // Email: accusé de soumission
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (user) {
    sendDossierSoumis({
      to: user.email,
      prenom: user.prenom,
      reference: dossier.reference,
      titre: dossier.titre,
    }).catch((err) => console.error("[sendpulse] dossier soumis:", err));
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
router.get("/dossiers/:id/pdf/:type", requireAuth, async (req, res): Promise<void> => {
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
    let buf: Buffer;
    let filename = `${type}-${dossier.reference}.pdf`;
    switch (type) {
      case "accuse_reception":    buf = await generateAccuseReception(d, u);           filename = `accuse-reception-${dossier.reference}.pdf`; break;
      case "rapport_eligibilite": buf = await generateRapportEligibilite(d, u);        filename = `rapport-eligibilite-${dossier.reference}.pdf`; break;
      case "fiche_collecte":      buf = await generateFicheCollecte(d, u);             filename = `fiche-collecte-${dossier.reference}.pdf`; break;
      case "contrat_mission":     buf = await generateContratMission(d, u);            filename = `contrat-mission-${dossier.reference}.pdf`; break;
      case "notification":        buf = await generateNotificationAttribution(d, u);   filename = `notification-attribution-${dossier.reference}.pdf`; break;
      case "facture":             buf = await generateFacture(d, u, dossier.reference ?? ""); filename = `facture-${dossier.reference}.pdf`; break;
      default: res.status(400).json({ error: "Type de document inconnu" }); return;
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(buf);
  } catch (err: any) {
    res.status(500).json({ error: "Erreur génération PDF", details: err.message });
  }
});

export default router;
