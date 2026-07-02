import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dossiersTable } from "./dossiers";

export const dossierEventsTable = pgTable("dossier_events", {
  id: serial("id").primaryKey(),
  dossierId: integer("dossier_id").notNull().references(() => dossiersTable.id),
  phase: integer("phase").notNull(),
  action: text("action").notNull(),
  label: text("label").notNull(),
  note: text("note"),
  documentType: text("document_type"),
  documentUrl: text("document_url"),
  declencheePar: text("declenchee_par").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDossierEventSchema = createInsertSchema(dossierEventsTable).omit({ id: true, createdAt: true });
export type InsertDossierEvent = z.infer<typeof insertDossierEventSchema>;
export type DossierEvent = typeof dossierEventsTable.$inferSelect;
