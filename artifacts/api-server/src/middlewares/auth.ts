import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyPdfToken } from "../lib/pdfToken";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userRole?: string;
    adminTotpVerified?: boolean;
    adminTotpVerifiedAt?: number;
    pendingTotpUserId?: number;
    _bearerAuth?: boolean;
  }
}

// Admin TOTP session validity: 8 hours
const ADMIN_TOTP_SESSION_MS = 8 * 60 * 60 * 1000;

// Accounts locked for more than 1 year are considered suspended (not rate-limited)
const SUSPENSION_THRESHOLD_MS = 365 * 24 * 60 * 60 * 1000;

async function resolveAuthFromBearer(req: Request): Promise<boolean> {
  const authHeader = req.headers["authorization"];

  let token: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim() || null;
  }

  if (!token || token.length < 32) return false;

  const [user] = await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.mobileAuthToken, token));

  if (!user) return false;

  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session._bearerAuth = true;

  return true;
}

async function resolveAuthFromPdfToken(req: Request): Promise<boolean> {
  const queryToken = typeof req.query?.token === "string" ? req.query.token : null;
  if (!queryToken) return false;

  const userId = verifyPdfToken(queryToken);
  if (!userId) return false;

  const [user] = await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) return false;

  req.session.userId = user.id;
  req.session.userRole = user.role;
  return true;
}

/**
 * Verify the resolved user still exists and is not suspended.
 * Returns true when the request may proceed, false when a response has already
 * been sent and the caller must return immediately.
 */
async function checkAccountStatus(req: Request, res: Response): Promise<boolean> {
  const userId = req.session.userId;
  if (!userId) return true;

  const [user] = await db
    .select({ id: usersTable.id, lockedUntil: usersTable.lockedUntil })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    if (!req.session._bearerAuth) req.session.destroy(() => {});
    res.status(401).json({
      error: "Your session is no longer valid. This account no longer exists.",
      accountDeleted: true,
    });
    return false;
  }

  if (user.lockedUntil && user.lockedUntil.getTime() - Date.now() > SUSPENSION_THRESHOLD_MS) {
    if (!req.session._bearerAuth) req.session.destroy(() => {});
    res.status(403).json({
      error: "Your account has been suspended by an administrator. Please contact support.",
      accountSuspended: true,
    });
    return false;
  }

  return true;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.session?.userId) {
    const ok = await checkAccountStatus(req, res);
    if (!ok) return;
    next();
    return;
  }
  const ok = await resolveAuthFromBearer(req);
  if (!ok) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }
  const statusOk = await checkAccountStatus(req, res);
  if (!statusOk) return;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Resolve identity (session or bearer)
  if (!req.session?.userId) {
    const ok = await resolveAuthFromBearer(req);
    if (!ok) {
      res.status(401).json({ error: "Non authentifié" });
      return;
    }
  }

  if (req.session.userRole !== "admin") {
    res.status(403).json({ error: "Accès interdit" });
    return;
  }

  // For session-based admin access: require TOTP verification
  if (!req.session._bearerAuth) {
    const verified = req.session.adminTotpVerified === true;
    const verifiedAt = req.session.adminTotpVerifiedAt ?? 0;
    const expired = Date.now() - verifiedAt > ADMIN_TOTP_SESSION_MS;

    if (!verified || expired) {
      // Clear stale session data
      req.session.adminTotpVerified = undefined;
      req.session.adminTotpVerifiedAt = undefined;
      res.status(403).json({
        error: "Vérification TOTP requise",
        requiresTotpVerification: true,
      });
      return;
    }
  }

  next();
}

// Use only on PDF download routes
export async function requireAuthForPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.session?.userId) {
    next();
    return;
  }
  const bearerOk = await resolveAuthFromBearer(req);
  if (bearerOk) { next(); return; }

  const tokenOk = await resolveAuthFromPdfToken(req);
  if (!tokenOk) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }
  next();
}
