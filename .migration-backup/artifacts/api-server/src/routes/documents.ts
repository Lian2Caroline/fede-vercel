import { Router, type IRouter } from "express";
import { db, dossiersTable, documentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { UploadDocumentBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

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
  };
}

router.get("/dossiers/:id/documents", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const dossierId = parseInt(rawId, 10);

  const [dossier] = await db
    .select()
    .from(dossiersTable)
    .where(and(eq(dossiersTable.id, dossierId), eq(dossiersTable.userId, userId)));

  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  const docs = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.dossierId, dossierId));

  res.json(docs.map(formatDoc));
});

router.post("/dossiers/:id/documents", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const dossierId = parseInt(rawId, 10);

  const [dossier] = await db
    .select()
    .from(dossiersTable)
    .where(and(eq(dossiersTable.id, dossierId), eq(dossiersTable.userId, userId)));

  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  const parsed = UploadDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, nom, filename } = parsed.data;

  const existing = await db
    .select()
    .from(documentsTable)
    .where(and(eq(documentsTable.dossierId, dossierId), eq(documentsTable.type, type)));

  if (existing.length > 0) {
    const [updated] = await db
      .update(documentsTable)
      .set({
        filename: filename ?? null,
        nom,
        statut: "en_attente",
        uploadedAt: new Date(),
      })
      .where(eq(documentsTable.id, existing[0].id))
      .returning();
    res.status(201).json(formatDoc(updated));
    return;
  }

  const [doc] = await db.insert(documentsTable).values({
    dossierId,
    type,
    nom,
    filename: filename ?? null,
    statut: "en_attente",
    obligatoire: false,
    uploadedAt: new Date(),
  }).returning();

  res.status(201).json(formatDoc(doc));
});

router.delete("/dossiers/:dossierId/documents/:docId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawDossierId = Array.isArray(req.params.dossierId) ? req.params.dossierId[0] : req.params.dossierId;
  const rawDocId = Array.isArray(req.params.docId) ? req.params.docId[0] : req.params.docId;
  const dossierId = parseInt(rawDossierId, 10);
  const docId = parseInt(rawDocId, 10);

  const [dossier] = await db
    .select()
    .from(dossiersTable)
    .where(and(eq(dossiersTable.id, dossierId), eq(dossiersTable.userId, userId)));

  if (!dossier) {
    res.status(404).json({ error: "Dossier introuvable" });
    return;
  }

  await db
    .update(documentsTable)
    .set({ filename: null, statut: "manquant", uploadedAt: null })
    .where(and(eq(documentsTable.id, docId), eq(documentsTable.dossierId, dossierId)));

  res.json({ message: "Document supprimé" });
});

export default router;
