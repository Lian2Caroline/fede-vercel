import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dossiersTable } from "./dossiers";
import { usersTable } from "./users";

export const virementsTable = pgTable("virements", {
  id: serial("id").primaryKey(),
  dossierId: integer("dossier_id").notNull().references(() => dossiersTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  statut: text("statut").notNull().default("en_attente"),
  etapeCourante: integer("etape_courante").notNull().default(1),
  iban: text("iban").notNull(),
  bic: text("bic").notNull(),
  titulaire: text("titulaire").notNull(),
  montant: numeric("montant", { precision: 12, scale: 2 }).notNull(),
  codeEmail1: text("code_email_1"),
  codeEmail2: text("code_email_2"),
  codeEmail3: text("code_email_3"),
  codeEmail4: text("code_email_4"),
  codeFinancier1: text("code_financier_1"),
  codeFinancier2: text("code_financier_2"),
  codeFinancier3: text("code_financier_3"),
  codeFinancier4: text("code_financier_4"),
  etape1CompletedAt: timestamp("etape1_completed_at", { withTimezone: true }),
  etape2CompletedAt: timestamp("etape2_completed_at", { withTimezone: true }),
  etape3CompletedAt: timestamp("etape3_completed_at", { withTimezone: true }),
  etape4CompletedAt: timestamp("etape4_completed_at", { withTimezone: true }),
  emailCodeValidatedAt1: timestamp("email_code_validated_at_1", { withTimezone: true }),
  emailCodeValidatedAt2: timestamp("email_code_validated_at_2", { withTimezone: true }),
  emailCodeValidatedAt3: timestamp("email_code_validated_at_3", { withTimezone: true }),
  emailCodeValidatedAt4: timestamp("email_code_validated_at_4", { withTimezone: true }),
  codeEmailSentAt: timestamp("code_email_sent_at", { withTimezone: true }),
  codeFinancierSentAt2: timestamp("code_financier_sent_at_2", { withTimezone: true }),
  codeFinancierSentAt3: timestamp("code_financier_sent_at_3", { withTimezone: true }),
  codeFinancierSentAt4: timestamp("code_financier_sent_at_4", { withTimezone: true }),
  paiementMontant2: numeric("paiement_montant_2", { precision: 12, scale: 2 }),
  paiementMontant3: numeric("paiement_montant_3", { precision: 12, scale: 2 }),
  paiementMontant4: numeric("paiement_montant_4", { precision: 12, scale: 2 }),
  paiementDemandeAt2: timestamp("paiement_demande_at_2", { withTimezone: true }),
  paiementDemandeAt3: timestamp("paiement_demande_at_3", { withTimezone: true }),
  paiementDemandeAt4: timestamp("paiement_demande_at_4", { withTimezone: true }),
  paiementConfirmeAt2: timestamp("paiement_confirme_at_2", { withTimezone: true }),
  paiementConfirmeAt3: timestamp("paiement_confirme_at_3", { withTimezone: true }),
  paiementConfirmeAt4: timestamp("paiement_confirme_at_4", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVirementSchema = createInsertSchema(virementsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVirement = z.infer<typeof insertVirementSchema>;
export type Virement = typeof virementsTable.$inferSelect;
