import { Router, type IRouter } from "express";
import { db, dossiersTable, usersTable, fraisTable, fraisLignesTable, messagesTable, dossierEventsTable, virementsTable, coordonneesBancairesTable, reviewsTable, documentsTable, settingsTable } from "@workspace/db";
import { eq, count, desc, and, ne, inArray } from "drizzle-orm";
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
  sendVirementCodeAdmin,
  sendVirementPaiementRequest,
} from "../lib/mailer";
import { VIREMENT_LIBELLES } from "./virements";
import { t as i18nT, territoireToLang } from "../lib/i18n";
import {
  generateAccuseReception,
  generateRapportEligibilite,
  generateContratMission,
  generateNotificationAttribution,
  generateFacture,
  generateFicheCollecte,
} from "../lib/pdf";

// ─── Notification de message immédiate (compatible serverless) ────────────────
// Les environments serverless (Vercel) ne persistent pas la mémoire entre les
// requêtes — le batching via setTimeout n'est pas fiable. On envoie l'email
// immédiatement à chaque message admin.

function scheduleBatchEmail(opts: {
  dossierId: number; to: string; prenom: string; dossierRef: string; lang: string;
}): void {
  const { dossierId, to, prenom, dossierRef, lang } = opts;
  db.select({ contenu: messagesTable.contenu })
    .from(messagesTable)
    .where(and(
      eq(messagesTable.dossierId, dossierId),
      eq(messagesTable.lu, false),
      ne(messagesTable.expediteurRole, "user"),
    ))
    .then((unread) => {
      if (unread.length === 0) return;
      sendNewMessageNotification({
        to, prenom, dossierRef,
        extraits: unread.map((m) => m.contenu),
        lang,
      }).catch((err) => console.error("[mailer] message notification:", err));
    })
    .catch((err) => console.error("[mailer] DB query failed:", err));
}

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
    avatarDataUrl: u.avatarDataUrl ?? null,
    role: u.role,
    emailVerified: u.emailVerified,
    lastLoginIp: u.lastLoginIp ?? null,
    lastLoginCountry: u.lastLoginCountry ?? null,
    lastLoginCountryCode: u.lastLoginCountryCode ?? null,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    loginAttempts: u.loginAttempts ?? 0,
    lockedUntil: u.lockedUntil?.toISOString() ?? null,
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
      expediteur: "FEDE — Conseillers",
      expediteurRole: "admin",
      contenu: commentaire,
      lu: false,
    });
  }

  // Email: notification changement de statut
  // Pas d'email pour les transitions internes soumis/en_instruction
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  if (user && statut !== "soumis" && statut !== "en_instruction") {
    sendStatutChange({
      to: user.email,
      prenom: user.prenom,
      reference: dossier.reference,
      titre: dossier.titre,
      statut,
      commentaire,
      lang: territoireToLang(user.territoire),
    }).catch((err) => console.error("[mailer] statut change:", err));
  }

  const frais = await db.select().from(fraisTable).where(eq(fraisTable.dossierId, id));

  res.json({
    ...formatDossier(dossier),
    user: user ? formatUser(user) : null,
    frais: frais.map(formatFrais),
  });
});

// ─── ADMIN MESSAGES ───────────────────────────────────────────────────────────

// Compteur global de messages porteurs non-lus (tous dossiers confondus).
// Utilisé par AdminLayout pour le badge "Dossiers & Messagerie".
router.get("/admin/messages/unread-count", requireAdmin, async (_req, res): Promise<void> => {
  const [row] = await db
    .select({ count: count() })
    .from(messagesTable)
    .where(and(
      eq(messagesTable.lu, false),
      eq(messagesTable.expediteurRole, "user"),
    ));
  res.json({ count: Number(row?.count ?? 0) });
});

// Liste des messages d'un dossier (vue admin) + marque "lu" les messages porteur→admin.
// Symétrique au flow porteur (GET /dossiers/:id/messages).
router.get("/admin/dossiers/:id/messages", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [dossier] = await db.select().from(dossiersTable).where(eq(dossiersTable.id, id));
  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.dossierId, id));

  await db
    .update(messagesTable)
    .set({ lu: true })
    .where(and(
      eq(messagesTable.dossierId, id),
      eq(messagesTable.lu, false),
      eq(messagesTable.expediteurRole, "user"),
    ));

  res.json(msgs.map(m => ({
    id: m.id,
    dossierId: m.dossierId,
    expediteur: m.expediteur,
    expediteurRole: m.expediteurRole,
    contenu: m.contenu,
    lu: m.lu,
    createdAt: m.createdAt.toISOString(),
  })));
});

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
    expediteur: "FEDE — Conseillers",
    expediteurRole: "admin",
    contenu: contenu.trim(),
    lu: false,
  }).returning();

  // Email: notification nouveau message (batching 15 min)
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  if (user) {
    scheduleBatchEmail({
      dossierId: dossier.id,
      to: user.email,
      prenom: user.prenom,
      dossierRef: dossier.reference,
      lang: territoireToLang(user.territoire),
    });
  }

  // Same shape as GET — guarantees consistent rendering on the frontend.
  res.status(201).json({
    id: msg.id,
    dossierId: msg.dossierId,
    expediteur: msg.expediteur,
    expediteurRole: msg.expediteurRole,
    contenu: msg.contenu,
    lu: msg.lu,
    createdAt: msg.createdAt.toISOString(),
  });
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

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  const userLangDocs = user ? territoireToLang(user.territoire) : "fr";

  // Add a system message listing documents
  const listText = documents.map(d => `• ${d}`).join("\n");
  await db.insert(messagesTable).values({
    dossierId: id,
    expediteur: "FEDE — Conseillers",
    expediteurRole: "admin",
    contenu: `${i18nT(userLangDocs, "sys_msg_docs_intro")}\n${listText}\n\n${i18nT(userLangDocs, "sys_msg_docs_cta")}`,
    lu: false,
  });

  if (user) {
    sendDemandeDocuments({
      to: user.email,
      prenom: user.prenom,
      reference: dossier.reference,
      documents,
      lang: territoireToLang(user.territoire),
    }).catch((err) => console.error("[mailer] demande docs:", err));
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
      console.error(`[mailer] broadcast to ${user.email}:`, err);
    }
  }

  res.json({ message: `Email envoyé à ${sent} utilisateur(s)`, sent });
});

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

router.get("/admin/settings/banque-partenaire", requireAdmin, async (_req, res): Promise<void> => {
  const row = await db.query.settingsTable.findFirst({ where: eq(settingsTable.key, "banque_partenaire") });
  res.json({ value: row?.value ?? "" });
});

router.put("/admin/settings/banque-partenaire", requireAdmin, async (req, res): Promise<void> => {
  const { value } = req.body;
  if (typeof value !== "string") { res.status(400).json({ error: "Valeur invalide" }); return; }
  await db.insert(settingsTable).values({ key: "banque_partenaire", value })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
  res.json({ success: true, value });
});

// Lecture publique — utilisée par l'espace utilisateur
router.get("/settings/banque-partenaire", async (_req, res): Promise<void> => {
  const row = await db.query.settingsTable.findFirst({ where: eq(settingsTable.key, "banque_partenaire") });
  res.json({ value: row?.value ?? "" });
});

// ─── CONTACT SETTINGS ─────────────────────────────────────────────────────────

const CONTACT_KEY = "contact_info";
const DEFAULT_CONTACT = { telephone: "+33 (0) 800 123 456", email: "support@fede-financement.com", adresse: "Disponible pour toute l'Europe" };

function parseContact(row?: { value: string } | null): typeof DEFAULT_CONTACT {
  try { return { ...DEFAULT_CONTACT, ...JSON.parse(row?.value ?? "{}") }; } catch { return DEFAULT_CONTACT; }
}

router.get("/admin/settings/contact", requireAdmin, async (_req, res): Promise<void> => {
  const row = await db.query.settingsTable.findFirst({ where: eq(settingsTable.key, CONTACT_KEY) });
  res.json(parseContact(row));
});

router.put("/admin/settings/contact", requireAdmin, async (req, res): Promise<void> => {
  const { telephone, email, adresse } = req.body;
  if (typeof telephone !== "string" || typeof email !== "string" || typeof adresse !== "string") {
    res.status(400).json({ error: "Données invalides" }); return;
  }
  const value = JSON.stringify({ telephone, email, adresse });
  await db.insert(settingsTable).values({ key: CONTACT_KEY, value })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
  res.json({ success: true });
});

// Lecture publique — footer web, mobile
router.get("/settings/contact", async (_req, res): Promise<void> => {
  const row = await db.query.settingsTable.findFirst({ where: eq(settingsTable.key, CONTACT_KEY) });
  res.json(parseContact(row));
});

// ─── FRAIS ────────────────────────────────────────────────────────────────────

router.get("/admin/coordonnees-bancaires", requireAdmin, async (_req, res): Promise<void> => {
  const [row] = await db.select().from(coordonneesBancairesTable).limit(1);
  res.json(row ?? { beneficiaire: "", iban: "", bic: "", banque: "", domiciliation: "", libelleVirement: "FRAIS INSTRUCTION [REF_DOSSIER]" });
});

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

  const [coordMsgRow] = await db.select().from(coordonneesBancairesTable).limit(1);
  const libelleMsg = (() => {
    const raw = coordMsgRow
      ? (coordMsgRow.libelleVirement ?? "")
          .replace("[REF_FRAIS]", frais.reference)
          .replace("[REF_DOSSIER]", dossier.reference)
      : "";
    return raw.trim() || frais.reference;
  })();

  // Email: notification frais (avec coordonnées bancaires déjà chargées)
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
  const userLangFrais = user ? territoireToLang(user.territoire) : "fr";

  const bankBlock = coordMsgRow?.iban
    ? `\n\n— ${i18nT(userLangFrais, "e6_bank_title")} —\n${i18nT(userLangFrais, "lbl_beneficiaire")} : ${coordMsgRow.beneficiaire}\nIBAN : ${coordMsgRow.iban}\nBIC / SWIFT : ${coordMsgRow.bic}\n${i18nT(userLangFrais, "lbl_banque")} : ${coordMsgRow.banque}\n${i18nT(userLangFrais, "lbl_libelle")} : ${libelleMsg}`
    : "";

  const echeanceDateStr = echeance.toLocaleDateString(userLangFrais === "fr" ? "fr-FR" : userLangFrais, { day: "2-digit", month: "long", year: "numeric" });

  await db.insert(messagesTable).values({
    dossierId,
    expediteur: "FEDE — Conseillers",
    expediteurRole: "admin",
    contenu: `${i18nT(userLangFrais, "sys_msg_frais_intro")}\n\n${i18nT(userLangFrais, "lbl_montant_ttc")} : ${montantTTC.toFixed(2)} € TTC\n${i18nT(userLangFrais, "lbl_reference")} : ${frais.reference}\n${i18nT(userLangFrais, "lbl_echeance")} : ${echeanceDateStr}${bankBlock}\n\n${i18nT(userLangFrais, "sys_msg_frais_cta")}`,
    lu: false,
  });

  if (user) {
    sendFraisEmis({
      to: user.email,
      prenom: user.prenom,
      reference: frais.reference,
      dossierRef: dossier.reference,
      montantTTC,
      echeance,
      lang: userLangFrais,
      coordonnees: coordMsgRow?.iban ? {
        beneficiaire: coordMsgRow.beneficiaire,
        iban: coordMsgRow.iban,
        bic: coordMsgRow.bic,
        banque: coordMsgRow.banque,
        domiciliation: coordMsgRow.domiciliation,
        libelleVirement: libelleMsg,
      } : undefined,
    }).catch((err) => console.error("[mailer] frais emis:", err));
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
  confirmer_paiement:  { label: "Paiement confirmé — dossier clôturé", phase: 6, nouveauStatut: "verse",           progression: 5, prevAction: "marquer_favorable" },
};

router.get("/admin/dossiers/:id/events", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const events = await db
    .select()
    .from(dossierEventsTable)
    .where(eq(dossierEventsTable.dossierId, id))
    .orderBy(desc(dossierEventsTable.createdAt));
  res.json(events);
});

router.get("/admin/dossiers/:id/pdf/:type", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
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

  const contactRow = await db.query.settingsTable.findFirst({ where: eq(settingsTable.key, CONTACT_KEY) });
  const contact = parseContact(contactRow);

  let buf: Buffer;
  let filename: string;
  try {
    switch (type) {
      case "accuse_reception":      buf = await generateAccuseReception(d, u, "fr", contact);                         filename = `accuse-reception-${dossier.reference}.pdf`; break;
      case "rapport_eligibilite":   buf = await generateRapportEligibilite(d, u, undefined, "fr", contact);           filename = `rapport-eligibilite-${dossier.reference}.pdf`; break;
      case "contrat_mission":       buf = await generateContratMission(d, u, "fr", contact);                          filename = `contrat-mission-${dossier.reference}.pdf`; break;
      case "notification":          buf = await generateNotificationAttribution(d, u, undefined, undefined, "fr", contact); filename = `notification-attribution-${dossier.reference}.pdf`; break;
      case "fiche_collecte":        buf = await generateFicheCollecte(d, u, "fr", contact);                           filename = `fiche-collecte-${dossier.reference}.pdf`; break;
      case "facture":               buf = await generateFacture(d, u, dossier.reference, "fr", contact);              filename = `facture-${dossier.reference}.pdf`; break;
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
  const id = parseInt(String(req.params.id), 10);
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

  // Clôture : marquer tous les frais en_attente comme payés
  if (action === "confirmer_paiement") {
    await db.update(fraisTable)
      .set({ statut: "paye", paidAt: new Date() })
      .where(and(eq(fraisTable.dossierId, id), eq(fraisTable.statut, "en_attente")));
  }

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
    expediteur: "FEDE",
    expediteurRole: "system",
    contenu: buildSystemMessage(action, dossier.reference, territoireToLang(user.territoire), note),
    lu: false,
  });

  sendPhaseAction({ to: user.email, prenom: user.prenom, action, reference: dossier.reference, note, lang: territoireToLang(user.territoire) }).catch(console.error);

  res.json({ success: true, event, nouveauStatut: config.nouveauStatut });
});

// ─── ADMIN — GESTION DES UTILISATEURS ────────────────────────────────────────

router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(users.map(formatUser));
});

router.patch("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));

  // Protect admin account from modifications
  const [target] = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, id));
  if (target?.role === "admin") {
    res.status(403).json({ error: "Le compte administrateur ne peut pas être modifié." });
    return;
  }

  const { role, emailVerified, suspended } = req.body;
  const updates: Record<string, unknown> = {};
  if (role !== undefined) updates.role = role;
  if (emailVerified !== undefined) updates.emailVerified = emailVerified;
  if (suspended === true) {
    // Suspend: lock account for 100 years
    updates.lockedUntil = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
  } else if (suspended === false) {
    // Unsuspend: clear lock
    updates.lockedUntil = null;
    updates.loginAttempts = 0;
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Utilisateur introuvable" }); return; }
  res.json(formatUser(updated));
});

router.delete("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const [target] = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, id));
  if (!target) {
    res.status(404).json({ error: "Utilisateur introuvable." });
    return;
  }
  if (target.role === "admin") {
    res.status(403).json({ error: "Le compte administrateur ne peut pas être supprimé." });
    return;
  }

  // Récupérer les IDs de dossiers liés à cet utilisateur
  const dossiers = await db.select({ id: dossiersTable.id }).from(dossiersTable).where(eq(dossiersTable.userId, id));
  const dossierIds = dossiers.map(d => d.id);

  // Supprimer dans l'ordre des dépendances (enfants en premier)
  if (dossierIds.length > 0) {
    // frais_lignes → frais → documents → messages → dossier_events → virements → dossiers
    const fraisRows = await db.select({ id: fraisTable.id }).from(fraisTable).where(inArray(fraisTable.dossierId, dossierIds));
    const fraisIds = fraisRows.map(f => f.id);
    if (fraisIds.length > 0) {
      await db.delete(fraisLignesTable).where(inArray(fraisLignesTable.fraisId, fraisIds));
    }
    await db.delete(fraisTable).where(inArray(fraisTable.dossierId, dossierIds));
    await db.delete(documentsTable).where(inArray(documentsTable.dossierId, dossierIds));
    await db.delete(messagesTable).where(inArray(messagesTable.dossierId, dossierIds));
    await db.delete(dossierEventsTable).where(inArray(dossierEventsTable.dossierId, dossierIds));
    await db.delete(virementsTable).where(inArray(virementsTable.dossierId, dossierIds));
    await db.delete(dossiersTable).where(inArray(dossiersTable.id, dossierIds));
  }

  // Supprimer les avis (référencent users.id directement)
  await db.delete(reviewsTable).where(eq(reviewsTable.userId, id));

  // Supprimer l'utilisateur (verification_codes et password_reset_tokens ont onDelete: cascade)
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ success: true });
});

// ─── ADMIN — GESTION DES VIREMENTS ────────────────────────────────────────────

router.get("/admin/virements", requireAdmin, async (_req, res): Promise<void> => {
  const virements = await db
    .select({ virement: virementsTable, user: usersTable, dossier: dossiersTable })
    .from(virementsTable)
    .leftJoin(usersTable, eq(virementsTable.userId, usersTable.id))
    .leftJoin(dossiersTable, eq(virementsTable.dossierId, dossiersTable.id))
    .orderBy(desc(virementsTable.createdAt));

  res.json(virements.map(row => ({
    id: row.virement.id,
    statut: row.virement.statut,
    etapeCourante: row.virement.etapeCourante,
    iban: row.virement.iban,
    bic: row.virement.bic,
    titulaire: row.virement.titulaire,
    montant: Number(row.virement.montant),
    codeEmail1: row.virement.codeEmail1 ?? null,
    codeFinancier2: row.virement.codeFinancier2 ?? null,
    codeFinancier3: row.virement.codeFinancier3 ?? null,
    codeFinancier4: row.virement.codeFinancier4 ?? null,
    emailCodeValidatedAt1: row.virement.emailCodeValidatedAt1?.toISOString() ?? null,
    codeFinancierSentAt2: row.virement.codeFinancierSentAt2?.toISOString() ?? null,
    codeFinancierSentAt3: row.virement.codeFinancierSentAt3?.toISOString() ?? null,
    codeFinancierSentAt4: row.virement.codeFinancierSentAt4?.toISOString() ?? null,
    etape1CompletedAt: row.virement.etape1CompletedAt?.toISOString() ?? null,
    etape2CompletedAt: row.virement.etape2CompletedAt?.toISOString() ?? null,
    etape3CompletedAt: row.virement.etape3CompletedAt?.toISOString() ?? null,
    etape4CompletedAt: row.virement.etape4CompletedAt?.toISOString() ?? null,
    paiementMontant2: row.virement.paiementMontant2 ? Number(row.virement.paiementMontant2) : null,
    paiementMontant3: row.virement.paiementMontant3 ? Number(row.virement.paiementMontant3) : null,
    paiementMontant4: row.virement.paiementMontant4 ? Number(row.virement.paiementMontant4) : null,
    paiementDemandeAt2: row.virement.paiementDemandeAt2?.toISOString() ?? null,
    paiementDemandeAt3: row.virement.paiementDemandeAt3?.toISOString() ?? null,
    paiementDemandeAt4: row.virement.paiementDemandeAt4?.toISOString() ?? null,
    paiementConfirmeAt2: row.virement.paiementConfirmeAt2?.toISOString() ?? null,
    paiementConfirmeAt3: row.virement.paiementConfirmeAt3?.toISOString() ?? null,
    paiementConfirmeAt4: row.virement.paiementConfirmeAt4?.toISOString() ?? null,
    completedAt: row.virement.completedAt?.toISOString() ?? null,
    createdAt: row.virement.createdAt.toISOString(),
    user: row.user ? formatUser(row.user) : null,
    dossier: row.dossier ? formatDossier(row.dossier) : null,
  })));
});

// POST /api/admin/virements/:id/demande-paiement/:etape — envoyer une demande de paiement pour les étapes 2, 3 ou 4
router.post("/admin/virements/:id/demande-paiement/:etape", requireAdmin, async (req, res): Promise<void> => {
  const virementId = parseInt(String(req.params.id));
  const etape = parseInt(String(req.params.etape));
  const { montant, instructions } = req.body as { montant: number; instructions?: string };

  if (![2, 3, 4].includes(etape)) {
    res.status(400).json({ error: "Étape invalide." });
    return;
  }
  if (!montant || isNaN(Number(montant)) || Number(montant) <= 0) {
    res.status(400).json({ error: "Le montant est requis et doit être positif." });
    return;
  }

  const virement = await db.query.virementsTable.findFirst({ where: eq(virementsTable.id, virementId) });
  if (!virement || virement.statut !== "en_cours") {
    res.status(404).json({ error: "Virement introuvable ou non actif" });
    return;
  }
  if (virement.etapeCourante !== etape) {
    res.status(400).json({ error: `L'étape courante est ${virement.etapeCourante}, pas ${etape}` });
    return;
  }
  const demandeKey = `paiementDemandeAt${etape}` as keyof typeof virement;
  if (virement[demandeKey]) {
    res.status(400).json({ error: "Une demande de paiement a déjà été envoyée pour cette étape." });
    return;
  }

  const now = new Date();
  const montantNum = Number(montant);
  await db.update(virementsTable)
    .set({
      [`paiementMontant${etape}`]: montantNum.toString(),
      [`paiementDemandeAt${etape}`]: now,
    } as Parameters<ReturnType<typeof db.update>["set"]>[0])
    .where(eq(virementsTable.id, virementId));

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, virement.userId) });
  const dossier = await db.query.dossiersTable.findFirst({ where: eq(dossiersTable.id, virement.dossierId) });

  const banqueSetting = await db.query.settingsTable.findFirst({ where: eq(settingsTable.key, "banque_partenaire") });
  const banqueNom = banqueSetting?.value ? banqueSetting.value : undefined;

  if (user && dossier) {
    const userLangVir = territoireToLang(user.territoire);
    const libelle = VIREMENT_LIBELLES[etape] ?? `Code étape ${etape}`;
    const montantStr = montantNum.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
    const isLast = etape === 4;
    const encouragement = isLast
      ? i18nT(userLangVir, "msg_virement_encourage_last")
      : etape === 2
        ? i18nT(userLangVir, "msg_virement_encourage_2")
        : i18nT(userLangVir, "msg_virement_encourage_3");
    const banqueLine = banqueNom ? `\n${i18nT(userLangVir, "msg_virement_banque_partenaire", { banque: banqueNom })}\n` : "";
    const msgContenu = [
      isLast ? i18nT(userLangVir, "msg_virement_last_title") : libelle,
      "",
      encouragement,
      "",
      i18nT(userLangVir, "msg_virement_montant", { montant: montantStr }),
      banqueLine,
      instructions ? `${i18nT(userLangVir, "msg_virement_instructions_label")}\n${instructions}\n` : "",
      i18nT(userLangVir, "msg_virement_cta_simple"),
      "",
      `${i18nT(userLangVir, "lbl_reference")} : ${dossier.reference}`,
    ].filter(Boolean).join("\n");

    await db.insert(messagesTable).values({
      dossierId: virement.dossierId,
      expediteur: "FEDE — Service Financier",
      expediteurRole: "admin",
      contenu: msgContenu,
      lu: false,
    });

    await sendVirementPaiementRequest({
      to: user.email,
      prenom: user.prenom,
      etape,
      montant: montantNum,
      libelle,
      reference: dossier.reference,
      instructions: instructions ?? "",
      banqueNom: banqueNom ?? "",
    }).catch(console.error);
  }

  res.json({ success: true, etape, virementId, montant: montantNum });
});

// POST /api/admin/virements/:id/confirmer-paiement/:etape — confirmer la réception du paiement
router.post("/admin/virements/:id/confirmer-paiement/:etape", requireAdmin, async (req, res): Promise<void> => {
  const virementId = parseInt(String(req.params.id));
  const etape = parseInt(String(req.params.etape));

  if (![2, 3, 4].includes(etape)) {
    res.status(400).json({ error: "Étape invalide." });
    return;
  }

  const virement = await db.query.virementsTable.findFirst({ where: eq(virementsTable.id, virementId) });
  if (!virement || virement.statut !== "en_cours") {
    res.status(404).json({ error: "Virement introuvable ou non actif" });
    return;
  }
  if (virement.etapeCourante !== etape) {
    res.status(400).json({ error: `L'étape courante est ${virement.etapeCourante}, pas ${etape}` });
    return;
  }
  const demandeKey = `paiementDemandeAt${etape}` as keyof typeof virement;
  if (!virement[demandeKey]) {
    res.status(400).json({ error: "Aucune demande de paiement n'a encore été envoyée." });
    return;
  }
  const confirmeKey = `paiementConfirmeAt${etape}` as keyof typeof virement;
  if (virement[confirmeKey]) {
    res.status(400).json({ error: "Le paiement est déjà confirmé pour cette étape." });
    return;
  }

  const now = new Date();
  await db.update(virementsTable)
    .set({ [`paiementConfirmeAt${etape}`]: now } as Parameters<ReturnType<typeof db.update>["set"]>[0])
    .where(eq(virementsTable.id, virementId));

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, virement.userId) });
  const dossier = await db.query.dossiersTable.findFirst({ where: eq(dossiersTable.id, virement.dossierId) });

  if (user && dossier) {
    const userLangConfirme = territoireToLang(user.territoire);
    await db.insert(messagesTable).values({
      dossierId: virement.dossierId,
      expediteur: "FEDE — Service Financier",
      expediteurRole: "admin",
      contenu: `${i18nT(userLangConfirme, "msg_virement_paiement_recu")} ${i18nT(userLangConfirme, "lbl_reference")} : ${dossier.reference}`,
      lu: false,
    });
  }

  res.json({ success: true, etape, virementId });
});

// POST /api/admin/virements/:id/envoyer-code/:etape — envoyer le code pré-généré pour les étapes 2, 3 ou 4
router.post("/admin/virements/:id/envoyer-code/:etape", requireAdmin, async (req, res): Promise<void> => {
  const virementId = parseInt(String(req.params.id));
  const etape = parseInt(String(req.params.etape));

  if (![2, 3, 4].includes(etape)) {
    res.status(400).json({ error: "Étape invalide. Seules les étapes 2, 3 et 4 sont gérées par l'admin." });
    return;
  }

  const virement = await db.query.virementsTable.findFirst({ where: eq(virementsTable.id, virementId) });
  if (!virement || virement.statut !== "en_cours") {
    res.status(404).json({ error: "Virement introuvable ou non actif" });
    return;
  }

  if (virement.etapeCourante !== etape) {
    res.status(400).json({ error: `L'étape courante est ${virement.etapeCourante}, pas ${etape}` });
    return;
  }

  const prevEtapeKey = `etape${etape - 1}CompletedAt` as keyof typeof virement;
  if (!virement[prevEtapeKey]) {
    res.status(400).json({ error: `L'étape ${etape - 1} n'est pas encore complétée` });
    return;
  }

  // Vérifier que le paiement a été confirmé avant d'envoyer le code
  const confirmeKey = `paiementConfirmeAt${etape}` as keyof typeof virement;
  if (!virement[confirmeKey]) {
    res.status(400).json({ error: "Le paiement doit être confirmé avant d'envoyer le code." });
    return;
  }

  const sentAtKey = `codeFinancierSentAt${etape}` as keyof typeof virement;
  if (virement[sentAtKey]) {
    res.status(400).json({ error: "Le code a déjà été envoyé pour cette étape" });
    return;
  }

  const codeKey = `codeFinancier${etape}` as keyof typeof virement;
  const code = virement[codeKey] as string | null;
  if (!code) {
    res.status(500).json({ error: "Code pré-généré introuvable" });
    return;
  }

  const now = new Date();
  await db.update(virementsTable)
    .set({ [`codeFinancierSentAt${etape}`]: now })
    .where(eq(virementsTable.id, virementId));

  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, virement.userId) });
  const dossier = await db.query.dossiersTable.findFirst({ where: eq(dossiersTable.id, virement.dossierId) });

  const banqueSettingCode = await db.query.settingsTable.findFirst({ where: eq(settingsTable.key, "banque_partenaire") });
  const banqueNomCode = banqueSettingCode?.value ? banqueSettingCode.value : undefined;

  if (user && dossier) {
    const userLangCode = territoireToLang(user.territoire);
    const libelle = VIREMENT_LIBELLES[etape] ?? `Code étape ${etape}`;
    const isLast = etape === 4;
    const finalMsg = isLast
      ? `\n${i18nT(userLangCode, "msg_code_last")}`
      : "";
    const banqueLine = banqueNomCode ? `\n${i18nT(userLangCode, "msg_code_banque", { banque: banqueNomCode })}\n` : "";
    const ctaAction = isLast
      ? i18nT(userLangCode, "msg_code_cta_last")
      : i18nT(userLangCode, "msg_virement_cta_non_final");

    await db.insert(messagesTable).values({
      dossierId: virement.dossierId,
      expediteur: "FEDE — Service Financier",
      expediteurRole: "admin",
      contenu: `${isLast ? "🏁 " : ""}${i18nT(userLangCode, "msg_code_intro", { libelle })}\n\n${code}\n${banqueLine}${finalMsg}\n${i18nT(userLangCode, "msg_code_enter", { cta: ctaAction })} ${i18nT(userLangCode, "msg_code_warning")}\n\n${i18nT(userLangCode, "lbl_reference")} : ${dossier.reference}`,
      lu: false,
    });

    await sendVirementCodeAdmin({
      to: user.email,
      prenom: user.prenom,
      etape,
      code,
      libelle,
      reference: dossier.reference,
      banqueNom: banqueNomCode ?? "",
      lang: userLangCode,
    }).catch(console.error);
  }

  res.json({ success: true, etape, virementId });
});

// ─── REVIEWS — routes définies dans routes/reviews.ts (évite les doublons) ──

function buildSystemMessage(action: string, reference: string, lang: string, note?: string): string {
  const keyMap: Record<string, string> = {
    accuser_reception:   "sys_phase_accuser_reception",
    envoyer_eligibilite: "sys_phase_envoyer_eligibilite",
    envoyer_contrat:     "sys_phase_envoyer_contrat",
    marquer_signe:       "sys_phase_marquer_signe",
    marquer_favorable:   "sys_phase_marquer_favorable",
    confirmer_paiement:  "sys_phase_confirmer_paiement",
  };
  const key = keyMap[action];
  const msg = key
    ? i18nT(lang, key, { ref: reference })
    : i18nT(lang, "sys_msg_created", { ref: reference });
  const notePrefix = i18nT(lang, "note_conseiller");
  return note ? `${msg}\n\n${notePrefix} : ${note}` : msg;
}

export default router;
