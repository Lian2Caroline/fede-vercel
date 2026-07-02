import { Request, Response, NextFunction } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// ── Scrapers & bots connus à bloquer ────────────────────────────────────────
const BLOCKED_UA_PATTERNS = [
  /HTTrack/i,
  /WebCopier/i,
  /wget/i,
  /^curl\//i,
  /libwww-perl/i,
  /python-requests/i,
  /python-urllib/i,
  /scrapy/i,
  /SiteSnagger/i,
  /WebReaper/i,
  /Teleport/i,
  /NetAnts/i,
  /WebZip/i,
  /Offline\s*Explorer/i,
  /PageGrabber/i,
  /SurveyBot/i,
  /DataForSeoBot/i,
  /AhrefsBot/i,
  /SemrushBot/i,
  /DotBot/i,
  /MJ12bot/i,
  /ia_archiver/i,
];

// Paths exempt from bot blocking (health probes, platform checks)
const BOT_BLOCK_EXEMPT_PATHS = ["/api/healthz"];

export function blockBots(req: Request, res: Response, next: NextFunction) {
  // Always allow exempt paths (health probes, platform monitoring)
  if (BOT_BLOCK_EXEMPT_PATHS.includes(req.path)) {
    next();
    return;
  }
  const ua = req.headers["user-agent"] ?? "";
  // Allow empty UA (platform probes, internal tooling) — only block known bad UAs
  if (ua && BLOCKED_UA_PATTERNS.some((p) => p.test(ua))) {
    res.status(403).json({ error: "Accès refusé." });
    return;
  }
  next();
}

// ── Rate limiting global ─────────────────────────────────────────────────────
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes. Veuillez réessayer dans quelques minutes." },
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1",
});

// ── Rate limiting strict sur les routes auth ─────────────────────────────────
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes." },
  keyGenerator: (req) => String(req.ip ?? req.socket?.remoteAddress ?? "unknown"),
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1",
});

// ── Rate limiting très strict sur l'envoi de codes OTP ──────────────────────
export const otpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de demandes de code. Veuillez patienter 1 heure." },
  keyGenerator: (req) => String(req.ip ?? req.socket?.remoteAddress ?? "unknown"),
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1",
});

// ── En-têtes de sécurité manuels ─────────────────────────────────────────────
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  next();
}
