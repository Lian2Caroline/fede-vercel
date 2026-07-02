import { createRoot } from "react-dom/client";
import i18n from "@/i18n";
import { exportElementAsPdf } from "./doc-pdf";
import { renderDoc, DocType, DocDossierData, DocUserData } from "./doc-render";

const BASE = import.meta.env.VITE_API_URL ?? "";

async function generateAndDownload(
  type: DocType,
  dossier: DocDossierData,
  user: DocUserData,
  filename: string,
): Promise<void> {
  const lang = i18n.language || 'fr';
  const docNode = renderDoc(type, dossier, user, lang);
  if (!docNode) throw new Error("Type de document inconnu : " + type);

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:0;left:-9999px;width:794px;pointer-events:none;z-index:-9999;background:#fff;";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(docNode);

  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    await exportElementAsPdf(container, filename);
  } finally {
    root.unmount();
    container.remove();
  }
}

export async function downloadAdminDoc(dossierId: number, type: string): Promise<void> {
  const r = await fetch(`${BASE}/api/admin/dossiers/${dossierId}`, { credentials: "include" });
  if (!r.ok) throw new Error("Dossier introuvable");
  const data = await r.json();
  const { user: u, frais: _f, messages: _m, ...dossierFields } = data;
  const filename = `${type.replace(/_/g, "-")}-${dossierFields.reference}.pdf`;
  await generateAndDownload(type as DocType, dossierFields as DocDossierData, u as DocUserData, filename);
}

export async function downloadUserDoc(
  dossierId: number,
  type: string,
  user: DocUserData,
): Promise<void> {
  const r = await fetch(`${BASE}/api/dossiers/${dossierId}`, { credentials: "include" });
  if (!r.ok) throw new Error("Dossier introuvable");
  const data = await r.json();
  const { documents: _d, messages: _m, frais: _f, timeline: _t, ...dossierFields } = data;
  const filename = `${type.replace(/_/g, "-")}-${dossierFields.reference}.pdf`;
  await generateAndDownload(type as DocType, dossierFields as DocDossierData, user, filename);
}
