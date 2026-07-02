let appModule = null;
let importError = null;

const loadPromise = import("../artifacts/api-server/dist/serverless.mjs")
  .then((m) => {
    appModule = m;
    console.log("[boot] Module loaded OK");
  })
  .catch((err) => {
    importError = err;
    console.error("[boot] MODULE LOAD FAILED:", err?.message);
    console.error("[boot] Stack:", err?.stack);
  });

let initDone = false;
let initError = null;

async function runInit() {
  if (!appModule) return;
  try {
    await appModule.ensureSessionTable();
    console.log("[boot] Session table OK");
  } catch (err) {
    console.error("[boot] ensureSessionTable failed:", err?.message);
  }
  try {
    await appModule.seedCountriesIfEmpty();
    console.log("[boot] Seed OK");
  } catch (err) {
    console.error("[boot] seedCountriesIfEmpty failed:", err?.message, err?.stack);
  }
  initDone = true;
}

const initPromise = loadPromise.then(() => runInit()).catch((err) => {
  initError = err;
  console.error("[boot] Init failed:", err?.message);
});

export default async function handler(req, res) {
  await initPromise;

  if (importError) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Server failed to start",
        detail: importError?.message ?? String(importError),
        stack: importError?.stack?.split("\n").slice(0, 5),
      }),
    );
    return;
  }

  if (!appModule) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server not ready" }));
    return;
  }

  appModule.app(req, res);
}
