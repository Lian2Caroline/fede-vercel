import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dossiersTable } from "./dossiers";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  dossierId: integer("dossier_id").notNull().references(() => dossiersTable.id),
  expediteur: text("expediteur").notNull(),
  expediteurRole: text("expediteur_role").notNull().default("system"),
  contenu: text("contenu").notNull(),
  lu: boolean("lu").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
