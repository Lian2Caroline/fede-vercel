import { Router, type IRouter } from "express";
import { db, dossiersTable, usersTable, fraisTable, fraisLignesTable, messagesTable, dossierEventsTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import {
  UpdateDossierStatusBody,
  EmitFraisBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import {
  sendStatutChange,
  sendFraisEmis,
  sendNewMessageNotification,
  sendDemandeDocuments,
  sendBroadcast,
  sendPhaseAction,
} from "../lib/sendpulse";
import {
  generateAccuseReception,
  generateRapportEligibilite,
  generateContratMission,
  generateNotificationAttribution,
  generateFacture,
  generateFicheCollecte,
} from "../lib/pdf";

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
    expertDesigne: d.expertDesigne,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    prenom: u.prenom,
    nom: u.nom,
    email: u.email,
    telephone: u.telephone,
    territoire: u.territoire,
    typePorteur: u.typePorteur,
    organisation: u.organisation,
    role: u.role,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt.toISOString(),
  };
}

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

function generateFraisRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `FI-${year}-${rand}`;
}

// ─── STATS ───────────────────────────────────────────────────────────────────

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [totalRow] = await db.select({ count: count() }).from(dossiersTable);
  const totalDossiers = Number(totalRow?.count ?? 0);

  const [instrRow] = await db
    .select({ count: count() })
    .from(dossiersTable)
    .where(eq(dossiersTable.statut, "en_instruction"));
  const enInstruction = Number(instrRow?.count ?? 0);

  const [fraisRow] = await db
    .select({ count: count() })
    .from(fraisTable)
    .where(eq(fraisTable.statut, "en_attente"));
  const fraisEnAttente = Number(fraisRow?.count ?? 0);

  const [validesRow] = await db
    .select({ count: count() })
    .from(dossiersTable)
    .where(eq(dossiersTable.statut, "valide"));
  const validesThisMois = Number(validesRow?.count ?? 0);

  const fraisPaies = await db
    .select({ montantTTC: fraisTable.montantTTC })
    .from(fraisTable)
    .where(eq(fraisTable.statut, "paye"));
  const totalFraisPercu = fraisPaies.reduce((sum, f) => sum + Number(f.montantTTC), 0);

  const statutsRes = await db
    .select({ statut: dossiersTable.statut, count: count() })
    .from(dossiersTable)
    .groupBy(dossiersTable.statut);

  const territoiresRes = await db
    .select({ territoire: dossiersTable.territoire, count: count() })
    .from(dossiersTable)
    .groupBy(dossiersTable.territoire);

  res.json({
    totalDossiers,
    enInstruction,
    fraisEnAttente,
    validesThisMois,
    totalFraisPercu,
    byStatut: statutsRes.map(r => ({ statut: r.statut, count: Number(r.count) })),
    byTerritoire: territoiresRes.map(r => ({ territoire: r.territoire, count: Number(r.count) })),
  });
});

// ─── DOSSIERS ────────────────────────────────────────────────────────────────

router.get("/admin/dossiers", requireAdmin, async (req, res): Promise<void> => {
  const { statut, territoire, search } = req.query;

  const all = await db
    .select({ dossier: dossiersTable, user: usersTable })
    .from(dossiersTable)
    .leftJoin(usersTable, eq(dossiersTable.userId, usersTable.id));

  let filtered = all;
  if (statut && typeof statut === "string") filtered = filtered.filter(r => r.dossier.statut === statut);
  if (territoire && typeof territoire === "string") filtered = filtered.filter(r => r.dossier.territoire === territoire);
  if (search && typeof search === "string") {
    const s = search.toLowerCase();
    filtered = filtered.filter(r =>
      r.dossier.reference.toLowerCase().includes(s) ||
      r.dossier.titre.toLowerCase().includes(s) ||
      (r.user?.nom ?? "").toLowerCase().includes(s) ||
      (r.user?.prenom ?? "").toLowerCase().includes(s)
    );
  }

  const dossierIds = filtered.map(r => r.dossier.id);
  const allFrais: Record<number, ReturnType<typeof formatFrais>[]> = {};
  for (const did of dossierIds) {
    const rows = await db.select().from(fraisTable).where(eq(fraisTable.dossierId, did));
    allFrais[did] = rows.map(formatFrais);
  }

  res.json(filtered.map(r => ({
    ...formatDossier(r.dossier),
    user: r.user ? formatUser(r.user) : null,
    frais: allFrais[r.dossier.id] ?? [],
  })));
});

router.get("/admin/dossiers/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [row] = await db
    .select({ dossier: dossiersTable, user: usersTable })
    .from(dossiersTable)
    .leftJoin(usersTable, eq(dossiersTable.userId, usersTable.id))
    .where(eq(dossiersTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  const frais = await db.select().from(fraisTable).where(eq(fraisTable.dossierId, id));
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.dossierId, id));

  res.json({
    ...formatDossier(row.dossier),
    user: row.user ? formatUser(row.user) : null,
    frais: frais.map(formatFrais),
    messages: messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
  });
});

// ─── STATUS CHANGE ────────────────────────────────────────────────────────────

router.put("/admin/dossiers/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const parsed = UpdateDossierStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { statut, expertDesigne, commentaire } = parsed.data;

  const progressionMap: Record<string, number> = {
    brouillon: 1, soumis: 2, en_instruction: 2,
    expertise: 3, valide: 4, rejete: 4, verse: 5,
  };

  const [dossier] = await db
    .update(dossiersTable)
    .set({ statut, expertDesigne: expertDesigne ?? undefined, progressionEtape: progressionMap[statut] ?? 1 })
    .where(eq(dossiersTable.id, id))
    .returning();

  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  if (commentaire) {
    await db.insert(messagesTable).values({
      dossierId: id,
      expediteur: "CapSubvention — Conseillers",
      expediteurRole: "admin",
      contenu: commentaire,
      lu: false,
    });
  }

  // Email: notification changement de statut
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  if (user) {
    sendStatutChange({
      to: user.email,
      prenom: user.prenom,
      reference: dossier.reference,
      titre: dossier.titre,
      statut,
      commentaire,
    }).catch((err) => console.error("[sendpulse] statut change:", err));
  }

  const frais = await db.select().from(fraisTable).where(eq(fraisTable.dossierId, id));

  res.json({
    ...formatDossier(dossier),
    user: user ? formatUser(user) : null,
    frais: frais.map(formatFrais),
  });
});

// ─── ADMIN MESSAGE ────────────────────────────────────────────────────────────

router.post("/admin/dossiers/:id/messages", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const { contenu } = req.body as { contenu: string };

  if (!contenu?.trim()) {
    res.status(400).json({ error: "Contenu requis" });
    return;
  }

  const [dossier] = await db.select().from(dossiersTable).where(eq(dossiersTable.id, id));
  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  const [msg] = await db.insert(messagesTable).values({
    dossierId: id,
    expediteur: "CapSubvention — Conseillers",
    expediteurRole: "admin",
    contenu: contenu.trim(),
    lu: false,
  }).returning();

  // Email: notification nouveau message
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  if (user) {
    sendNewMessageNotification({
      to: user.email,
      prenom: user.prenom,
      dossierRef: dossier.reference,
      extrait: contenu.trim(),
    }).catch((err) => console.error("[sendpulse] admin message:", err));
  }

  res.status(201).json({ ...msg, createdAt: msg.createdAt.toISOString() });
});

// ─── DEMANDE DE DOCUMENTS ─────────────────────────────────────────────────────

router.post("/admin/dossiers/:id/demande-documents", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const { documents } = req.body as { documents: string[] };

  if (!Array.isArray(documents) || documents.length === 0) {
    res.status(400).json({ error: "Liste de documents requise" });
    return;
  }

  const [dossier] = await db.select().from(dossiersTable).where(eq(dossiersTable.id, id));
  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  // Add a system message listing documents
  const listText = documents.map(d => `• ${d}`).join("\n");
  await db.insert(messagesTable).values({
    dossierId: id,
    expediteur: "CapSubvention — Conseillers",
    expediteurRole: "admin",
    contenu: `Des pièces complémentaires sont requises pour instruire votre dossier :\n${listText}\n\nMerci de les déposer dans votre espace dès que possible.`,
    lu: false,
  });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  if (user) {
    sendDemandeDocuments({
      to: user.email,
      prenom: user.prenom,
      reference: dossier.reference,
      documents,
    }).catch((err) => console.error("[sendpulse] demande docs:", err));
  }

  res.json({ message: "Demande de documents envoyée" });
});

// ─── BROADCAST ────────────────────────────────────────────────────────────────

router.post("/admin/broadcast", requireAdmin, async (req, res): Promise<void> => {
  const { sujet, contenu, userId } = req.body as { sujet: string; contenu: string; userId?: number };

  if (!sujet?.trim() || !contenu?.trim()) {
    res.status(400).json({ error: "Sujet et contenu requis" });
    return;
  }

  let targets: (typeof usersTable.$inferSelect)[];

  if (userId) {
    targets = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  } else {
    targets = await db.select().from(usersTable).where(eq(usersTable.role, "user"));
  }

  let sent = 0;
  for (const user of targets) {
    try {
      await sendBroadcast({ to: user.email, prenom: user.prenom, sujet, contenu });
      sent++;
    } catch (err) {
      console.error(`[sendpulse] broadcast to ${user.email}:`, err);
    }
  }

  res.json({ message: `Email envoyé à ${sent} utilisateur(s)`, sent });
});

// ─── FRAIS ────────────────────────────────────────────────────────────────────

router.get("/admin/frais", requireAdmin, async (_req, res): Promise<void> => {
  const all = await db.select().from(fraisTable);
  res.json(all.map(formatFrais));
});

router.post("/admin/frais", requireAdmin, async (req, res): Promise<void> => {
  const parsed = EmitFraisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { dossierId, lignes, echeanceDays } = parsed.data;

  const [dossier] = await db.select().from(dossiersTable).where(eq(dossiersTable.id, dossierId));
  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  const montantHT = lignes.reduce((s, l) => s + l.montantHT, 0);
  const montantTVA = montantHT * 0.2;
  const montantTTC = montantHT + montantTVA;

  const echeance = new Date();
  echeance.setDate(echeance.getDate() + (echeanceDays ?? 30));

  const [frais] = await db.insert(fraisTable).values({
    dossierId,
    reference: generateFraisRef(),
    montantHT: String(montantHT),
    montantTVA: String(montantTVA),
    montantTTC: String(montantTTC),
    statut: "en_attente",
    echeance,
  }).returning();

  await db.insert(fraisLignesTable).values(
    lignes.map(l => ({
      fraisId: frais.id,
      label: l.label,
      description: l.description,
      montantHT: String(l.montantHT),
    }))
  );

  await db.insert(messagesTable).values({
    dossierId,
    expediteur: "CapSubvention — Conseillers",
    expediteurRole: "admin",
    contenu: `Des frais d'instruction ont été émis pour votre dossier. Montant : ${montantTTC.toFixed(2)}€ TTC. Référence : ${frais.reference}. Merci de procéder au règlement avant le ${echeance.toLocaleDateString("fr-FR")}.`,
    lu: false,
  });

  // Email: notification frais
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  if (user) {
    sendFraisEmis({
      to: user.email,
      prenom: user.prenom,
      reference: frais.reference,
      dossierRef: dossier.reference,
      montantTTC,
      echeance,
    }).catch((err) => console.error("[sendpulse] frais emis:", err));
  }

  res.status(201).json(formatFrais(frais));
});

// ─── USERS ────────────────────────────────────────────────────────────────────

router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  res.json(users.map(formatUser));
});

// ─── PHASE ACTIONS ────────────────────────────────────────────────────────────

const PHASE_CONFIG: Record<string, { label: string; phase: number; nouveauStatut: string; progression: number; prevAction?: string }> = {
  accuser_reception:   { label: "Accusé de réception envoyé",         phase: 1, nouveauStatut: "en_instruction",  progression: 2 },
  envoyer_eligibilite: { label: "Rapport d'éligibilité envoyé",        phase: 2, nouveauStatut: "expertise",       progression: 3, prevAction: "accuser_reception" },
  envoyer_contrat:     { label: "Contrat de mission envoyé",           phase: 3, nouveauStatut: "contrat_envoye",  progression: 3, prevAction: "envoyer_eligibilite" },
  marquer_signe:       { label: "Contrat signé — dossier en cours",    phase: 4, nouveauStatut: "en_instruction",  progression: 4, prevAction: "envoyer_contrat" },
  marquer_favorable:   { label: "Décision favorable notifiée",         phase: 5, nouveauStatut: "valide",          progression: 5, prevAction: "marquer_signe" },
  confirmer_paiement:  { label: "Paiement confirmé — dossier clôturé", phase: 6, nouveauStatut: "verse",           progression: 6, prevAction: "marquer_favorable" },
};

router.get("/admin/dossiers/:id/events", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const events = await db
    .select()
    .from(dossierEventsTable)
    .where(eq(dossierEventsTable.dossierId, id))
    .orderBy(desc(dossierEventsTable.createdAt));
  res.json(events);
});

router.get("/admin/dossiers/:id/pdf/:type", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { type } = req.params;

  const [dossier] = await db.select().from(dossiersTable).where(eq(dossiersTable.id, id));
  if (!dossier) { res.status(404).json({ error: "Dossier introuvable" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  if (!user) { res.status(404).json({ error: "Utilisateur introuvable" }); return; }

  const d = {
    reference: dossier.reference, titre: dossier.titre, territoire: dossier.territoire,
    dispositif: dossier.dispositif, secteur: dossier.secteur,
    montantDemande: Number(dossier.montantDemande), description: dossier.description,
    expertDesigne: dossier.expertDesigne, createdAt: dossier.createdAt.toISOString(),
  };
  const u = { prenom: user.prenom, nom: user.nom, email: user.email, telephone: user.telephone, organisation: user.organisation, typePorteur: user.typePorteur };

  let buf: Buffer;
  let filename: string;
  try {
    switch (type) {
      case "accuse_reception":      buf = await generateAccuseReception(d, u);          filename = `accuse-reception-${dossier.reference}.pdf`; break;
      case "rapport_eligibilite":   buf = await generateRapportEligibilite(d, u);       filename = `rapport-eligibilite-${dossier.reference}.pdf`; break;
      case "contrat_mission":       buf = await generateContratMission(d, u);           filename = `contrat-mission-${dossier.reference}.pdf`; break;
      case "notification":          buf = await generateNotificationAttribution(d, u);  filename = `notification-attribution-${dossier.reference}.pdf`; break;
      case "fiche_collecte":        buf = await generateFicheCollecte(d, u);            filename = `fiche-collecte-${dossier.reference}.pdf`; break;
      case "facture":               buf = await generateFacture(d, u, dossier.reference); filename = `facture-${dossier.reference}.pdf`; break;
      default: res.status(400).json({ error: "Type de document inconnu" }); return;
    }
  } catch (err) {
    console.error("[pdf] generation error:", err);
    res.status(500).json({ error: "Erreur lors de la génération du PDF" });
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.send(buf);
});

router.post("/admin/dossiers/:id/phase-action", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { action, note, montantAccorde } = req.body as { action: string; note?: string; montantAccorde?: number };

  const config = PHASE_CONFIG[action];
  if (!config) { res.status(400).json({ error: "Action inconnue" }); return; }

  const [dossier] = await db.select().from(dossiersTable).where(eq(dossiersTable.id, id));
  if (!dossier) { res.status(404).json({ error: "Dossier introuvable" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  if (!user) { res.status(404).json({ error: "Utilisateur introuvable" }); return; }

  // Idempotence : vérifier que cette action n'a pas déjà été exécutée
  const existingEvents = await db.select().from(dossierEventsTable).where(eq(dossierEventsTable.dossierId, id));
  const executedActions = new Set(existingEvents.map(e => e.action));
  if (executedActions.has(action)) {
    res.status(409).json({ error: `L'action "${action}" a déjà été exécutée pour ce dossier.` });
    return;
  }

  // Ordre séquentiel : vérifier que la phase précédente est bien exécutée
  if (config.prevAction && !executedActions.has(config.prevAction)) {
    res.status(422).json({ error: `La phase précédente doit être exécutée en premier (${config.prevAction}).` });
    return;
  }

  const d = {
    reference: dossier.reference, titre: dossier.titre, territoire: dossier.territoire,
    dispositif: dossier.dispositif, secteur: dossier.secteur,
    montantDemande: Number(dossier.montantDemande), description: dossier.description,
    expertDesigne: dossier.expertDesigne, createdAt: dossier.createdAt.toISOString(),
  };
  const u = { prenom: user.prenom, nom: user.nom, email: user.email, telephone: user.telephone, organisation: user.organisation, typePorteur: user.typePorteur };

  await db.update(dossiersTable)
    .set({ statut: config.nouveauStatut, progressionEtape: config.progression, updatedAt: new Date() })
    .where(eq(dossiersTable.id, id));

  const [event] = await db.insert(dossierEventsTable).values({
    dossierId: id,
    phase: config.phase,
    action,
    label: config.label,
    note: note ?? null,
    documentType: action,
    declencheePar: "admin",
  }).returning();

  await db.insert(messagesTable).values({
    dossierId: id,
    expediteur: "CapSubvention",
    expediteurRole: "system",
    contenu: buildSystemMessage(action, dossier.reference, note),
    lu: false,
  });

  sendPhaseAction({ to: user.email, prenom: user.prenom, action, reference: dossier.reference, note }).catch(console.error);

  res.json({ success: true, event, nouveauStatut: config.nouveauStatut });
});

function buildSystemMessage(action: string, reference: string, note?: string): string {
  const base: Record<string, string> = {
    accuser_reception: `Votre dossier ${reference} a été pris en charge par nos équipes. Un accusé de réception officiel est disponible dans vos documents.`,
    envoyer_eligibilite: `Bonne nouvelle — votre dossier ${reference} a fait l'objet d'une analyse d'éligibilité favorable. Le rapport d'éligibilité et la fiche de renseignements complémentaires sont disponibles dans vos documents. Veuillez compléter et retourner la fiche signée.`,
    envoyer_contrat: `Votre contrat de mission est prêt. Veuillez le télécharger depuis la section Documents, le signer et le retourner à votre conseiller pour que la constitution de votre dossier puisse débuter.`,
    marquer_signe: `Votre contrat de mission a bien été réceptionné. La constitution de votre dossier de demande de financement est désormais en cours.`,
    marquer_favorable: `Excellente nouvelle — une décision favorable a été rendue pour votre dossier ${reference}. La notification d'attribution est disponible dans vos documents. Les frais d'instruction CapSubvention (456 € TTC) sont désormais exigibles.`,
    confirmer_paiement: `Votre paiement des frais d'instruction a bien été enregistré. Votre dossier est désormais clôturé. Votre facture est disponible dans vos documents.`,
  };
  const msg = base[action] ?? `Votre dossier ${reference} a été mis à jour.`;
  return note ? `${msg}\n\nNote de votre conseiller : ${note}` : msg;
}

export default router;
