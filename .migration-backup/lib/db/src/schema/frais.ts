import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dossiersTable } from "./dossiers";

export const fraisTable = pgTable("frais", {
  id: serial("id").primaryKey(),
  dossierId: integer("dossier_id").notNull().references(() => dossiersTable.id),
  reference: text("reference").notNull().unique(),
  montantHT: numeric("montant_ht", { precision: 12, scale: 2 }).notNull().default("380"),
  montantTVA: numeric("montant_tva", { precision: 12, scale: 2 }).notNull().default("76"),
  montantTTC: numeric("montant_ttc", { precision: 12, scale: 2 }).notNull().default("456"),
  statut: text("statut").notNull().default("en_attente"),
  echeance: timestamp("echeance", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fraisLignesTable = pgTable("frais_lignes", {
  id: serial("id").primaryKey(),
  fraisId: integer("frais_id").notNull().references(() => fraisTable.id),
  label: text("label").notNull(),
  description: text("description").notNull(),
  montantHT: numeric("montant_ht", { precision: 12, scale: 2 }).notNull(),
});

export const insertFraisSchema = createInsertSchema(fraisTable).omit({ id: true, createdAt: true });
export type InsertFrais = z.infer<typeof insertFraisSchema>;
export type Frais = typeof fraisTable.$inferSelect;

export const insertFraisLigneSchema = createInsertSchema(fraisLignesTable).omit({ id: true });
export type InsertFraisLigne = z.infer<typeof insertFraisLigneSchema>;
export type FraisLigne = typeof fraisLignesTable.$inferSelect;
