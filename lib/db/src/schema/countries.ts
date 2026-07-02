import { pgTable, text, serial, boolean, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const countriesTable = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("EUR"),
  isEu: boolean("is_eu").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const programsTable = pgTable("programs", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull().references(() => countriesTable.code),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  maxAmountEur: numeric("max_amount_eur", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertCountrySchema = createInsertSchema(countriesTable).omit({ id: true });
export const insertProgramSchema = createInsertSchema(programsTable).omit({ id: true });
export type Country = typeof countriesTable.$inferSelect;
export type Program = typeof programsTable.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
