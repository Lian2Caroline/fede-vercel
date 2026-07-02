import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  prenom: text("prenom").notNull(),
  nom: text("nom").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  telephone: text("telephone"),
  territoire: text("territoire").notNull(),
  typePorteur: text("type_porteur").notNull(),
  organisation: text("organisation"),
  role: text("role").notNull().default("user"),
  emailVerified: boolean("email_verified").notNull().default(false),
  lastLoginIp: text("last_login_ip"),
  mobileAuthToken: text("mobile_auth_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
