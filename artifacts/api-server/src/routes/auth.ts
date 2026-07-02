import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { verifyTotp } from "../lib/totp";
import { getIpInfo, isAfricanIp, isVpnOrProxy } from "../lib/ipCheck";
import { db, usersTable, verificationCodesTable, passwordResetTokensTable, adminAuditLogTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { sendEmailVerification, sendLoginVerification, sendPasswordReset } from "../lib/mailer";
import { authRateLimit, otpRateLimit } from "../lib/security";
import { territoireToLang } from "../lib/i18n";
import crypto from "crypto";

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  try {
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    });
    const data = await resp.json() as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// Persists lastLoginIp/Country/At for a user. Tolerant: failure of geo lookup
// must never block login (we still write IP + timestamp).
async function persistLoginLocation(userId: number, ip: string, mobileToken: string): Promise<void> {
  let country: string | null = null;
  let countryCode: string | null = null;
  try {
    const info = await getIpInfo(ip);
    if (info) {
      country = info.country ?? null;
      countryCode = info.countryCode ?? null;
    }
  } catch {
    // Silent: geo enrichment is best-effort.
  }
  await db.update(usersTable).set({
    lastLoginIp: ip,
    lastLoginCountry: country,
    lastLoginCountryCode: countryCode,
    lastLoginAt: new Date(),
    mobileAuthToken: mobileToken,
  }).where(eq(usersTable.id, userId));
}

// Admin: lock after 3 failed attempts for 60 min
// Users:  lock after 5 failed attempts for 30 min
const ADMIN_MAX_ATTEMPTS = 3;
const USER_MAX_ATTEMPTS = 5;
const ADMIN_LOCKOUT_MS = 60 * 60 * 1000;
const USER_LOCKOUT_MS = 30 * 60 * 1000;

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
    avatarDataUrl: user.avatarDataUrl ?? null,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

// Validation des photos de profil envoyées en data URL base64.
// Limite ~280 Ko sur la chaîne data URL (~200 Ko binaire) — protège la DB.
// Côté client on vise 200 Ko, on garde une marge serveur.
const AVATAR_MAX_BYTES = 280 * 1024;
const AVATAR_DATA_URL_RE = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;
function validateAvatar(value: unknown): { ok: true; value: string | null } | { ok: false; error: string; status: number } {
  if (value === null) return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false, error: "Format invalide", status: 400 };
  if (!AVATAR_DATA_URL_RE.test(value)) return { ok: false, error: "Image invalide (PNG/JPEG/WebP base64 attendu)", status: 400 };
  if (value.length > AVATAR_MAX_BYTES) return { ok: false, error: "Image trop volumineuse (max 280 Ko)", status: 413 };
  return { ok: true, value };
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

async function auditLog(opts: {
  adminId: number | null;
  action: string;
  targetId?: number | null;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
}) {
  try {
    await db.insert(adminAuditLogTable).values({
      adminId: opts.adminId,
      action: opts.action,
      targetId: opts.targetId ?? null,
      details: opts.details ?? null,
      ipAddress: opts.ipAddress ?? null,
      userAgent: opts.userAgent ?? null,
      success: opts.success ?? true,
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}

async function handleFailedAttempt(user: typeof usersTable.$inferSelect): Promise<{
  attempts: number;
  lockedUntil: Date | null;
}> {
  const isAdmin = user.role === "admin";
  const maxAttempts = isAdmin ? ADMIN_MAX_ATTEMPTS : USER_MAX_ATTEMPTS;
  const lockoutMs = isAdmin ? ADMIN_LOCKOUT_MS : USER_LOCKOUT_MS;
  const newAttempts = (user.loginAttempts ?? 0) + 1;
  const shouldLock = newAttempts >= maxAttempts;
  const lockedUntil = shouldLock ? new Date(Date.now() + lockoutMs) : null;

  await db.update(usersTable).set({
    loginAttempts: newAttempts,
    lockedUntil: shouldLock ? lockedUntil : user.lockedUntil,
  }).where(eq(usersTable.id, user.id));

  return { attempts: newAttempts, lockedUntil: shouldLock ? lockedUntil : user.lockedUntil ?? null };
}

async function resetLoginAttempts(userId: number) {
  await db.update(usersTable).set({ loginAttempts: 0, lockedUntil: null }).where(eq(usersTable.id, userId));
}

// ─── REGISTER ────────────────────────────────────────────────────────────────

router.post("/auth/register", authRateLimit, async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prenom, nom, email, password, telephone, territoire, typePorteur, organisation, turnstileToken } = parsed.data;
  const clientIp = getClientIp(req);

  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      res.status(400).json({ error: "Vérification CAPTCHA requise." });
      return;
    }
    const valid = await verifyTurnstile(turnstileToken);
    if (!valid) {
      res.status(400).json({ error: "Vérification CAPTCHA échouée. Veuillez réessayer." });
      return;
    }
  }

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

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(verificationCodesTable).values({
    userId: user.id,
    code,
    ipAddress: "register",
    expiresAt,
  });

  sendEmailVerification({ to: user.email, prenom: user.prenom, code }).catch(
    (err) => console.error("[mailer] register verification:", err)
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
    (err) => console.error("[mailer] resend verification:", err)
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
  const userAgent = req.headers["user-agent"] ?? "unknown";

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    // Don't reveal whether email exists
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  // ── Layer 1a: Account suspended (admin action — locked for > 1 year) ────────
  const SUSPENSION_THRESHOLD_MS = 365 * 24 * 60 * 60 * 1000;
  if (user.lockedUntil && user.lockedUntil.getTime() - Date.now() > SUSPENSION_THRESHOLD_MS) {
    res.status(403).json({
      error: "Your account has been suspended by an administrator. Please contact support.",
      accountSuspended: true,
    });
    return;
  }

  // ── Layer 1b: Temporary lockout (rate-limiting after failed attempts) ─────
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMs = user.lockedUntil.getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);

    await auditLog({
      adminId: user.role === "admin" ? user.id : null,
      action: "login_blocked_lockout",
      ipAddress: clientIp,
      userAgent,
      success: false,
      details: { email, remainingMin },
    });

    res.status(423).json({
      error: `Compte temporairement verrouillé suite à de trop nombreuses tentatives. Réessayez dans ${remainingMin} minute${remainingMin > 1 ? "s" : ""}.`,
      lockedUntil: user.lockedUntil.toISOString(),
    });
    return;
  }

  // ── Layer 2: Password verification ───────────────────────────────────────
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const { attempts, lockedUntil } = await handleFailedAttempt(user);
    const isAdmin = user.role === "admin";
    const maxAttempts = isAdmin ? ADMIN_MAX_ATTEMPTS : USER_MAX_ATTEMPTS;

    await auditLog({
      adminId: isAdmin ? user.id : null,
      action: "login_failed_password",
      ipAddress: clientIp,
      userAgent,
      success: false,
      details: { email, attempts, maxAttempts, locked: !!lockedUntil },
    });

    if (lockedUntil) {
      const remainingMin = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
      res.status(423).json({
        error: `Trop de tentatives échouées. Compte verrouillé pendant ${remainingMin} minute${remainingMin > 1 ? "s" : ""}.`,
        lockedUntil: lockedUntil.toISOString(),
        minutesLeft: remainingMin,
      });
      return;
    }

    const remaining = maxAttempts - attempts;
    res.status(401).json({
      error: remaining > 0
        ? `Email ou mot de passe incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""} avant verrouillage.`
        : "Email ou mot de passe incorrect",
      remainingAttempts: remaining,
    });
    return;
  }

  // ── Layer 3: VPN check (non-admin users only) ─────────────────────────────
  if (user.role !== "admin") {
    const loginIpInfo = await getIpInfo(clientIp);
    if (loginIpInfo && isVpnOrProxy(loginIpInfo)) {
      await auditLog({
        adminId: null,
        action: "login_blocked_vpn",
        ipAddress: clientIp,
        userAgent,
        success: false,
        details: { email, isp: loginIpInfo.isp, country: loginIpInfo.country },
      });
      res.status(403).json({
        error: "Connexion VPN ou proxy détectée. Veuillez désactiver votre VPN pour accéder à votre espace.",
        vpnDetected: true,
      });
      return;
    }
  }

  // ── Layer 4: Email verification ───────────────────────────────────────────
  if (!user.emailVerified) {
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

  // ── Layer 4 (ADMIN): TOTP required every login ────────────────────────────
  if (user.role === "admin" && user.totpEnabled && user.totpSecret) {
    // Store pending TOTP state in session (not yet a full admin session)
    req.session.pendingTotpUserId = user.id;

    await auditLog({
      adminId: user.id,
      action: "admin_totp_challenge",
      ipAddress: clientIp,
      userAgent,
      success: true,
      details: { email },
    });

    res.status(202).json({
      requiresTotpVerification: true,
      userId: user.id,
      message: "Authentification à deux facteurs requise. Ouvrez votre application d'authentification et saisissez le code.",
    });
    return;
  }

  // ── Layer 4 (USERS): IP change 2FA ────────────────────────────────────────
  const ipChanged = user.lastLoginIp !== null && user.lastLoginIp !== clientIp;

  if (ipChanged) {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Mark old unused codes as used instead of deleting — prevents "expired" errors
    // when user re-attempts login before entering the first code
    await db.update(verificationCodesTable)
      .set({ used: true })
      .where(and(eq(verificationCodesTable.userId, user.id), eq(verificationCodesTable.used, false)));

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
    }).catch((err) => console.error("[mailer] 2fa:", err));

    res.status(202).json({
      requiresVerification: true,
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
      message: "Nouvelle adresse IP détectée. Un code de vérification a été envoyé à votre adresse email.",
    });
    return;
  }

  // ── Normal login ──────────────────────────────────────────────────────────
  await resetLoginAttempts(user.id);
  req.session.userId = user.id;
  req.session.userRole = user.role;

  // Admin without TOTP: mark session as verified so requireAdmin passes
  if (user.role === "admin") {
    req.session.adminTotpVerified = true;
    req.session.adminTotpVerifiedAt = Date.now();
  }

  const mobileToken = crypto.randomBytes(32).toString("hex");
  await persistLoginLocation(user.id, clientIp, mobileToken);

  res.json({ user: formatUser(user), token: mobileToken });
});

// ─── ADMIN TOTP VERIFICATION ──────────────────────────────────────────────────

router.post("/auth/admin/verify-totp", otpRateLimit, async (req, res): Promise<void> => {
  const { userId, totp } = req.body as { userId: number; totp: string };
  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"] ?? "unknown";

  if (!userId || !totp) {
    res.status(400).json({ error: "userId et totp requis" });
    return;
  }

  // ── Security: must have completed password step in same session ──────────
  if (!req.session?.pendingTotpUserId || req.session.pendingTotpUserId !== Number(userId)) {
    await auditLog({
      adminId: null,
      action: "admin_totp_session_mismatch",
      ipAddress: clientIp,
      userAgent,
      success: false,
      details: { userId, pendingId: req.session?.pendingTotpUserId },
    });
    res.status(403).json({ error: "Session de vérification invalide. Veuillez vous reconnecter." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(userId)));
  if (!user || user.role !== "admin") {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  // ── Check lockout again ───────────────────────────────────────────────────
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMin = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    res.status(423).json({
      error: `Compte verrouillé. Réessayez dans ${remainingMin} minute${remainingMin > 1 ? "s" : ""}.`,
      lockedUntil: user.lockedUntil.toISOString(),
    });
    return;
  }

  if (!user.totpSecret) {
    res.status(500).json({ error: "TOTP non configuré pour ce compte." });
    return;
  }

  // ── Validate TOTP ─────────────────────────────────────────────────────────
  const cleanTotp = totp.replace(/\s/g, "");
  const isValid = verifyTotp(user.totpSecret, cleanTotp);

  if (!isValid) {
    const { attempts, lockedUntil } = await handleFailedAttempt(user);

    await auditLog({
      adminId: user.id,
      action: "admin_totp_failed",
      ipAddress: clientIp,
      userAgent,
      success: false,
      details: { attempts, locked: !!lockedUntil },
    });

    if (lockedUntil) {
      const remainingMin = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
      // Destroy the pending session
      req.session.pendingTotpUserId = undefined;
      res.status(423).json({
        error: `Code incorrect. Compte verrouillé pendant ${remainingMin} minute${remainingMin > 1 ? "s" : ""}.`,
        lockedUntil: lockedUntil.toISOString(),
      });
      return;
    }

    const remaining = ADMIN_MAX_ATTEMPTS - attempts;
    res.status(401).json({
      error: remaining > 0
        ? `Code incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""} avant verrouillage.`
        : "Code incorrect",
    });
    return;
  }

  // ── TOTP valid — elevate session ──────────────────────────────────────────
  await resetLoginAttempts(user.id);

  const mobileToken = crypto.randomBytes(32).toString("hex");
  await persistLoginLocation(user.id, clientIp, mobileToken);

  // Clear pending TOTP state and establish full admin session
  req.session.pendingTotpUserId = undefined;
  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.adminTotpVerified = true;
  req.session.adminTotpVerifiedAt = Date.now();

  await auditLog({
    adminId: user.id,
    action: "admin_login_success",
    ipAddress: clientIp,
    userAgent,
    success: true,
    details: { email: user.email },
  });

  res.json({ user: formatUser(user), token: mobileToken });
});

// ─── VERIFY CODE (2FA email for regular users) ────────────────────────────────

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

  await resetLoginAttempts(user.id);

  const mobileToken = crypto.randomBytes(32).toString("hex");
  await persistLoginLocation(user.id, record.ipAddress, mobileToken);

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

  if (!user) {
    res.json({ message: "Si ce compte existe, un e-mail a été envoyé." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(passwordResetTokensTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  const resetUrl = `${process.env.FRONTEND_URL ?? "https://www.fede-financement.com"}/reset-password?token=${token}`;
  const lang = territoireToLang(user.territoire);

  await sendPasswordReset({ to: user.email, prenom: user.prenom, resetUrl, lang });

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

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

router.patch("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { telephone, organisation, avatarDataUrl } = req.body as {
    telephone?: string;
    organisation?: string;
    avatarDataUrl?: string | null;
  };

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (telephone !== undefined) updates.telephone = telephone || null;
  if (organisation !== undefined) updates.organisation = organisation || null;
  if (avatarDataUrl !== undefined) {
    const v = validateAvatar(avatarDataUrl);
    if (!v.ok) {
      res.status(v.status).json({ error: v.error });
      return;
    }
    updates.avatarDataUrl = v.value;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Aucun champ à mettre à jour" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  res.json(formatUser(updated));
});

export default router;
