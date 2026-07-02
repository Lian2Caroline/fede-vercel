import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const dossiersTable = pgTable("dossiers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  reference: text("reference").notNull().unique(),
  titre: text("titre").notNull(),
  territoire: text("territoire").notNull(),
  dispositif: text("dispositif").notNull(),
  secteur: text("secteur").notNull(),
  statut: text("statut").notNull().default("brouillon"),
  description: text("description"),
  montantDemande: numeric("montant_demande", { precision: 12, scale: 2 }).notNull().default("0"),
  montantApport: numeric("montant_apport", { precision: 12, scale: 2 }).default("0"),
  justificationBudget: text("justification_budget"),
  dateDebut: text("date_debut"),
  dureeProjet: text("duree_projet"),
  progressionEtape: integer("progression_etape").notNull().default(1),
  totalEtapes: integer("total_etapes").notNull().default(5),
  expertDesigne: text("expert_designe"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDossierSchema = createInsertSchema(dossiersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDossier = z.infer<typeof insertDossierSchema>;
export type Dossier = typeof dossiersTable.$inferSelect;
