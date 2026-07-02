import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
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
  avatarDataUrl: text("avatar_data_url"),
  role: text("role").notNull().default("user"),
  emailVerified: boolean("email_verified").notNull().default(false),
  lastLoginIp: text("last_login_ip"),
  lastLoginCountry: text("last_login_country"),
  lastLoginCountryCode: text("last_login_country_code"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  mobileAuthToken: text("mobile_auth_token"),
  // Security: brute-force lockout
  loginAttempts: integer("login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  // Security: TOTP (Google Authenticator)
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const adminAuditLogTable = pgTable("admin_audit_log", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => usersTable.id),
  action: text("action").notNull(),
  targetId: integer("target_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
