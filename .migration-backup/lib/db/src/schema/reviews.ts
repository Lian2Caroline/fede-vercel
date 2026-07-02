import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  name: text("name").notNull(),
  territoire: text("territoire").notNull(),
  typeProjet: text("type_projet").notNull().default(""),
  note: integer("note").notNull().default(5),
  texte: text("texte").notNull(),
  montant: text("montant"),
  dispositif: text("dispositif"),
  date: text("date").notNull().default(""),
  verified: boolean("verified").notNull().default(false),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Review = typeof reviewsTable.$inferSelect;
