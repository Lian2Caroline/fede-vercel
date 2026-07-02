import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function resolveAuthFromBearer(req: Request): Promise<boolean> {
  // Token peut venir du header Authorization ou du query param ?token= (pour les URLs PDF sur mobile)
  const authHeader = req.headers["authorization"];
  const queryToken = typeof req.query?.token === "string" ? req.query.token : null;

  let token: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim() || null;
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token || token.length < 32) return false;

  const [user] = await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.mobileAuthToken, token));

  if (!user) return false;

  req.session.userId = user.id;
  req.session.userRole = user.role;
  return true;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.session?.userId) {
    next();
    return;
  }
  const ok = await resolveAuthFromBearer(req);
  if (!ok) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  next();
}
