import { Router, type IRouter } from "express";
import multer from "multer";
import { db, dossiersTable, documentsTable, usersTable } from "@workspace/db";
import { eq, and, isNotNull, lt } from "drizzle-orm";
import { UploadDocumentBody } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { sanitizePdf, validateFileType } from "../lib/pdfSanitizer";
import { sendDocumentsToAdmin, sendDocumentRejected } from "../lib/mailer";

const router: IRouter = Router();

// ── Configuration ───────────────────────────────────────────────────────────
const EXPIRATION_DAYS = 7;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fede-financement.com";

// ── Multer — memory storage (we sanitize then save to DB BYTEA) ─────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Type de fichier non autorisé. Seuls les PDF, JPG et PNG sont acceptés."));
  },
});

const uploadSingle = (fieldName: string) => (req: any, res: any, next: any) => {
  upload.single(fieldName)(req, res, (err: any) => {
    if (!err) return next();
    const msg = err?.message ?? "Erreur de téléversement";
    const status = err?.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(status).json({ error: msg });
  });
};

function extFromMime(mime: string): string {
  if (mime === "application/pdf") return ".pdf";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}

function formatDoc(doc: typeof documentsTable.$inferSelect) {
  return {
    id: doc.id,
    dossierId: doc.dossierId,
    type: doc.type,
    nom: doc.nom,
    filename: doc.filename,
    statut: doc.statut,
    obligatoire: doc.obligatoire,
    uploadedAt: doc.uploadedAt?.toISOString() ?? null,
    hasFile: !!doc.data,
    envois: doc.envois ?? 0,
    envoyeAt: doc.envoyeAt?.toISOString() ?? null,
    expiresAt: doc.expiresAt?.toISOString() ?? null,
    dernierMotifRejet: doc.dernierMotifRejet ?? null,
    dernierRejetAt: doc.dernierRejetAt?.toISOString() ?? null,
    originalName: doc.originalName ?? null,
    mimeType: doc.mimeType ?? null,
  };
}

// ── Lazy cleanup of expired un-sent uploads (throttled to once / 5 min) ─────
let lastPurgeAt = 0;
const PURGE_INTERVAL_MS = 5 * 60 * 1000;
async function purgeExpired() {
  const now = Date.now();
  if (now - lastPurgeAt < PURGE_INTERVAL_MS) return;
  lastPurgeAt = now;
  try {
    await db
      .update(documentsTable)
      .set({ data: null, mimeType: null, originalName: null, expiresAt: null, statut: "manquant", filename: null, uploadedAt: null })
      .where(and(isNotNull(documentsTable.expiresAt), lt(documentsTable.expiresAt, new Date()), isNotNull(documentsTable.data)));
  } catch (e) {
    console.error("[documents] purgeExpired failed:", e);
  }
}

// ── GET: list documents for a dossier ─────────────────────────────────────────
router.get("/dossiers/:id/documents", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const dossierId = parseInt(String(req.params.id), 10);

  const [dossier] = await db
    .select()
    .from(dossiersTable)
    .where(and(eq(dossiersTable.id, dossierId), eq(dossiersTable.userId, userId)));

  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  void purgeExpired();

  const docs = await db
    .select({
      id: documentsTable.id, dossierId: documentsTable.dossierId, type: documentsTable.type,
      nom: documentsTable.nom, filename: documentsTable.filename, statut: documentsTable.statut,
      obligatoire: documentsTable.obligatoire, uploadedAt: documentsTable.uploadedAt,
      createdAt: documentsTable.createdAt,
      data: documentsTable.data, // selected for hasFile flag — lightweight Buffer presence check
      mimeType: documentsTable.mimeType, originalName: documentsTable.originalName,
      expiresAt: documentsTable.expiresAt, envois: documentsTable.envois,
      envoyeAt: documentsTable.envoyeAt,
      dernierMotifRejet: documentsTable.dernierMotifRejet,
      dernierRejetAt: documentsTable.dernierRejetAt,
    })
    .from(documentsTable)
    .where(eq(documentsTable.dossierId, dossierId));

  res.json(docs.map((d) => formatDoc(d as any)));
});

// ── POST: upload a real file → stored as BYTEA in DB ───────────────────────────
router.post(
  "/dossiers/:id/documents/upload",
  requireAuth,
  uploadSingle("file"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const dossierId = parseInt(String(req.params.id), 10);

    console.log(`[upload] start — dossierId=${dossierId} userId=${userId} file=${req.file?.originalname ?? "none"} size=${req.file?.size ?? 0} mime=${req.file?.mimetype ?? "none"}`);

    try {
      const [dossier] = await db
        .select()
        .from(dossiersTable)
        .where(and(eq(dossiersTable.id, dossierId), eq(dossiersTable.userId, userId)));

      if (!dossier) {
        res.status(404).json({ error: "Dossier introuvable" });
        return;
      }

      if (!req.file) {
        console.warn(`[upload] no file received — dossierId=${dossierId}`);
        res.status(400).json({ error: "Aucun fichier reçu." });
        return;
      }

      const { type, nom } = req.body as { type?: string; nom?: string };
      if (!type || !nom) {
        res.status(400).json({ error: "Les champs type et nom sont requis." });
        return;
      }

      const mimeType = req.file.mimetype;
      const originalName = req.file.originalname ?? "document";

      // ── Sanitization ──────────────────────────────────────────────────────
      let finalBuffer: Buffer;
      const sanitizationWarnings: string[] = [];

      if (mimeType === "application/pdf" || originalName.toLowerCase().endsWith(".pdf")) {
        const result = await sanitizePdf(req.file.buffer);
        if (!result.ok) {
          console.warn(`[upload] PDF rejeté — dossierId=${dossierId} error=${result.error}`);
          res.status(422).json({ error: result.error ?? "Le fichier PDF a été rejeté pour des raisons de sécurité.", details: result.warnings });
          return;
        }
        finalBuffer = result.buffer!;
        sanitizationWarnings.push(...result.warnings);
      } else {
        const typeCheck = validateFileType(req.file.buffer, mimeType);
        if (!typeCheck.ok) {
          res.status(422).json({ error: typeCheck.error });
          return;
        }
        finalBuffer = req.file.buffer;
      }

      // ── Find or create the document row ───────────────────────────────────
      const existing = await db
        .select()
        .from(documentsTable)
        .where(and(eq(documentsTable.dossierId, dossierId), eq(documentsTable.type, type)));

      const expiresAt = new Date(Date.now() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
      const ext = extFromMime(mimeType);
      const friendlyFilename = `${nom.replace(/[^a-zA-Z0-9._-]/g, "_")}${ext}`;

      let docId: number;
      if (existing.length > 0) {
        docId = existing[0].id;
        await db
          .update(documentsTable)
          .set({
            nom,
            filename: friendlyFilename,
            data: finalBuffer,
            mimeType,
            originalName,
            expiresAt,
            statut: "en_attente",
            uploadedAt: new Date(),
            dernierMotifRejet: null,
            dernierRejetAt: null,
          })
          .where(eq(documentsTable.id, docId));
      } else {
        const [created] = await db
          .insert(documentsTable)
          .values({
            dossierId, type, nom,
            filename: friendlyFilename,
            data: finalBuffer,
            mimeType,
            originalName,
            expiresAt,
            statut: "en_attente",
            obligatoire: false,
            uploadedAt: new Date(),
          })
          .returning();
        docId = created.id;
      }

      if (sanitizationWarnings.length > 0) {
        console.warn(`[upload] doc ${docId} — sanitization warnings:`, sanitizationWarnings);
      }

      console.log(`[upload] success — docId=${docId} dossierId=${dossierId}`);
      const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, docId));
      res.status(201).json({
        ...formatDoc(doc),
        sanitizationWarnings: sanitizationWarnings.length > 0 ? sanitizationWarnings : undefined,
      });
    } catch (err: any) {
      console.error(`[upload] ERREUR inattendue — dossierId=${dossierId}`, err);
      res.status(500).json({ error: "Erreur interne lors du dépôt. Réessayez dans quelques instants." });
    }
  }
);

// ── POST: metadata-only update (backward compat) ──────────────────────────────
router.post("/dossiers/:id/documents", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const dossierId = parseInt(String(req.params.id), 10);

  const [dossier] = await db
    .select()
    .from(dossiersTable)
    .where(and(eq(dossiersTable.id, dossierId), eq(dossiersTable.userId, userId)));

  if (!dossier) { res.status(404).json({ error: "Dossier introuvable" }); return; }

  const parsed = UploadDocumentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { type, nom, filename } = parsed.data;
  const existing = await db
    .select()
    .from(documentsTable)
    .where(and(eq(documentsTable.dossierId, dossierId), eq(documentsTable.type, type)));

  if (existing.length > 0) {
    const [updated] = await db
      .update(documentsTable)
      .set({ filename: filename ?? null, nom, statut: "en_attente", uploadedAt: new Date() })
      .where(eq(documentsTable.id, existing[0].id))
      .returning();
    res.status(201).json(formatDoc(updated));
    return;
  }

  const [doc] = await db.insert(documentsTable).values({
    dossierId, type, nom,
    filename: filename ?? null,
    statut: "en_attente",
    obligatoire: false,
    uploadedAt: new Date(),
  }).returning();

  res.status(201).json(formatDoc(doc));
});

// ── GET: download a stored file (user owns dossier, or admin) ─────────────────
router.get(
  "/dossiers/:dossierId/documents/:docId/file",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const isAdmin = req.session.userRole === "admin";
    const dossierId = parseInt(String(req.params.dossierId), 10);
    const docId = parseInt(String(req.params.docId), 10);

    if (isAdmin) {
      // Admin access requires fresh TOTP verification (same gate as requireAdmin),
      // unless the request is bearer-authenticated.
      if (!req.session._bearerAuth) {
        const ADMIN_TOTP_SESSION_MS = 8 * 60 * 60 * 1000;
        const verified = req.session.adminTotpVerified === true;
        const verifiedAt = req.session.adminTotpVerifiedAt ?? 0;
        const expired = Date.now() - verifiedAt > ADMIN_TOTP_SESSION_MS;
        if (!verified || expired) {
          req.session.adminTotpVerified = undefined;
          req.session.adminTotpVerifiedAt = undefined;
          res.status(403).json({ error: "Vérification TOTP requise", requiresTotpVerification: true });
          return;
        }
      }
    } else {
      const [dossier] = await db
        .select()
        .from(dossiersTable)
        .where(and(eq(dossiersTable.id, dossierId), eq(dossiersTable.userId, userId)));
      if (!dossier) { res.status(403).json({ error: "Accès refusé" }); return; }
    }

    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(and(eq(documentsTable.id, docId), eq(documentsTable.dossierId, dossierId)));

    if (!doc) { res.status(404).json({ error: "Document introuvable" }); return; }
    if (!doc.data) { res.status(410).json({ error: "Le fichier n'est plus disponible (déjà transmis au conseiller ou expiré)." }); return; }

    res.setHeader("Content-Type", doc.mimeType ?? "application/octet-stream");
    const safeName = (doc.nom ?? "document").replace(/[^a-zA-Z0-9._-]/g, "_") + extFromMime(doc.mimeType ?? "");
    res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
    res.send(doc.data);
  }
);

// ── DELETE: remove an uploaded document (resets to "manquant") ────────────────
router.delete(
  "/dossiers/:dossierId/documents/:docId",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const dossierId = parseInt(String(req.params.dossierId), 10);
    const docId = parseInt(String(req.params.docId), 10);

    const [dossier] = await db
      .select()
      .from(dossiersTable)
      .where(and(eq(dossiersTable.id, dossierId), eq(dossiersTable.userId, userId)));

    if (!dossier) { res.status(404).json({ error: "Dossier introuvable" }); return; }

    await db
      .update(documentsTable)
      .set({
        filename: null, statut: "manquant", uploadedAt: null,
        data: null, mimeType: null, originalName: null, expiresAt: null,
      })
      .where(and(eq(documentsTable.id, docId), eq(documentsTable.dossierId, dossierId)));

    res.json({ message: "Document supprimé" });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT — utilisateur clique « Envoyer mon dossier au conseiller »
// Envoie 1 email à l'admin avec TOUTES les pièces déposées en pj, puis nettoie
// les binaires de la DB tout en conservant la métadonnée (statut "envoye").
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/dossiers/:id/documents/submit",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const dossierId = parseInt(String(req.params.id), 10);

    const [dossier] = await db
      .select()
      .from(dossiersTable)
      .where(and(eq(dossiersTable.id, dossierId), eq(dossiersTable.userId, userId)));
    if (!dossier) { res.status(404).json({ error: "Dossier introuvable" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(401).json({ error: "Utilisateur introuvable" }); return; }

    // Récupérer tous les documents avec contenu non envoyé
    const pending = await db
      .select()
      .from(documentsTable)
      .where(and(eq(documentsTable.dossierId, dossierId), isNotNull(documentsTable.data)));

    if (pending.length === 0) {
      res.status(400).json({ error: "Aucun document à envoyer." });
      return;
    }

    const attachments = pending.map((d) => ({
      filename: (d.nom ?? "document").replace(/[^a-zA-Z0-9._-]/g, "_") + extFromMime(d.mimeType ?? ""),
      content: d.data!,
      contentType: d.mimeType ?? "application/octet-stream",
    }));

    try {
      await sendDocumentsToAdmin({
        to: ADMIN_EMAIL,
        userPrenom: user.prenom,
        userNom: user.nom,
        userEmail: user.email,
        dossierRef: dossier.reference,
        dossierTitre: dossier.titre,
        territoire: dossier.territoire ?? undefined,
        secteur: dossier.secteur ?? undefined,
        montantDemande: dossier.montantDemande ? Number(dossier.montantDemande) : undefined,
        montantApport: dossier.montantApport ? Number(dossier.montantApport) : undefined,
        description: dossier.description,
        justificationBudget: dossier.justificationBudget,
        documents: pending.map((d) => ({ nom: d.nom, type: d.type })),
        attachments,
      });
    } catch (e: any) {
      console.error("[documents/submit] email failed:", e);
      res.status(502).json({ error: "L'envoi par email au conseiller a échoué. Réessayez dans quelques instants." });
      return;
    }

    // Email envoyé → on nettoie les binaires, on marque "envoye"
    const now = new Date();
    for (const d of pending) {
      await db
        .update(documentsTable)
        .set({
          data: null, mimeType: null, originalName: null, expiresAt: null,
          statut: "envoye",
          envois: (d.envois ?? 0) + 1,
          envoyeAt: now,
        })
        .where(eq(documentsTable.id, d.id));
    }

    res.json({ message: "Dossier envoyé à votre conseiller.", count: pending.length });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — review d'un document (validate / reject avec motif)
// Si reject : email automatique à l'utilisateur avec le motif
// ─────────────────────────────────────────────────────────────────────────────
router.patch(
  "/admin/dossiers/:dossierId/documents/:docId",
  requireAdmin,
  async (req, res): Promise<void> => {
    const dossierId = parseInt(String(req.params.dossierId), 10);
    const docId = parseInt(String(req.params.docId), 10);
    const { statut, motif } = req.body as { statut?: string; motif?: string };

    if (!statut || !["valide", "rejete"].includes(statut)) {
      res.status(400).json({ error: "Statut invalide. Attendu : valide ou rejete." });
      return;
    }
    if (statut === "rejete" && (!motif || motif.trim().length < 3)) {
      res.status(400).json({ error: "Un motif de rejet est requis (3 caractères minimum)." });
      return;
    }

    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(and(eq(documentsTable.id, docId), eq(documentsTable.dossierId, dossierId)));
    if (!doc) { res.status(404).json({ error: "Document introuvable" }); return; }

    const [dossier] = await db.select().from(dossiersTable).where(eq(dossiersTable.id, dossierId));
    if (!dossier) { res.status(404).json({ error: "Dossier introuvable" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dossier.userId));
    if (!user) { res.status(404).json({ error: "Utilisateur introuvable" }); return; }

    const update: Partial<typeof documentsTable.$inferInsert> = { statut };
    if (statut === "rejete") {
      update.dernierMotifRejet = motif!.trim();
      update.dernierRejetAt = new Date();
    } else {
      update.dernierMotifRejet = null;
      update.dernierRejetAt = null;
    }

    const [updated] = await db
      .update(documentsTable)
      .set(update)
      .where(eq(documentsTable.id, docId))
      .returning();

    if (statut === "rejete") {
      sendDocumentRejected({
        to: user.email,
        prenom: user.prenom,
        dossierRef: dossier.reference,
        documentNom: doc.nom,
        motif: motif!.trim(),
      }).catch((e) => console.error("[mailer] document rejected:", e));
    }

    res.json(formatDoc(updated));
  }
);

// ── ADMIN — list documents of a dossier ──────────────────────────────────────
router.get(
  "/admin/dossiers/:id/documents",
  requireAdmin,
  async (req, res): Promise<void> => {
    const dossierId = parseInt(String(req.params.id), 10);
    const docs = await db.select().from(documentsTable).where(eq(documentsTable.dossierId, dossierId));
    res.json(docs.map(formatDoc));
  }
);

export default router;
