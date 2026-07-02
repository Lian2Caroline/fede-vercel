import { Router, type IRouter } from "express";
import { db, reviewsTable, usersTable, messagesTable, dossiersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function formatReview(r: typeof reviewsTable.$inferSelect) {
  return {
    id: r.id,
    userId: r.userId,
    name: r.name,
    territoire: r.territoire,
    typeProjet: r.typeProjet,
    note: r.note,
    texte: r.texte,
    montant: r.montant,
    dispositif: r.dispositif,
    date: r.date,
    verified: r.verified,
    status: r.status,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/reviews", async (_req, res): Promise<void> => {
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.status, "approved"))
    .orderBy(desc(reviewsTable.createdAt));
  res.json(reviews.map(formatReview));
});

router.post("/reviews", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { note, texte, typeProjet } = req.body;

  if (!texte || texte.trim().length < 20) {
    res.status(400).json({ error: "Le texte doit faire au moins 20 caractères." });
    return;
  }
  if (!note || note < 1 || note > 5) {
    res.status(400).json({ error: "La note doit être entre 1 et 5." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "Utilisateur introuvable" });
    return;
  }

  const now = new Date();
  const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const dateStr = `${months[now.getMonth()]} ${now.getFullYear()}`;

  const [review] = await db.insert(reviewsTable).values({
    userId,
    name: `${user.prenom} ${user.nom[0]}.`,
    territoire: user.territoire ?? "",
    typeProjet: typeProjet?.trim() || "Projet",
    note: Number(note),
    texte: texte.trim(),
    date: dateStr,
    verified: true,
    status: "pending",
  }).returning();

  res.status(201).json(formatReview(review));
});

router.get("/admin/reviews", requireAdmin, async (_req, res): Promise<void> => {
  const reviews = await db
    .select()
    .from(reviewsTable)
    .orderBy(desc(reviewsTable.createdAt));
  res.json(reviews.map(formatReview));
});

router.patch("/admin/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const { status, adminNote } = req.body;

  const allowed = ["pending", "approved", "rejected"];
  if (status && !allowed.includes(status)) {
    res.status(400).json({ error: "Statut invalide" });
    return;
  }

  const [review] = await db
    .update(reviewsTable)
    .set({
      ...(status ? { status } : {}),
      ...(adminNote !== undefined ? { adminNote } : {}),
    })
    .where(eq(reviewsTable.id, id))
    .returning();

  if (!review) {
    res.status(404).json({ error: "Avis introuvable" });
    return;
  }

  res.json(formatReview(review));
});

router.delete("/admin/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
  res.json({ ok: true });
});

router.post("/admin/reviews", requireAdmin, async (req, res): Promise<void> => {
  const { name, territoire, typeProjet, note, texte, montant, dispositif } = req.body;

  if (!name || !territoire || !texte || !note) {
    res.status(400).json({ error: "Champs requis manquants" });
    return;
  }

  const now = new Date();
  const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const dateStr = `${months[now.getMonth()]} ${now.getFullYear()}`;

  const [review] = await db.insert(reviewsTable).values({
    userId: null,
    name: name.trim(),
    territoire: territoire.trim(),
    typeProjet: (typeProjet ?? "").trim(),
    note: Number(note),
    texte: texte.trim(),
    montant: montant?.trim() || null,
    dispositif: dispositif?.trim() || null,
    date: dateStr,
    verified: true,
    status: "approved",
  }).returning();

  res.status(201).json(formatReview(review));
});

export default router;
