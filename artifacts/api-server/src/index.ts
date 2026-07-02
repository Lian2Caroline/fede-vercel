import app from "./app";
import { logger } from "./lib/logger";
import { ensureSessionTable } from "./lib/session";
import { seedCountriesIfEmpty } from "@workspace/db/seed-utils";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

ensureSessionTable()
  .then(() => seedCountriesIfEmpty().catch((err) => {
    logger.warn({ err }, "Country seed failed — continuing without seed");
  }))
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");

      // ── Keep-alive : self-ping toutes les 14 min pour éviter le sleep Render ──
      const selfUrl = process.env.RENDER_EXTERNAL_URL;
      if (selfUrl) {
        const pingUrl = `${selfUrl}/healthz`;
        setInterval(() => {
          fetch(pingUrl)
            .then(() => logger.debug("keep-alive ping ok"))
            .catch((e: unknown) => logger.warn({ err: e }, "keep-alive ping failed"));
        }, 12 * 60 * 1000);
        logger.info({ pingUrl }, "Keep-alive cron started");
      }
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to ensure session table — aborting");
    process.exit(1);
  });
