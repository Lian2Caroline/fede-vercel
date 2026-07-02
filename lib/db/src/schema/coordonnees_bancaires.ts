import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const coordonneesBancairesTable = pgTable("coordonnees_bancaires", {
  id: serial("id").primaryKey(),
  beneficiaire: text("beneficiaire").notNull().default(""),
  iban: text("iban").notNull().default(""),
  bic: text("bic").notNull().default(""),
  banque: text("banque").notNull().default(""),
  domiciliation: text("domiciliation").notNull().default(""),
  libelleVirement: text("libelle_virement").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type CoordonneesBancaires = typeof coordonneesBancairesTable.$inferSelect;
