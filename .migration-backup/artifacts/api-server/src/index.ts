import app from "./app";
import { logger } from "./lib/logger";

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

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  if (process.env.NODE_ENV === "production") {
    const PING_INTERVAL_MS = 14 * 60 * 1000;
    const healthUrl = `http://localhost:${port}/api/healthz`;

    setInterval(async () => {
      try {
        await fetch(healthUrl);
        logger.info("Self-ping OK — serveur actif");
      } catch (err) {
        logger.warn({ err }, "Self-ping échoué");
      }
    }, PING_INTERVAL_MS);

    logger.info({ intervalMinutes: 14 }, "Auto-ping activé");
  }
});
