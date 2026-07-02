import type { IncomingMessage, ServerResponse } from "http";
import app from "../artifacts/api-server/src/app";
import { ensureSessionTable } from "../artifacts/api-server/src/lib/session";
import { seedCountriesIfEmpty } from "../lib/db/src/seed-utils";

let initDone = false;
let initError: unknown = null;

const initPromise = ensureSessionTable()
  .then(() =>
    seedCountriesIfEmpty().catch((err: unknown) => {
      console.error("[init] Country seed failed — continuing:", err);
    }),
  )
  .then(() => {
    initDone = true;
  })
  .catch((err: unknown) => {
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
    res.end(
      JSON.stringify({ error: "Service temporarily unavailable. Please retry." }),
    );
    return;
  }

  // Express app is callable as a Node.js request handler
  (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(
    req,
    res,
  );
}
