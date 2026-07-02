import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./lib/session";
import { blockBots, globalRateLimit, securityHeaders } from "./lib/security";

const app: Express = express();

app.set("trust proxy", 1);

const allowedOrigin = process.env.CORS_ORIGIN;

// ── Sécurité ─────────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'none'"],
        frameAncestors: ["'none'"],
        baseUri:        ["'self'"],
        formAction:     ["'self'"],
      },
    },
  }),
);
app.use(securityHeaders);
app.use(blockBots);
app.use(globalRateLimit);

app.use(
  cors({
    origin: allowedOrigin
      ? (origin, cb) => {
          if (!origin || origin === allowedOrigin) return cb(null, true);
          cb(new Error(`Origin ${origin} not allowed by CORS`));
        }
      : true,
    credentials: true,
  }),
);

app.use(sessionMiddleware);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Limite 300 Ko : couvre les avatars data-URL ~250 Ko (validés en route) +
// marge JSON. Au-delà, Express renvoie 413 avant le handler.
app.use(express.json({ limit: "300kb" }));
app.use(express.urlencoded({ extended: true, limit: "300kb" }));

app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Vary", "Cookie, Authorization");
  next();
});

app.use("/api", router);

// ── Gestionnaire d'erreurs global (doit être après toutes les routes) ─────────
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err?.status ?? err?.statusCode ?? 500;
  const message = err?.message ?? "Erreur interne du serveur";
  if (status >= 500) {
    console.error("[express error]", err);
  }
  res.status(status).json({ error: message });
});

export default app;
