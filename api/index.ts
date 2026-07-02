import type { IncomingMessage, ServerResponse } from "http";
import app from "../artifacts/api-server/src/app";
import { ensureSessionTable } from "../artifacts/api-server/src/lib/session";
import { seedCountriesIfEmpty } from "@workspace/db/seed-utils";

let initDone = false;
let initError: unknown = null;

const initPromise = ensureSessionTable()
  .then(() =>
    seedCountriesIfEmpty().catch((err) => {
      console.error("[init] Country seed failed — continuing:", err);
    }),
  )
  .then(() => {
    initDone = true;
  })
  .catch((err) => {
    initError = err;
    console.error("[init] Startup failed:", err);
  });

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  await initPromise;

  if (initError && !initDone) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Service temporarily unavailable. Please retry." }));
    return;
  }

  app(req as any, res as any);
}
