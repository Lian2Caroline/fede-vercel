import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, verificationCodesTable, passwordResetTokensTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { sendEmailVerification, sendLoginVerification, sendPasswordReset } from "../lib/sendpulse";
import { authRateLimit, otpRateLimit } from "../lib/security";
import crypto from "crypto";

const router: IRouter = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    telephone: user.telephone,
    territoire: user.territoire,
    typePorteur: user.typePorteur,
    organisation: user.organisation,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

function getClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return ip.trim();
  }
  return req.socket?.remoteAddress ?? req.ip ?? "unknown";
}

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ─── REGISTER ────────────────────────────────────────────────────────────────

router.post("/auth/register", authRateLimit, async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prenom, nom, email, password, telephone, territoire, typePorteur, organisation } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "Un compte existe déjà avec cet email" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db.insert(usersTable).values({
    prenom,
    nom,
    email,
    passwordHash,
    telephone: telephone ?? null,
    territoire,
    typePorteur,
    organisation: organisation ?? null,
    role: "user",
    emailVerified: false,
  }).returning();

  // Send email verification code (valid 10 min)
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(verificationCodesTable).values({
    userId: user.id,
    code,
    ipAddress: "register",
    expiresAt,
  });

  sendEmailVerification({ to: user.email, prenom: user.prenom, code }).catch(
    (err) => console.error("[sendpulse] register verification:", err)
  );

  res.status(202).json({
    requiresEmailVerification: true,
    userId: user.id,
    message: `Un code de vérification a été envoyé à ${email}. Veuillez le saisir pour finaliser votre inscription.`,
  });
});

// ─── VERIFY EMAIL (post-inscription) ─────────────────────────────────────────

router.post("/auth/verify-email", otpRateLimit, async (req, res): Promise<void> => {
  const { userId, code } = req.body as { userId: number; code: string };

  if (!userId || !code) {
    res.status(400).json({ error: "userId et code requis" });
    return;
  }

  const now = new Date();

  const [record] = await db
    .select()
    .from(verificationCodesTable)
    .where(
      and(
        eq(verificationCodesTable.userId, userId),
        eq(verificationCodesTable.code, code.trim()),
        eq(verificationCodesTable.used, false),
        gt(verificationCodesTable.expiresAt, now),
      )
    );

  if (!record) {
    res.status(401).json({ error: "Code invalide ou expiré. Demandez un nouveau code." });
    return;
  }

  await db.update(verificationCodesTable).set({ used: true }).where(eq(verificationCodesTable.id, record.id));

  const [user] = await db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;

  const mobileToken = crypto.randomBytes(32).toString("hex");
  await db.update(usersTable).set({ mobileAuthToken: mobileToken }).where(eq(usersTable.id, user.id));

  res.json({
    user: formatUser(user),
    token: mobileToken,
  });
});

// ─── RESEND VERIFICATION EMAIL ────────────────────────────────────────────────

router.post("/auth/resend-verification", otpRateLimit, async (req, res): Promise<void> => {
  const { userId } = req.body as { userId: number };

  if (!userId) {
    res.status(400).json({ error: "userId requis" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }
  if (user.emailVerified) {
    res.status(400).json({ error: "Email déjà vérifié" });
    return;
  }

  // Invalidate previous codes
  await db.update(verificationCodesTable).set({ used: true }).where(
    and(eq(verificationCodesTable.userId, userId), eq(verificationCodesTable.used, false))
  );

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(verificationCodesTable).values({
    userId: user.id,
    code,
    ipAddress: "register",
    expiresAt,
  });

  sendEmailVerification({ to: user.email, prenom: user.prenom, code }).catch(
    (err) => console.error("[sendpulse] resend verification:", err)
  );

  res.json({ message: "Nouveau code envoyé" });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────

router.post("/auth/login", authRateLimit, async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const clientIp = getClientIp(req);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  // Block unverified accounts
  if (!user.emailVerified) {
    // Re-send a fresh code
    await db.update(verificationCodesTable).set({ used: true }).where(
      and(eq(verificationCodesTable.userId, user.id), eq(verificationCodesTable.used, false))
    );
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.insert(verificationCodesTable).values({ userId: user.id, code, ipAddress: "register", expiresAt });
    sendEmailVerification({ to: user.email, prenom: user.prenom, code }).catch(console.error);

    res.status(403).json({
      requiresEmailVerification: true,
      userId: user.id,
      message: "Votre adresse email n'est pas encore vérifiée. Un nouveau code vient d'être envoyé.",
    });
    return;
  }

  // 2FA: IP change detection
  const ipChanged = user.lastLoginIp !== null && user.lastLoginIp !== clientIp;

  if (ipChanged) {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.delete(verificationCodesTable).where(
      and(eq(verificationCodesTable.userId, user.id), eq(verificationCodesTable.used, false))
    );

    await db.insert(verificationCodesTable).values({
      userId: user.id,
      code,
      ipAddress: clientIp,
      expiresAt,
    });

    sendLoginVerification({
      to: user.email,
      prenom: user.prenom,
      code,
      ipAddress: clientIp,
    }).catch((err) => console.error("[sendpulse] 2fa:", err));

    res.status(202).json({
      requiresVerification: true,
      userId: user.id,
      message: "Nouvelle adresse IP détectée. Un code de vérification a été envoyé à votre adresse email.",
    });
    return;
  }

  // Normal login
  req.session.userId = user.id;
  req.session.userRole = user.role;

  const mobileToken = crypto.randomBytes(32).toString("hex");
  await db.update(usersTable).set({ lastLoginIp: clientIp, mobileAuthToken: mobileToken }).where(eq(usersTable.id, user.id));

  res.json({ user: formatUser(user), token: mobileToken });
});

// ─── VERIFY CODE (2FA) ────────────────────────────────────────────────────────

router.post("/auth/verify-code", otpRateLimit, async (req, res): Promise<void> => {
  const { userId, code } = req.body as { userId: number; code: string };

  if (!userId || !code) {
    res.status(400).json({ error: "userId et code requis" });
    return;
  }

  const now = new Date();

  const [record] = await db
    .select()
    .from(verificationCodesTable)
    .where(
      and(
        eq(verificationCodesTable.userId, userId),
        eq(verificationCodesTable.code, code.trim()),
        eq(verificationCodesTable.used, false),
        gt(verificationCodesTable.expiresAt, now),
      )
    );

  if (!record) {
    res.status(401).json({ error: "Code invalide ou expiré. Veuillez vous reconnecter." });
    return;
  }

  await db.update(verificationCodesTable).set({ used: true }).where(eq(verificationCodesTable.id, record.id));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  const mobileToken = crypto.randomBytes(32).toString("hex");
  await db.update(usersTable).set({ lastLoginIp: record.ipAddress, mobileAuthToken: mobileToken }).where(eq(usersTable.id, user.id));

  req.session.userId = user.id;
  req.session.userRole = user.role;

  res.json({ user: formatUser(user), token: mobileToken });
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

router.post("/auth/forgot-password", authRateLimit, async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Adresse e-mail requise." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));

  // Always respond with success to avoid email enumeration
  if (!user) {
    res.json({ message: "Si ce compte existe, un e-mail a été envoyé." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokensTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  const resetUrl = `${process.env.FRONTEND_URL ?? "https://www.capsubvention.com"}/reset-password?token=${token}`;

  await sendPasswordReset({ to: user.email, prenom: user.prenom, resetUrl });

  res.json({ message: "Si ce compte existe, un e-mail a été envoyé." });
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Token manquant." });
    return;
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
    return;
  }

  const [resetToken] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(
      and(
        eq(passwordResetTokensTable.token, token),
        eq(passwordResetTokensTable.used, false),
        gt(passwordResetTokensTable.expiresAt, new Date())
      )
    );

  if (!resetToken) {
    res.status(400).json({ error: "Ce lien de réinitialisation est invalide ou a expiré." });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, resetToken.userId));
  await db.update(passwordResetTokensTable).set({ used: true }).where(eq(passwordResetTokensTable.id, resetToken.id));

  res.json({ message: "Mot de passe modifié avec succès." });
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => res.json({ message: "Déconnecté avec succès" }));
});

// ─── ME ───────────────────────────────────────────────────────────────────────

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!));
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }
  res.json(formatUser(user));
});

export default router;
