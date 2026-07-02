import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dossiersTable } from "./dossiers";

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
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
