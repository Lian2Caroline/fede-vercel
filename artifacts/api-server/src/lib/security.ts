import { Request, Response, NextFunction } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import {
  redisGlobalRateLimit,
  redisAuthRateLimit,
  redisOtpRateLimit,
  hasRedis,
} from "./rateLimitRedis";

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

const BOT_BLOCK_EXEMPT_PATHS = ["/api/healthz"];

export function blockBots(req: Request, res: Response, next: NextFunction) {
  if (BOT_BLOCK_EXEMPT_PATHS.includes(req.path)) { next(); return; }
  const ua = req.headers["user-agent"] ?? "";
  if (ua && BLOCKED_UA_PATTERNS.some((p) => p.test(ua))) {
    res.status(403).json({ error: "Accès refusé." });
    return;
  }
  next();
}

// ── In-memory fallbacks (développement uniquement) ───────────────────────────
const inMemoryGlobalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes. Veuillez réessayer dans quelques minutes." },
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1",
});

const inMemoryAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes." },
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? req.socket?.remoteAddress ?? "unknown"),
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1",
});

const inMemoryOtpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de demandes de code. Veuillez patienter 1 heure." },
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? req.socket?.remoteAddress ?? "unknown"),
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1",
});

// ── Exports : Redis en production, in-memory en développement ────────────────
export const globalRateLimit = hasRedis ? redisGlobalRateLimit : inMemoryGlobalRateLimit;
export const authRateLimit   = hasRedis ? redisAuthRateLimit   : inMemoryAuthRateLimit;
export const otpRateLimit    = hasRedis ? redisOtpRateLimit    : inMemoryOtpRateLimit;

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
