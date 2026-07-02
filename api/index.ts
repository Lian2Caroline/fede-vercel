import app from "../artifacts/api-server/src/app";
import { ensureSessionTable } from "../artifacts/api-server/src/lib/session";
import { seedCountriesIfEmpty } from "@workspace/db/seed-utils";

const initPromise = ensureSessionTable()
  .then(() =>
    seedCountriesIfEmpty().catch((err) => {
      console.error("[init] Country seed failed — continuing:", err);
    }),
  )
  .catch((err) => {
    console.error("[init] Session table setup failed:", err);
  });

export default async function handler(req: any, res: any) {
  await initPromise;
  app(req, res);
}
