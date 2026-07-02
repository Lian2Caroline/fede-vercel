import { Router, type IRouter } from "express";
import { db, dossiersTable, messagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function formatMsg(msg: typeof messagesTable.$inferSelect) {
  return {
    id: msg.id,
    dossierId: msg.dossierId,
    expediteur: msg.expediteur,
    expediteurRole: msg.expediteurRole,
    contenu: msg.contenu,
    lu: msg.lu,
    createdAt: msg.createdAt.toISOString(),
  };
}

router.get("/dossiers/:id/messages", requireAuth, async (req, res): Promise<void> => {
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

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.dossierId, dossierId));

  await db
    .update(messagesTable)
    .set({ lu: true })
    .where(and(eq(messagesTable.dossierId, dossierId), eq(messagesTable.lu, false)));

  res.json(msgs.map(formatMsg));
});

router.post("/dossiers/:id/messages", requireAuth, async (req, res): Promise<void> => {
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

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [msg] = await db.insert(messagesTable).values({
    dossierId,
    expediteur: "Porteur de projet",
    expediteurRole: "user",
    contenu: parsed.data.contenu,
    lu: false,
  }).returning();

  res.status(201).json(formatMsg(msg));
});

export default router;
