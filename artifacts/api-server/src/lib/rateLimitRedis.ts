import { type Request, type Response, type NextFunction } from "express";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function makeRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = makeRedis();

if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — " +
    "rate limiting is in-memory and will NOT work across Vercel invocations."
  );
}

function makeLimiter(
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string,
): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window), prefix });
}

const globalLimiter  = makeLimiter(300, "15 m", "rl:global");
const authLimiter    = makeLimiter(20,  "15 m", "rl:auth");
const otpLimiter     = makeLimiter(5,   "60 m", "rl:otp");

function getIp(req: Request): string {
  return req.ip ?? req.socket?.remoteAddress ?? "unknown";
}

function isLocal(ip: string) {
  return ip === "127.0.0.1" || ip === "::1";
}

function makeMiddleware(
  limiter: Ratelimit | null,
  errorMsg: string,
): (req: Request, res: Response, next: NextFunction) => void {
  if (!limiter) {
    return (_req, _res, next) => next();
  }
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = getIp(req);
    if (isLocal(ip)) { next(); return; }
    try {
      const { success, limit, remaining, reset } = await limiter.limit(ip);
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", reset);
      if (!success) {
        res.status(429).json({ error: errorMsg });
        return;
      }
    } catch (err) {
      console.error("[ratelimit] Redis error — allowing request:", err);
    }
    next();
  };
}

export const redisGlobalRateLimit = makeMiddleware(
  globalLimiter,
  "Trop de requêtes. Veuillez réessayer dans quelques minutes.",
);

export const redisAuthRateLimit = makeMiddleware(
  authLimiter,
  "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
);

export const redisOtpRateLimit = makeMiddleware(
  otpLimiter,
  "Trop de demandes de code. Veuillez patienter 1 heure.",
);

export const hasRedis = redis !== null;
