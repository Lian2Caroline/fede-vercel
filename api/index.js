import {
  app,
  ensureSessionTable,
  seedCountriesIfEmpty,
} from "../artifacts/api-server/dist/serverless.mjs";

let initDone = false;
let initError = null;

const initPromise = ensureSessionTable()
  .then(() =>
    seedCountriesIfEmpty().catch((err) => {
      console.error("[init] Country seed failed:", err?.message ?? err);
      console.error("[init] Stack:", err?.stack);
    }),
  )
  .then(() => {
    initDone = true;
    console.log("[init] Startup complete");
  })
  .catch((err) => {
    initError = err;
    console.error("[init] Fatal startup error:", err?.message ?? err);
    console.error("[init] Stack:", err?.stack);
  });

export default async function handler(req, res) {
  await initPromise;

  if (initError && !initDone) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Service temporarily unavailable. Please retry." }),
    );
    return;
  }

  app(req, res);
}
