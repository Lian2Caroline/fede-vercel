import { pgTable, text, serial, timestamp, integer, boolean, customType } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dossiersTable } from "./dossiers";

const bytea = customType<{ data: Buffer; default: false }>({
  dataType() {
    return "bytea";
  },
});

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  dossierId: integer("dossier_id").notNull().references(() => dossiersTable.id),
  type: text("type").notNull(),
  nom: text("nom").notNull(),
  filename: text("filename"),
  statut: text("statut").notNull().default("manquant"),
  obligatoire: boolean("obligatoire").notNull().default(true),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // ── Stockage temporaire (jusqu'à l'envoi groupé par email à l'admin) ──
  data: bytea("data"),
  mimeType: text("mime_type"),
  originalName: text("original_name"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  // ── Traçabilité ──
  envois: integer("envois").notNull().default(0),
  envoyeAt: timestamp("envoye_at", { withTimezone: true }),
  dernierMotifRejet: text("dernier_motif_rejet"),
  dernierRejetAt: timestamp("dernier_rejet_at", { withTimezone: true }),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
