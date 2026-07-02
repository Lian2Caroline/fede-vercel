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
app.use(helmet({ contentSecurityPolicy: false }));
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
