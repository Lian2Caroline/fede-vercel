import PDFDocument from "pdfkit";
import { t } from "./i18n";

// ── Palette ────────────────────────────────────────────────────────────────────
const BLEU        = "#0D1F3C";
const GOLD        = "#B5872A";
const GRIS_CLAIR  = "#F5F6FA";
const GRIS_TEXTE  = "#4A5568";
const BLANC       = "#FFFFFF";
const VERT_CLAIR  = "#ECFDF5";
const VERT_FONCE  = "#065F46";
const BLEU_CLAIR  = "#EBF4FF";
const BLEU_INFO   = "#1E40AF";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface DossierData {
  reference: string;
  titre: string;
  territoire: string;
  dispositif: string;
  secteur: string;
  montantDemande: number;
  description?: string | null;
  expertDesigne?: string | null;
  createdAt: string;
}

export interface UserData {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  organisation?: string | null;
  typePorteur?: string | null;
}

export interface ContactInfo {
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
}

// ── Utilitaires ────────────────────────────────────────────────────────────────
function bufferFromDoc(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function localeDateStr(lang: string, date?: Date): string {
  const d = date ?? new Date();
  const localeMap: Record<string, string> = {
    fr:"fr-FR", en:"en-GB", es:"es-ES", pt:"pt-PT", it:"it-IT", de:"de-DE",
    nl:"nl-NL", pl:"pl-PL", ro:"ro-RO", el:"el-GR", hu:"hu-HU", sv:"sv-SE",
    da:"da-DK", fi:"fi-FI", sk:"sk-SK", hr:"hr-HR", lt:"lt-LT", bg:"bg-BG",
    lv:"lv-LV", sl:"sl-SI", et:"et-EE", cs:"cs-CZ",
  };
  const locale = localeMap[lang] ?? "fr-FR";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
}

function fmtMoney(amount: number, locale = "fr-FR"): string {
  return Number(amount).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

// ── Filigrane diagonal ─────────────────────────────────────────────────────────
function addWatermark(doc: InstanceType<typeof PDFDocument>) {
  doc.save();
  doc.rotate(-42, { origin: [doc.page.width / 2, doc.page.height / 2] });
  doc.fillColor("#E8EDF5").font("Helvetica-Bold").fontSize(36)
    .text("FEDE", 0, doc.page.height / 2 - 18, {
      width: doc.page.width,
      align: "center",
      lineBreak: false,
    });
  doc.restore();
}

// ── En-tête institutionnel ─────────────────────────────────────────────────────
function addLetterhead(doc: InstanceType<typeof PDFDocument>, dateStr?: string, contact?: ContactInfo) {
  // Bande gold + marge sur les pages de continuation (page 2+)
  doc.on("pageAdded", () => {
    doc.rect(0, 0, 5, doc.page.height).fill(GOLD);
    doc.y = 22;
  });

  addWatermark(doc);

  // Bande gold de gauche (toute hauteur de page) — doit être dessinée EN DERNIER
  // pour ne pas être couverte par le bandeau navy
  doc.rect(5, 0, doc.page.width - 5, 94).fill(BLEU);
  doc.rect(5, 94, doc.page.width - 5, 4).fill(GOLD);
  doc.rect(0, 0, 5, doc.page.height).fill(GOLD);

  // Logo / nom
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(22).text("FEDE", 52, 22);
  // Accroche
  doc.fillColor("#A8BAD4").font("Helvetica").fontSize(8.5)
    .text("Financement public non remboursable · Article L1611-2 CGCT", 52, 50);
  // Contacts
  const email = contact?.email ?? "support@fede-financement.com";
  const tel   = contact?.telephone ?? "+33 (0) 800 123 456";
  doc.fillColor("#7A92B4").font("Helvetica").fontSize(7.5)
    .text(`${email}  ·  ${tel}  ·  www.fede-financement.com`, 52, 67);

  // Date (alignée à droite)
  const d = dateStr ?? localeDateStr("fr");
  doc.fillColor(BLANC).font("Helvetica").fontSize(8.5)
    .text(d, 0, 36, { align: "right", width: doc.page.width - 52 });

  doc.y = 120;
}

// ── Pied de page ───────────────────────────────────────────────────────────────
function addFooter(doc: InstanceType<typeof PDFDocument>, contact?: ContactInfo, pageLabel?: string) {
  const email = contact?.email ?? "support@fede-financement.com";
  const tel   = contact?.telephone ? ` · ${contact.telephone}` : " · +33 (0) 800 123 456";
  const bottom = doc.page.height - 42;
  doc.rect(5, bottom - 12, doc.page.width - 5, 0.5).fill("#D1DAE8");
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(7.5)
    .text(
      `FEDE · ${email}${tel} · www.fede-financement.com · RGPD · © ${new Date().getFullYear()}`,
      52, bottom, { align: "center", width: doc.page.width - 104 },
    );
  if (pageLabel) {
    doc.fillColor("#9CA3AF").font("Helvetica").fontSize(7.5)
      .text(pageLabel, doc.page.width - 104, bottom, { width: 50, align: "right" });
  }
}

// ── Composants de mise en page ─────────────────────────────────────────────────
function sectionTitle(doc: InstanceType<typeof PDFDocument>, title: string) {
  doc.moveDown(0.45);
  const y = doc.y;
  doc.rect(52, y, doc.page.width - 104, 26).fill(GRIS_CLAIR);
  doc.rect(52, y, 3, 26).fill(GOLD);
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(9.5)
    .text(title.toUpperCase(), 66, y + 8, { width: doc.page.width - 136 });
  doc.y = y + 33;
}

function infoRow(doc: InstanceType<typeof PDFDocument>, label: string, value: string) {
  const y = doc.y;
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9).text(label, 66, y, { width: 158 });
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(9).text(value, 232, y, { width: doc.page.width - 288 });
  doc.rect(66, y + 17, doc.page.width - 132, 0.4).fill("#E4EAF2");
  doc.y = y + 21;
}

function paragraph(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.fillColor("#1A202C").font("Helvetica").fontSize(9.5)
    .text(text, 52, doc.y, { width: doc.page.width - 104, lineGap: 3 });
  doc.moveDown(0.45);
}

function articleTitle(doc: InstanceType<typeof PDFDocument>, artPrefix: string, num: string, title: string) {
  doc.moveDown(0.35);
  const y = doc.y;
  doc.rect(52, y, 3, 15).fill(GOLD);
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(9.5)
    .text(`${artPrefix} ${num} — ${title}`, 64, y + 1, { width: doc.page.width - 128 });
  doc.moveDown(0.3);
}

function signatureBlock(doc: InstanceType<typeof PDFDocument>, leftLabel: string, rightLabel: string) {
  doc.moveDown(1.4);
  const y   = doc.y;
  const col = (doc.page.width - 124) / 2;

  // Boîtes
  doc.rect(52, y, col - 8, 88).stroke("#CBD5E0");
  doc.rect(52 + col + 8, y, col - 8, 88).stroke("#CBD5E0");

  // En-têtes des boîtes
  doc.rect(52, y, col - 8, 20).fill(GRIS_CLAIR);
  doc.rect(52 + col + 8, y, col - 8, 20).fill(GRIS_CLAIR);

  // Labels gauche
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(8.5)
    .text(leftLabel, 62, y + 6, { width: col - 22 });
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8)
    .text("Date : _____ / _____ / __________", 62, y + 30)
    .text("Lu et approuvé — Signature :", 62, y + 50)
    .text("Cachet (si applicable) :", 62, y + 68);

  // Labels droite
  const rightLines = rightLabel.split("\n");
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(8.5)
    .text(rightLines[0], 62 + col + 8, y + 6, { width: col - 22 });
  if (rightLines[1]) {
    doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8)
      .text(rightLines[1], 62 + col + 8, y + 26, { width: col - 22 });
  }
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8)
    .text("Date : _____ / _____ / __________", 62 + col + 8, y + 50)
    .text("Signature :", 62 + col + 8, y + 68);

  doc.y = y + 98;
}

function stampBox(doc: InstanceType<typeof PDFDocument>, label: string, value: string, color = BLEU) {
  const w = 212;
  const x = doc.page.width - 52 - w;
  const y = doc.y;
  doc.rect(x, y, w, 58).fill(color);
  doc.rect(x, y, 4, 58).fill(GOLD);
  doc.fillColor(BLANC).font("Helvetica").fontSize(8.5).text(label, x + 14, y + 10, { width: w - 24 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(17).text(value, x + 14, y + 28, { width: w - 24 });
  doc.y = y + 68;
}

function decisionBanner(
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  bgColor = VERT_CLAIR,
  textColor = VERT_FONCE,
) {
  const y = doc.y;
  doc.rect(52, y, doc.page.width - 104, 46).fill(bgColor);
  doc.rect(52, y, 4, 46).fill(textColor);
  doc.fillColor(textColor).font("Helvetica-Bold").fontSize(12)
    .text(text, 68, y + 15, { width: doc.page.width - 144 });
  doc.y = y + 56;
}

function refStamp(doc: InstanceType<typeof PDFDocument>, reference: string, savedY: number) {
  const w = 192;
  const x = doc.page.width - 52 - w;
  doc.rect(x, savedY, w, 48).fill(GRIS_CLAIR);
  doc.rect(x, savedY, 3, 48).fill(GOLD);
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(7.5)
    .text("Référence dossier", x + 10, savedY + 8, { width: w - 16 });
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(12)
    .text(reference, x + 10, savedY + 22, { width: w - 16 });
}

// ─── 1. ACCUSÉ DE RÉCEPTION ───────────────────────────────────────────────────

export async function generateAccuseReception(
  dossier: DossierData, user: UserData, lang = "fr", contact?: ContactInfo,
): Promise<Buffer> {
  const doc     = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);
  const today   = localeDateStr(lang);

  addLetterhead(doc, today, contact);

  // ── Tampon référence dans le bandeau navy ─────────────────────────────────
  const refStampW = 168;
  const refStampX = doc.page.width - 52 - refStampW;
  doc.rect(refStampX, 18, refStampW, 60).fill(GOLD);
  doc.rect(refStampX, 18, 3, 60).fill("#8B6020");
  doc.fillColor(BLANC).font("Helvetica").fontSize(7)
    .text(lang === "fr" ? "Référence dossier" : "Application reference",
      refStampX + 10, 25, { width: refStampW - 16 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(12.5)
    .text(dossier.reference, refStampX + 10, 36, { width: refStampW - 16 });
  doc.fillColor("#F0C84A").font("Helvetica").fontSize(7)
    .text(today, refStampX + 10, 54, { width: refStampW - 16 });
  doc.y = 120;

  doc.moveDown(0.9);

  // ── Titre ─────────────────────────────────────────────────────────────────
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(17)
    .text(t(lang, "p1_title"), { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(10)
    .text(t(lang, "p1_subtitle"), { align: "center" });
  doc.moveDown(0.5);

  // ── Bannière DOSSIER ENREGISTRÉ — pleine largeur, double bordure ──────────
  const bannerY = doc.y;
  const bannerW = doc.page.width - 104;
  doc.rect(52, bannerY, bannerW, 50).fill(VERT_CLAIR);
  doc.rect(52,               bannerY, 5, 50).fill(VERT_FONCE);
  doc.rect(52 + bannerW - 5, bannerY, 5, 50).fill(VERT_FONCE);
  doc.fillColor(VERT_FONCE).font("Helvetica-Bold").fontSize(13)
    .text(
      lang === "fr" ? "DOSSIER ENREGISTRE" : "APPLICATION REGISTERED",
      68, bannerY + 18,
      { width: bannerW - 26, align: "center", lineBreak: false },
    );
  doc.y = bannerY + 60;

  // ── Corps introductif ─────────────────────────────────────────────────────
  doc.moveDown(0.4);
  paragraph(doc, t(lang, "p1_body"));

  // ── Récapitulatif de la demande ───────────────────────────────────────────
  sectionTitle(doc, t(lang, "p1_section_recap"));
  infoRow(doc, t(lang, "lbl_reference"),    dossier.reference);
  infoRow(doc, t(lang, "p_lbl_porteur"),    `${user.prenom} ${user.nom}`);
  if (user.organisation) {
    infoRow(doc, t(lang, "lbl_organisation"), user.organisation);
  }
  infoRow(doc, t(lang, "lbl_territoire"),   dossier.territoire);
  infoRow(doc, t(lang, "p_lbl_dispositif"), dossier.dispositif);
  infoRow(doc, t(lang, "p_lbl_secteur"),    dossier.secteur);
  infoRow(doc, t(lang, "p_lbl_montant"),    fmtMoney(dossier.montantDemande));
  infoRow(doc, t(lang, "p_lbl_date_depot"), localeDateStr(lang, new Date(dossier.createdAt)));

  // Ligne de confirmation en pied de tableau
  const confY = doc.y;
  const tW    = doc.page.width - 104;
  doc.rect(52, confY, tW, 22).fill(BLEU);
  doc.rect(52, confY, 3, 22).fill(GOLD);
  const confLabel = lang === "fr"
    ? "Dossier enregistre et pris en charge — Référence : " + dossier.reference
    : "Application registered and being processed — Reference: " + dossier.reference;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(8.5)
    .text(confLabel, 64, confY + 6, { width: tW - 20 });
  doc.y = confY + 26;
  doc.moveDown(0.3);

  // ── Délai de traitement ───────────────────────────────────────────────────
  sectionTitle(doc, lang === "fr" ? "DÉLAI DE TRAITEMENT ESTIMÉ" : "ESTIMATED PROCESSING TIME");
  infoRow(doc,
    lang === "fr" ? "Délai standard"    : "Standard delay",
    lang === "fr" ? "5 à 10 jours ouvrés" : "5 to 10 working days",
  );
  infoRow(doc,
    lang === "fr" ? "Conseiller désigné" : "Assigned advisor",
    dossier.expertDesigne || (lang === "fr" ? "En cours d'affectation" : "Being assigned"),
  );
  infoRow(doc,
    lang === "fr" ? "Contact & suivi"   : "Contact & follow-up",
    contact?.email ?? "support@fede-financement.com",
  );
  doc.moveDown(0.3);

  // ── Prochaines étapes — liste numérotée ───────────────────────────────────
  sectionTitle(doc, t(lang, "p1_section_next"));

  const steps = lang === "fr"
    ? [
        "Nos équipes procèdent à l'analyse de votre dossier selon les critères du dispositif sollicité.",
        "Un conseiller FEDE dédié vous contactera dans les meilleurs délais.",
        "Vous recevrez votre rapport d'éligibilité par e-mail et dans votre espace personnel.",
      ]
    : [
        "Our teams are reviewing your application based on the applicable program criteria.",
        "A dedicated FEDE advisor will contact you as soon as possible.",
        "Your eligibility report will be sent by email and available in your personal space.",
      ];

  steps.forEach((step, i) => {
    const sy = doc.y;
    doc.circle(65, sy + 7, 8).fill(BLEU);
    doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(8)
      .text(String(i + 1), 61, sy + 3, { width: 8, align: "center", lineBreak: false });
    doc.fillColor("#1A202C").font("Helvetica").fontSize(9)
      .text(step, 82, sy, { width: doc.page.width - 142, lineGap: 2 });
    const nextY = doc.y + 4;
    doc.y = nextY < sy + 18 ? sy + 18 : nextY;
  });

  // ── Bandeau notifications ─────────────────────────────────────────────────
  doc.moveDown(0.5);
  const notifY = doc.y;
  doc.rect(52, notifY, doc.page.width - 104, 30).fill(BLEU_CLAIR);
  doc.rect(52, notifY, 4, 30).fill(BLEU_INFO);
  doc.fillColor(BLEU_INFO).font("Helvetica").fontSize(9)
    .text(
      lang === "fr"
        ? "Toutes vos notifications sont accessibles depuis votre espace personnel FEDE."
        : "All your notifications are accessible from your FEDE personal space.",
      68, notifY + 9, { width: doc.page.width - 132 },
    );
  doc.y = notifY + 38;

  // ── Notice de génération ─────────────────────────────────────────────────
  doc.moveDown(0.5);
  const genY = doc.y;
  doc.rect(52, genY, doc.page.width - 104, 24).fill("#FFFBEB");
  doc.rect(52, genY, 4, 24).fill(GOLD);
  doc.fillColor("#92400E").font("Helvetica").fontSize(8)
    .text(t(lang, "p1_generated", { date: today }), 64, genY + 7,
      { width: doc.page.width - 128, align: "center" });
  doc.y = genY + 32;

  // ── Tampon final ENREGISTRÉ ───────────────────────────────────────────────
  doc.moveDown(0.6);
  const stampY = doc.y;
  const stampW = doc.page.width - 104;
  doc.rect(52, stampY, stampW, 62).fill(GOLD);
  doc.rect(56, stampY + 4, stampW - 8, 54).fill(BLEU);
  doc.rect(60, stampY + 8, stampW - 16, 46).lineWidth(1).strokeColor(GOLD).stroke();
  doc.fillColor("#A7F3D0").font("Helvetica").fontSize(8)
    .text(
      lang === "fr" ? "STATUT DU DOSSIER" : "APPLICATION STATUS",
      52, stampY + 16, { width: stampW, align: "center" },
    );
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(22)
    .text(
      lang === "fr" ? "ENREGISTRÉ" : "REGISTERED",
      52, stampY + 30, { width: stampW, align: "center" },
    );
  doc.y = stampY + 72;

  addFooter(doc, contact, "1 / 1");
  doc.end();
  return promise;
}

// ─── 2. RAPPORT D'ÉLIGIBILITÉ ─────────────────────────────────────────────────

export async function generateRapportEligibilite(
  dossier: DossierData, user: UserData, note?: string, lang = "fr", contact?: ContactInfo,
): Promise<Buffer> {
  const doc     = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);
  const today   = localeDateStr(lang);

  addLetterhead(doc, today, contact);

  // ── Tampon référence dans le bandeau navy ─────────────────────────────────
  const refStampW = 168;
  const refStampX = doc.page.width - 52 - refStampW;
  doc.rect(refStampX, 18, refStampW, 60).fill(GOLD);
  doc.rect(refStampX, 18, 3, 60).fill("#8B6020");
  doc.fillColor(BLANC).font("Helvetica").fontSize(7)
    .text(lang === "fr" ? "Référence dossier" : "Application reference",
      refStampX + 10, 25, { width: refStampW - 16 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(12.5)
    .text(dossier.reference, refStampX + 10, 36, { width: refStampW - 16 });
  doc.fillColor("#F0C84A").font("Helvetica").fontSize(7)
    .text(today, refStampX + 10, 54, { width: refStampW - 16 });
  doc.y = 120;

  doc.moveDown(0.9);

  // ── Titre ─────────────────────────────────────────────────────────────────
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(17)
    .text(t(lang, "p2_title"), { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(10)
    .text(t(lang, "p1_subtitle"), { align: "center" });
  doc.moveDown(0.5);

  // ── Bannière éligibilité — prominente, double bordure latérale ────────────
  const bannerY = doc.y;
  const bannerW = doc.page.width - 104;
  doc.rect(52, bannerY, bannerW, 50).fill(VERT_CLAIR);
  doc.rect(52,               bannerY, 5, 50).fill(VERT_FONCE);
  doc.rect(52 + bannerW - 5, bannerY, 5, 50).fill(VERT_FONCE);
  doc.fillColor(VERT_FONCE).font("Helvetica-Bold").fontSize(13)
    .text(
      t(lang, "p2_result_ok"),
      68, bannerY + 18,
      { width: bannerW - 26, align: "center", lineBreak: false },
    );
  doc.y = bannerY + 60;
  doc.moveDown(0.15);
  doc.fillColor(GRIS_TEXTE).font("Helvetica-Oblique").fontSize(9)
    .text(`\u00AB ${dossier.titre} \u00BB \u2014 ${dossier.territoire}`,
      52, doc.y, { width: doc.page.width - 104, align: "center" });
  doc.moveDown(0.5);

  // ── Porteur du projet ─────────────────────────────────────────────────────
  sectionTitle(doc, t(lang, "p_lbl_porteur"));
  infoRow(doc, t(lang, "p_lbl_porteur"),    `${user.prenom} ${user.nom}`);
  infoRow(doc, t(lang, "lbl_organisation"), user.organisation ?? (lang === "fr" ? "Porteur individuel" : "Individual applicant"));
  infoRow(doc, t(lang, "lbl_territoire"),   dossier.territoire);
  infoRow(doc, t(lang, "p_lbl_secteur"),    dossier.secteur);
  infoRow(doc, t(lang, "lbl_reference"),    dossier.reference);
  doc.moveDown(0.3);

  // ── Dispositif sollicité ──────────────────────────────────────────────────
  sectionTitle(doc, t(lang, "p_lbl_dispositif"));
  infoRow(doc, t(lang, "lbl_dispositif_principal"), dossier.dispositif);
  infoRow(doc, t(lang, "p_lbl_montant_potentiel"),  fmtMoney(dossier.montantDemande));
  infoRow(doc, t(lang, "p_lbl_taux"),               "40 % \u2013 80 %");
  infoRow(doc, t(lang, "p_lbl_organisme"),
    lang === "fr" ? "À confirmer selon le dispositif retenu" : "To be confirmed based on selected program",
  );
  doc.moveDown(0.3);

  // ── Analyse des critères d'éligibilité ────────────────────────────────────
  sectionTitle(doc, lang === "fr" ? "ANALYSE DES CRITÈRES D'ÉLIGIBILITÉ" : "ELIGIBILITY CRITERIA ANALYSIS");

  const conformeLabel = lang === "fr" ? "CONFORME"  : "COMPLIANT";
  const criteria: [string, string][] = lang === "fr"
    ? [
        ["Éligibilité géographique",    `Territoire ${dossier.territoire} couvert par le dispositif`],
        ["Éligibilité du secteur",       `Secteur \u00AB ${dossier.secteur} \u00BB éligible`],
        ["Montant dans les seuils",      `${fmtMoney(dossier.montantDemande)} dans la plage 40 %\u201380 %`],
        ["Complétude du dossier",        "Documents fournis conformes aux exigences"],
      ]
    : [
        ["Geographic eligibility",       `Territory ${dossier.territoire} covered by the program`],
        ["Sector eligibility",           `Sector "${dossier.secteur}" is eligible`],
        ["Amount within thresholds",     `${fmtMoney(dossier.montantDemande)} within the 40\u201380% range`],
        ["Completeness of application",  "Documents provided meet the requirements"],
      ];

  // En-tête tableau
  const tX = 52;
  const tW = doc.page.width - 104;
  const hY = doc.y;
  doc.rect(tX, hY, tW, 22).fill(BLEU);
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(8.5)
    .text(lang === "fr" ? "Critère"  : "Criterion",  tX + 8,            hY + 7, { width: tW * 0.39 })
    .text(lang === "fr" ? "Statut"   : "Status",     tX + tW * 0.41,    hY + 7, { width: 72 })
    .text(lang === "fr" ? "Détail"   : "Detail",     tX + tW * 0.565,   hY + 7, { width: tW * 0.42 });
  doc.y = hY + 26;

  criteria.forEach(([crit, detail], i) => {
    const ry = doc.y;
    const rowH = 23;
    doc.rect(tX, ry, tW, rowH).fill(i % 2 === 0 ? "#F8FAFC" : BLANC);
    // Séparateurs verticaux
    doc.rect(tX + tW * 0.40,  ry, 1, rowH).fill("#DDE4EF");
    doc.rect(tX + tW * 0.555, ry, 1, rowH).fill("#DDE4EF");

    // Critère
    doc.fillColor("#1A202C").font("Helvetica").fontSize(8.5)
      .text(crit, tX + 8, ry + 6, { width: tW * 0.37, lineBreak: false });

    // Badge CONFORME — pill arrondie vert
    const badgeX = tX + tW * 0.41 + 2;
    const badgeY = ry + 5;
    doc.roundedRect(badgeX, badgeY, 64, 13, 6.5).fill(VERT_CLAIR);
    doc.fillColor(VERT_FONCE).font("Helvetica-Bold").fontSize(7.5)
      .text(conformeLabel, badgeX + 5, badgeY + 2.5,
        { width: 54, lineBreak: false });

    // Détail
    doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8)
      .text(detail, tX + tW * 0.565 + 6, ry + 6, { width: tW * 0.41, lineBreak: false });

    doc.y = ry + rowH + 1;
  });

  // Ligne score global
  const scoreY = doc.y;
  doc.rect(tX, scoreY, tW, 22).fill(BLEU);
  doc.rect(tX, scoreY, 3, 22).fill(GOLD);
  const scoreLabel = lang === "fr"
    ? "Score global : 4 / 4 critères satisfaits — Dossier complet et conforme"
    : "Overall score: 4 / 4 criteria met — Complete and compliant application";
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(8.5)
    .text(scoreLabel, tX + 12, scoreY + 6, { width: tW - 20 });
  doc.y = scoreY + 26;

  // ── Observations du conseiller ────────────────────────────────────────────
  if (note) {
    doc.moveDown(0.35);
    sectionTitle(doc, lang === "fr" ? "OBSERVATIONS DU CONSEILLER" : "ADVISOR'S NOTES");
    paragraph(doc, note);
  }

  // ── Prochaines étapes — liste numérotée ───────────────────────────────────
  doc.moveDown(0.35);
  sectionTitle(doc, t(lang, "p1_section_next"));

  const steps = lang === "fr"
    ? [
        "Nos équipes procèdent à l'analyse approfondie de votre dossier selon les critères du dispositif retenu.",
        "Un conseiller FEDE dédié vous contactera dans les meilleurs délais pour vous communiquer les résultats.",
        "Vous serez notifié par e-mail et dans votre espace personnel de toute évolution du traitement.",
      ]
    : [
        "Our team is conducting an in-depth review of your application based on the applicable program criteria.",
        "A dedicated FEDE advisor will contact you as soon as possible with the results.",
        "You will be notified by email and in your personal space of any update.",
      ];

  steps.forEach((step, i) => {
    const sy = doc.y;
    // Cercle numéroté navy
    doc.circle(65, sy + 7, 8).fill(BLEU);
    doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(8)
      .text(String(i + 1), 61, sy + 3, { width: 8, align: "center", lineBreak: false });
    doc.fillColor("#1A202C").font("Helvetica").fontSize(9)
      .text(step, 82, sy, { width: doc.page.width - 142, lineGap: 2 });
    const nextY = doc.y + 4;
    doc.y = nextY < sy + 18 ? sy + 18 : nextY;
  });

  // ── Notice de validité ────────────────────────────────────────────────────
  doc.moveDown(0.5);
  const validY = doc.y;
  doc.rect(52, validY, doc.page.width - 104, 24).fill("#FFFBEB");
  doc.rect(52, validY, 4, 24).fill(GOLD);
  const validText = lang === "fr"
    ? `Ce rapport d'éligibilité est valable 90 jours à compter du ${today}. Au-delà, une nouvelle instruction sera requise.`
    : `This eligibility report is valid for 90 days from ${today}. Beyond this period, a new review will be required.`;
  doc.fillColor("#92400E").font("Helvetica").fontSize(8)
    .text(validText, 64, validY + 7, { width: doc.page.width - 128, lineBreak: false });
  doc.y = validY + 32;

  // ── Verdict final — grand bloc centré, double bordure gold ────────────────
  doc.moveDown(0.7);
  const vY = doc.y;
  const vW = doc.page.width - 104;
  // Cadre or extérieur
  doc.rect(52, vY, vW, 72).fill(GOLD);
  // Fond intérieur navy
  doc.rect(56, vY + 4, vW - 8, 64).fill(VERT_FONCE);
  // Filet or intérieur
  doc.rect(60, vY + 8, vW - 16, 56).lineWidth(1).strokeColor(GOLD).stroke();
  // Libellé
  doc.fillColor("#A7F3D0").font("Helvetica").fontSize(8)
    .text(
      lang === "fr" ? "DÉCISION D'ÉLIGIBILITÉ" : "ELIGIBILITY DECISION",
      52, vY + 16, { width: vW, align: "center" },
    );
  // Verdict
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(28)
    .text(t(lang, "p2_decision_ok"), 52, vY + 29, { width: vW, align: "center" });
  doc.y = vY + 82;

  // ── Bloc signature ────────────────────────────────────────────────────────
  doc.moveDown(0.6);
  signatureBlock(
    doc,
    (lang === "fr" ? "Porteur du projet\n" : "Project owner\n") + `${user.prenom} ${user.nom}`,
    (lang === "fr" ? "Conseiller FEDE\n" : "FEDE advisor\n")
      + (dossier.expertDesigne ?? (lang === "fr" ? "Référent désigné" : "Designated advisor")),
  );

  addFooter(doc, contact, "1 / 1");
  doc.end();
  return promise;
}

// ─── 3. CONTRAT DE MISSION ─────────────────────────────────────────────────────

export async function generateContratMission(
  dossier: DossierData, user: UserData, lang = "fr", contact?: ContactInfo,
): Promise<Buffer> {
  const doc     = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);
  const today   = localeDateStr(lang);
  const artPfx  = t(lang, "p3_art_prefix");

  addLetterhead(doc, today, contact);

  // ── Tampon référence dans le bandeau navy ─────────────────────────────────
  const refStampW = 168;
  const refStampX = doc.page.width - 52 - refStampW;
  doc.rect(refStampX, 18, refStampW, 60).fill(GOLD);
  doc.rect(refStampX, 18, 3, 60).fill("#8B6020");
  doc.fillColor(BLANC).font("Helvetica").fontSize(7)
    .text(lang === "fr" ? "Référence contrat" : "Agreement reference",
      refStampX + 10, 25, { width: refStampW - 16 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(12.5)
    .text(dossier.reference, refStampX + 10, 36, { width: refStampW - 16 });
  doc.fillColor("#F0C84A").font("Helvetica").fontSize(7)
    .text(today, refStampX + 10, 54, { width: refStampW - 16 });
  doc.y = 120;

  doc.moveDown(0.9);

  // ── Titre ─────────────────────────────────────────────────────────────────
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(15)
    .text(t(lang, "p3_title"), { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9)
    .text("Article L1611-2 CGCT", { align: "center" });
  doc.moveDown(0.5);

  // ── Bannière contrat signé ────────────────────────────────────────────────
  const bannerY = doc.y;
  const bannerW = doc.page.width - 104;
  doc.rect(52, bannerY, bannerW, 44).fill("#EFF6FF");
  doc.rect(52,               bannerY, 5, 44).fill(BLEU);
  doc.rect(52 + bannerW - 5, bannerY, 5, 44).fill(BLEU);
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(11)
    .text(
      lang === "fr"
        ? "CONTRAT DE PRESTATION DE SERVICES — MISSION DE CONSEIL"
        : "SERVICE AGREEMENT — ADVISORY MISSION",
      68, bannerY + 15,
      { width: bannerW - 26, align: "center", lineBreak: false },
    );
  doc.y = bannerY + 54;
  doc.moveDown(0.3);

  // ── Les Parties — encadré identitaire ────────────────────────────────────
  const partiesY = doc.y;
  const halfW    = (bannerW - 8) / 2;
  // Prestataire
  doc.rect(52, partiesY, halfW, 52).fill(BLEU);
  doc.fillColor("#93C5FD").font("Helvetica").fontSize(7.5)
    .text(lang === "fr" ? "LE PRESTATAIRE" : "SERVICE PROVIDER", 64, partiesY + 8, { width: halfW - 16 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(10)
    .text("FEDE", 64, partiesY + 20, { width: halfW - 16 });
  doc.fillColor("#BFDBFE").font("Helvetica").fontSize(8)
    .text(contact?.email ?? "support@fede-financement.com", 64, partiesY + 34, { width: halfW - 16 });
  // Client
  doc.rect(52 + halfW + 8, partiesY, halfW, 52).fill(GRIS_CLAIR);
  doc.rect(52 + halfW + 8, partiesY, 3, 52).fill(GOLD);
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(7.5)
    .text(lang === "fr" ? "LE CLIENT" : "CLIENT", 52 + halfW + 20, partiesY + 8, { width: halfW - 24 });
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(10)
    .text(`${user.prenom} ${user.nom}`, 52 + halfW + 20, partiesY + 20, { width: halfW - 24 });
  if (user.organisation) {
    doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8)
      .text(user.organisation, 52 + halfW + 20, partiesY + 34, { width: halfW - 24 });
  }
  doc.y = partiesY + 60;
  doc.moveDown(0.3);

  // Article 1
  articleTitle(doc, artPfx, "1", lang === "fr" ? "Objet de la mission" : "Purpose of the assignment");
  paragraph(doc,
    lang === "fr"
      ? `Le Prestataire est mandaté par le Client pour l'accompagnement à la recherche, à l'identification et au montage de dossiers de demande de financement public non remboursable, dans le cadre du projet « ${dossier.titre} » — ${dossier.territoire} — ${fmtMoney(dossier.montantDemande)}.`
      : `The Service Provider is mandated by the Client for assistance in seeking, identifying, and preparing non-repayable public funding applications for the project "${dossier.titre}" — ${dossier.territoire} — ${fmtMoney(dossier.montantDemande)}.`,
  );

  // Article 2
  articleTitle(doc, artPfx, "2", lang === "fr" ? "Durée de la mission" : "Duration");
  paragraph(doc,
    lang === "fr"
      ? "Le présent contrat prend effet à compter de sa signature par les deux parties et est conclu pour une durée de douze (12) mois, renouvelable par accord écrit des parties."
      : "This agreement takes effect upon signature by both parties and is concluded for a period of twelve (12) months, renewable by written agreement.",
  );

  // Article 3
  articleTitle(doc, artPfx, "3", lang === "fr" ? "Honoraires et modalités de paiement" : "Fees and payment terms");
  paragraph(doc,
    lang === "fr"
      ? "Les honoraires du Prestataire sont fixés à 456,00 € TTC (380,00 € HT + TVA 20 %), conformément à l'article L1611-2 du Code général des collectivités territoriales. Les honoraires sont exigibles à réception de la première notification d'attribution de subvention."
      : "The Service Provider's fees are fixed at €456.00 incl. VAT (€380.00 excl. VAT + 20% VAT), pursuant to Article L1611-2 of the French General Code of Local Authorities (CGCT). Fees are due upon receipt of the first grant award notification.",
  );

  // Article 4
  articleTitle(doc, artPfx, "4", lang === "fr" ? "Obligations du Prestataire" : "Service Provider obligations");
  paragraph(doc,
    lang === "fr"
      ? "Le Prestataire s'engage à : (i) identifier les dispositifs de financement auxquels le projet est éligible ; (ii) constituer et soumettre les dossiers de demande auprès des organismes financeurs compétents ; (iii) assurer le suivi des demandes et informer le Client de toute évolution ; (iv) transmettre au Client toute décision rendue par les organismes financeurs."
      : "The Service Provider undertakes to: (i) identify applicable funding schemes; (ii) prepare and submit applications to relevant funding bodies; (iii) monitor applications and inform the Client of any changes; (iv) communicate all decisions to the Client.",
  );

  // Article 5
  articleTitle(doc, artPfx, "5", lang === "fr" ? "Obligations du Client" : "Client obligations");
  paragraph(doc,
    lang === "fr"
      ? "Le Client s'engage à : (i) fournir l'ensemble des documents nécessaires dans les délais impartis ; (ii) certifier l'exactitude des informations communiquées ; (iii) informer le Prestataire de toute modification de situation susceptible d'affecter l'éligibilité du projet ; (iv) s'acquitter des honoraires dans les délais convenus."
      : "The Client undertakes to: (i) provide all required documents on time; (ii) certify the accuracy of all information provided; (iii) inform the Service Provider of any changes that may affect project eligibility; (iv) pay fees within the agreed timeframe.",
  );

  // Article 6
  articleTitle(doc, artPfx, "6", lang === "fr" ? "Confidentialité et protection des données" : "Confidentiality and data protection");
  paragraph(doc,
    lang === "fr"
      ? "Les Parties s'engagent à traiter confidentiellement les informations échangées dans le cadre du présent contrat. Les données personnelles collectées sont traitées conformément au Règlement général sur la protection des données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés."
      : "The Parties undertake to treat all information exchanged under this agreement confidentially. Personal data is processed in accordance with the GDPR (EU Regulation 2016/679).",
  );

  // Article 7
  articleTitle(doc, artPfx, "7", lang === "fr" ? "Résiliation" : "Termination");
  paragraph(doc,
    lang === "fr"
      ? "Chaque Partie peut résilier le présent contrat moyennant un préavis écrit de trente (30) jours. En cas de manquement grave aux obligations contractuelles, la résiliation peut intervenir sans préavis par lettre recommandée avec accusé de réception. Les honoraires correspondant aux prestations déjà réalisées restent exigibles."
      : "Either Party may terminate this agreement by giving thirty (30) days' written notice. In the event of a material breach, termination may occur without notice by registered letter. Fees for services already rendered remain due.",
  );

  // Article 8
  articleTitle(doc, artPfx, "8", lang === "fr" ? "Force majeure" : "Force majeure");
  paragraph(doc,
    lang === "fr"
      ? "Aucune Partie ne pourra être tenue responsable de l'inexécution de ses obligations contractuelles si cette inexécution résulte d'un événement de force majeure au sens de l'article 1218 du Code civil, dûment notifié à l'autre Partie dans les meilleurs délais."
      : "Neither Party shall be liable for failure to perform its obligations if such failure results from a force majeure event as defined by applicable law, provided timely notice is given to the other Party.",
  );

  // Article 9
  articleTitle(doc, artPfx, "9", lang === "fr" ? "Loi applicable et juridiction compétente" : "Governing law and jurisdiction");
  paragraph(doc,
    lang === "fr"
      ? "Le présent contrat est soumis au droit français. En cas de litige, les Parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut d'accord, le litige sera soumis aux tribunaux compétents de Paris."
      : "This agreement is governed by French law. In the event of a dispute, the Parties undertake to seek an amicable resolution before resorting to legal proceedings. Failing agreement, disputes shall be submitted to the competent courts of Paris.",
  );

  // Bloc signature
  doc.moveDown(0.3);
  signatureBlock(
    doc,
    t(lang, "p3_sign_prestataire"),
    t(lang, "p3_sign_client", { client: `${user.prenom} ${user.nom}` }),
  );

  // ── Notice "Fait en deux exemplaires" — bandeau ambre ────────────────────
  doc.moveDown(0.3);
  const origY  = doc.y;
  const origW  = doc.page.width - 104;
  doc.rect(52, origY, origW, 24).fill("#FFFBEB");
  doc.rect(52, origY, 4, 24).fill(GOLD);
  doc.fillColor("#92400E").font("Helvetica").fontSize(8)
    .text(t(lang, "p3_deux_originaux", { ref: dossier.reference }),
      64, origY + 7, { width: origW - 20, align: "center" });
  doc.y = origY + 32;

  addFooter(doc, contact, "1 / 1");
  doc.end();
  return promise;
}

// ─── 4. NOTIFICATION D'ATTRIBUTION ────────────────────────────────────────────

export async function generateNotificationAttribution(
  dossier: DossierData, user: UserData, montantAccorde?: number, note?: string, lang = "fr", contact?: ContactInfo,
): Promise<Buffer> {
  const doc     = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);
  const today   = localeDateStr(lang);
  const montant = montantAccorde ?? dossier.montantDemande;

  addLetterhead(doc, today, contact);

  // ── Tampon référence dans le bandeau navy ─────────────────────────────────
  const refStampW = 168;
  const refStampX = doc.page.width - 52 - refStampW;
  doc.rect(refStampX, 18, refStampW, 60).fill(GOLD);
  doc.rect(refStampX, 18, 3, 60).fill("#8B6020");
  doc.fillColor(BLANC).font("Helvetica").fontSize(7)
    .text(lang === "fr" ? "Référence dossier" : "Application reference",
      refStampX + 10, 25, { width: refStampW - 16 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(12.5)
    .text(dossier.reference, refStampX + 10, 36, { width: refStampW - 16 });
  doc.fillColor("#F0C84A").font("Helvetica").fontSize(7)
    .text(today, refStampX + 10, 54, { width: refStampW - 16 });
  doc.y = 120;

  doc.moveDown(0.9);

  // ── Titre ─────────────────────────────────────────────────────────────────
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(17)
    .text(t(lang, "p4_title"), { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(10)
    .text(t(lang, "p1_subtitle"), { align: "center" });
  doc.moveDown(0.5);

  // ── Bannière DÉCISION FAVORABLE — double bordure ──────────────────────────
  const bannerY = doc.y;
  const bannerW = doc.page.width - 104;
  doc.rect(52, bannerY, bannerW, 50).fill(VERT_CLAIR);
  doc.rect(52,               bannerY, 5, 50).fill(VERT_FONCE);
  doc.rect(52 + bannerW - 5, bannerY, 5, 50).fill(VERT_FONCE);
  doc.fillColor(VERT_FONCE).font("Helvetica-Bold").fontSize(13)
    .text(
      t(lang, "p4_decision_banner"),
      68, bannerY + 18,
      { width: bannerW - 26, align: "center", lineBreak: false },
    );
  doc.y = bannerY + 60;
  doc.moveDown(0.15);
  doc.fillColor(GRIS_TEXTE).font("Helvetica-Oblique").fontSize(9)
    .text(`\u00AB ${dossier.titre} \u00BB \u2014 ${dossier.territoire}`,
      52, doc.y, { width: bannerW, align: "center" });
  doc.moveDown(0.4);

  // ── Récapitulatif ─────────────────────────────────────────────────────────
  sectionTitle(doc, t(lang, "p1_section_recap"));
  infoRow(doc, t(lang, "lbl_beneficiaire"),    `${user.prenom} ${user.nom}${user.organisation ? ` \u2014 ${user.organisation}` : ""}`);
  infoRow(doc, t(lang, "lbl_territoire"),      dossier.territoire);
  infoRow(doc, t(lang, "p_lbl_dispositif"),    dossier.dispositif);
  infoRow(doc, t(lang, "lbl_projet"),          dossier.titre);
  infoRow(doc, t(lang, "lbl_reference"),       dossier.reference);
  infoRow(doc, t(lang, "lbl_montant_attribue"), fmtMoney(montant));
  infoRow(doc, t(lang, "lbl_date_decision"),   today);

  // Ligne de confirmation
  const confY = doc.y;
  const tW    = doc.page.width - 104;
  doc.rect(52, confY, tW, 22).fill(VERT_FONCE);
  doc.rect(52, confY, 3, 22).fill(GOLD);
  doc.fillColor("#A7F3D0").font("Helvetica-Bold").fontSize(8.5)
    .text(
      lang === "fr"
        ? `Attribution confirmée — Montant accordé : ${fmtMoney(montant)} — Décision du ${today}`
        : `Award confirmed — Amount granted: ${fmtMoney(montant)} — Decision dated ${today}`,
      64, confY + 6, { width: tW - 20 },
    );
  doc.y = confY + 26;
  doc.moveDown(0.3);

  // ── Conditions particulières ──────────────────────────────────────────────
  if (note) {
    sectionTitle(doc, lang === "fr" ? "CONDITIONS D'ATTRIBUTION" : "AWARD CONDITIONS");
    paragraph(doc, note);
    doc.moveDown(0.2);
  }

  // ── Obligations post-attribution — liste numérotée ────────────────────────
  sectionTitle(doc, t(lang, "p4_section_obligations"));
  const obligations = lang === "fr"
    ? [
        "Utiliser les fonds exclusivement aux fins du projet décrit dans votre dossier de demande.",
        "Respecter les délais de réalisation convenus avec l'organisme financeur.",
        "Fournir les justificatifs de dépenses et rapports d'avancement aux échéances fixées.",
        "Informer l'organisme financeur de tout changement significatif affectant le projet.",
      ]
    : [
        "Use the funds solely for the purposes described in your application.",
        "Meet agreed deadlines with the funding body.",
        "Provide expense receipts and progress reports on time.",
        "Inform the funding body of any significant change affecting the project.",
      ];
  obligations.forEach((obl, i) => {
    const oy = doc.y;
    doc.circle(65, oy + 7, 8).fill(VERT_FONCE);
    doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(8)
      .text(String(i + 1), 61, oy + 3, { width: 8, align: "center", lineBreak: false });
    doc.fillColor("#1A202C").font("Helvetica").fontSize(9)
      .text(obl, 82, oy, { width: doc.page.width - 142, lineGap: 2 });
    const nextY = doc.y + 4;
    doc.y = nextY < oy + 18 ? oy + 18 : nextY;
  });
  doc.moveDown(0.3);

  // ── Frais d'instruction — encadré montant ─────────────────────────────────
  sectionTitle(doc, lang === "fr" ? "FRAIS D'INSTRUCTION FEDE" : "FEDE PROCESSING FEES");
  const feesY = doc.y;
  const feesW = tW;
  doc.rect(52, feesY, feesW, 48).fill(GRIS_CLAIR);
  doc.rect(52, feesY, 4, 48).fill(GOLD);
  doc.rect(feesW - 60, feesY, 112, 48).fill(BLEU);
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8.5)
    .text(
      lang === "fr"
        ? "Suite à cette décision favorable, les frais d'instruction FEDE sont dus conformément au contrat de mission signé et à l'article L1611-2 CGCT. Les modalités de règlement vous seront communiquées séparément."
        : "Following this favourable decision, FEDE processing fees are due pursuant to the signed service agreement and Article L1611-2 CGCT. Payment details will be communicated separately.",
      64, feesY + 8, { width: feesW - 140 },
    );
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11)
    .text("456,00 €", feesW - 52, feesY + 8, { width: 96, align: "right" });
  doc.fillColor(BLANC).font("Helvetica").fontSize(7.5)
    .text("TTC (380,00 € HT + TVA 20 %)", feesW - 52, feesY + 26, { width: 96, align: "right" });
  doc.y = feesY + 56;
  doc.moveDown(0.3);

  // ── Voies et délais de recours ────────────────────────────────────────────
  sectionTitle(doc, lang === "fr" ? "VOIES ET DÉLAIS DE RECOURS" : "APPEALS AND DEADLINES");
  const recoursY = doc.y;
  doc.rect(52, recoursY, tW, 28).fill(BLEU_CLAIR);
  doc.rect(52, recoursY, 4, 28).fill(BLEU_INFO);
  doc.fillColor(BLEU_INFO).font("Helvetica").fontSize(8.5)
    .text(
      lang === "fr"
        ? "Tout recours doit être introduit dans un délai de 2 mois à compter de la notification. Recours gracieux : FEDE. Recours contentieux : juridiction compétente."
        : "Any appeal must be lodged within 2 months of notification. Gracious appeal: FEDE. Contentious appeal: competent court.",
      64, recoursY + 8, { width: tW - 24 },
    );
  doc.y = recoursY + 36;
  doc.moveDown(0.7);

  // ── Verdict final ─────────────────────────────────────────────────────────
  const vY = doc.y;
  doc.rect(52, vY, tW, 62).fill(GOLD);
  doc.rect(56, vY + 4, tW - 8, 54).fill(VERT_FONCE);
  doc.rect(60, vY + 8, tW - 16, 46).lineWidth(1).strokeColor(GOLD).stroke();
  doc.fillColor("#A7F3D0").font("Helvetica").fontSize(8)
    .text(lang === "fr" ? "DÉCISION D'ATTRIBUTION" : "AWARD DECISION",
      52, vY + 14, { width: tW, align: "center" });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(22)
    .text(lang === "fr" ? "SUBVENTION ACCORDÉE" : "GRANT AWARDED",
      52, vY + 27, { width: tW, align: "center" });
  doc.y = vY + 72;

  // ── Bloc signature ────────────────────────────────────────────────────────
  doc.moveDown(0.5);
  signatureBlock(
    doc,
    (lang === "fr" ? "Bénéficiaire\n" : "Beneficiary\n") + `${user.prenom} ${user.nom}`,
    lang === "fr" ? "FEDE\nPour l'organisme attributaire" : "FEDE\nOn behalf of the awarding body",
  );

  addFooter(doc, contact, "1 / 1");
  doc.end();
  return promise;
}

// ─── 5. FACTURE ───────────────────────────────────────────────────────────────

export async function generateFacture(
  dossier: DossierData, user: UserData, fraisRef: string, lang = "fr", contact?: ContactInfo,
): Promise<Buffer> {
  const doc     = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);
  const today   = localeDateStr(lang);

  addLetterhead(doc, today, contact);

  // ── Tampon N° facture dans le bandeau navy ────────────────────────────────
  const refStampW = 168;
  const refStampX = doc.page.width - 52 - refStampW;
  doc.rect(refStampX, 18, refStampW, 60).fill(GOLD);
  doc.rect(refStampX, 18, 3, 60).fill("#8B6020");
  doc.fillColor(BLANC).font("Helvetica").fontSize(7)
    .text(lang === "fr" ? "Numéro de facture" : "Invoice number",
      refStampX + 10, 25, { width: refStampW - 16 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(11)
    .text(`N° ${fraisRef}`, refStampX + 10, 36, { width: refStampW - 16 });
  doc.fillColor("#F0C84A").font("Helvetica").fontSize(7)
    .text(today, refStampX + 10, 54, { width: refStampW - 16 });

  doc.moveDown(0.8);

  // ── Titre + boîte "Facturé à" — côte à côte ───────────────────────────────
  const yInfo   = doc.y;
  const colW    = 220;
  const colX    = doc.page.width - 52 - colW;
  const titleW  = colX - 52 - 12;

  // Bloc titre à gauche
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(28)
    .text(t(lang, "p5_title"), 52, yInfo, { width: titleW });
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9)
    .text(`${lang === "fr" ? "Date d'émission" : "Issue date"} : ${today}`, 52, yInfo + 34, { width: titleW });
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8.5)
    .text(
      lang === "fr" ? "Échéance : à réception" : "Due: upon receipt",
      52, yInfo + 48, { width: titleW },
    );
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(8.5)
    .text("Article L1611-2 CGCT", 52, yInfo + 62, { width: titleW });

  // Boîte "Facturé à" à droite — améliorée
  doc.rect(colX, yInfo, colW, 92).fill(BLEU);
  doc.rect(colX, yInfo, 4, 92).fill(GOLD);
  doc.fillColor("#93C5FD").font("Helvetica").fontSize(7.5)
    .text(t(lang, "p5_bill_to"), colX + 12, yInfo + 9, { width: colW - 20 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(11)
    .text(`${user.prenom} ${user.nom}`, colX + 12, yInfo + 22, { width: colW - 20 });
  if (user.organisation) {
    doc.fillColor("#BFDBFE").font("Helvetica").fontSize(9)
      .text(user.organisation, colX + 12, yInfo + 38, { width: colW - 20 });
  }
  const orgOffset = user.organisation ? 14 : 0;
  doc.fillColor("#BFDBFE").font("Helvetica").fontSize(9)
    .text(`${t(lang, "lbl_territoire")} : ${dossier.territoire}`,
      colX + 12, yInfo + 38 + orgOffset, { width: colW - 20 });
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(8)
    .text(`${lang === "fr" ? "Réf. dossier" : "Application ref."} : ${dossier.reference}`,
      colX + 12, yInfo + 54 + orgOffset, { width: colW - 20 });
  doc.fillColor("#BFDBFE").font("Helvetica").fontSize(8)
    .text(`${lang === "fr" ? "Émis le" : "Issued"} : ${today}`,
      colX + 12, yInfo + 68 + orgOffset, { width: colW - 20 });

  doc.y = yInfo + 102;
  doc.moveDown(0.4);

  // ── Tableau de prestations ────────────────────────────────────────────────
  sectionTitle(doc, t(lang, "p5_col_designation"));

  const tX = 52;
  const tW = doc.page.width - 104;

  // En-tête du tableau
  const hY = doc.y;
  doc.rect(tX, hY, tW, 26).fill(BLEU);
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(9)
    .text(t(lang, "p5_col_designation"), tX + 10,        hY + 8, { width: tW * 0.53 })
    .text(t(lang, "p5_col_qty"),         tX + tW * 0.56, hY + 8, { width: 40, align: "center" })
    .text(t(lang, "p5_col_pu"),          tX + tW * 0.67, hY + 8, { width: 72, align: "right" })
    .text(t(lang, "p5_col_total"),       tX + tW * 0.83, hY + 8, { width: 62, align: "right" });
  doc.y = hY + 30;

  // Ligne service
  const rY = doc.y;
  doc.rect(tX, rY, tW, 26).fill(GRIS_CLAIR);
  doc.rect(tX, rY, 4, 26).fill(GOLD);
  doc.rect(tX + tW * 0.54, rY, 1, 26).fill("#DDE4EF");
  doc.rect(tX + tW * 0.65, rY, 1, 26).fill("#DDE4EF");
  doc.rect(tX + tW * 0.81, rY, 1, 26).fill("#DDE4EF");
  doc.fillColor("#1A202C").font("Helvetica").fontSize(9)
    .text(t(lang, "p5_service"), tX + 12,        rY + 8, { width: tW * 0.51 })
    .text("1",                   tX + tW * 0.56, rY + 8, { width: 40, align: "center" })
    .text("380,00 \u20AC",       tX + tW * 0.67, rY + 8, { width: 72, align: "right" })
    .text("380,00 \u20AC",       tX + tW * 0.83, rY + 8, { width: 62, align: "right" });
  doc.y = rY + 30;

  // ── Bloc totaux aligné à droite ───────────────────────────────────────────
  doc.moveDown(0.5);
  const sumX = doc.page.width - 52 - 240;
  const sumY = doc.y;

  doc.rect(sumX, sumY, 240, 28).fill(GRIS_CLAIR);
  doc.rect(sumX, sumY, 3, 28).fill("#CBD5E0");
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9)
    .text(t(lang, "p5_total_ht"), sumX + 12, sumY + 9, { width: 130 });
  doc.fillColor("#1A202C").font("Helvetica-Bold").fontSize(9)
    .text("380,00 \u20AC", sumX + 130, sumY + 9, { width: 96, align: "right" });

  doc.rect(sumX, sumY + 30, 240, 28).fill(GRIS_CLAIR);
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9)
    .text(t(lang, "p5_tva"), sumX + 12, sumY + 39, { width: 130 });
  doc.fillColor("#1A202C").font("Helvetica-Bold").fontSize(9)
    .text("76,00 \u20AC", sumX + 130, sumY + 39, { width: 96, align: "right" });

  doc.rect(sumX, sumY + 60, 240, 34).fill(BLEU);
  doc.rect(sumX, sumY + 60, 4, 34).fill(GOLD);
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(13)
    .text(t(lang, "p5_total_ttc"), sumX + 12, sumY + 69, { width: 130 });
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(13)
    .text("456,00 \u20AC", sumX + 130, sumY + 69, { width: 96, align: "right" });
  doc.y = sumY + 102;

  // ── Référence légale — bandeau ambre ──────────────────────────────────────
  doc.moveDown(0.6);
  const legalY = doc.y;
  const legalW = tW;
  doc.rect(52, legalY, legalW, 24).fill("#FFFBEB");
  doc.rect(52, legalY, 4, 24).fill(GOLD);
  doc.fillColor("#92400E").font("Helvetica-Bold").fontSize(8.5)
    .text(
      `Article L1611-2 CGCT \u00B7 ${t(lang, "lbl_reference")} dossier : ${dossier.reference} \u00B7 N° ${fraisRef}`,
      64, legalY + 7, { width: legalW - 20, lineBreak: false },
    );
  doc.y = legalY + 32;

  // ── Conditions de règlement ───────────────────────────────────────────────
  doc.moveDown(0.3);
  const condY = doc.y;
  doc.rect(52, condY, tW, 28).fill(BLEU_CLAIR);
  doc.rect(52, condY, 4, 28).fill(BLEU_INFO);
  doc.fillColor(BLEU_INFO).font("Helvetica").fontSize(8.5)
    .text(
      lang === "fr"
        ? "Règlement par virement bancaire uniquement. Toute contestation doit être formulée par écrit dans les 30 jours suivant la réception."
        : "Payment by bank transfer only. Any dispute must be submitted in writing within 30 days of receipt.",
      64, condY + 9, { width: tW - 24 },
    );
  doc.y = condY + 36;

  // ── Tampon À PAYER ────────────────────────────────────────────────────────
  doc.moveDown(0.6);
  const stY = doc.y;
  doc.rect(52, stY, tW, 56).fill(GOLD);
  doc.rect(56, stY + 4, tW - 8, 48).fill(BLEU);
  doc.rect(60, stY + 8, tW - 16, 40).lineWidth(1).strokeColor(GOLD).stroke();
  doc.fillColor("#93C5FD").font("Helvetica").fontSize(8)
    .text(lang === "fr" ? "STATUT DE LA FACTURE" : "INVOICE STATUS",
      52, stY + 14, { width: tW, align: "center" });
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(20)
    .text(lang === "fr" ? "\u00C0 PAYER — 456,00 \u20AC TTC" : "DUE — \u20AC456.00 incl. VAT",
      52, stY + 28, { width: tW, align: "center" });
  doc.y = stY + 66;

  addFooter(doc, contact, "1 / 1");
  doc.end();
  return promise;
}

// ─── 6. FICHE DE COLLECTE ─────────────────────────────────────────────────────

export async function generateFicheCollecte(
  dossier: DossierData, user: UserData, lang = "fr", contact?: ContactInfo,
): Promise<Buffer> {
  const doc     = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);
  const today   = localeDateStr(lang);

  addLetterhead(doc, today, contact);

  // ── Tampon référence dans le bandeau navy ─────────────────────────────────
  const refStampW = 168;
  const refStampX = doc.page.width - 52 - refStampW;
  doc.rect(refStampX, 18, refStampW, 60).fill(GOLD);
  doc.rect(refStampX, 18, 3, 60).fill("#8B6020");
  doc.fillColor(BLANC).font("Helvetica").fontSize(7)
    .text(lang === "fr" ? "Référence dossier" : "Application reference",
      refStampX + 10, 25, { width: refStampW - 16 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(12.5)
    .text(dossier.reference, refStampX + 10, 36, { width: refStampW - 16 });
  doc.fillColor("#F0C84A").font("Helvetica").fontSize(7)
    .text(today, refStampX + 10, 54, { width: refStampW - 16 });
  doc.y = 120;

  doc.moveDown(0.9);

  // ── Titre ─────────────────────────────────────────────────────────────────
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(15)
    .text(t(lang, "p6_title"), { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9)
    .text(`${t(lang, "lbl_reference")} : ${dossier.reference}`, { align: "center" });
  doc.moveDown(0.5);

  // ── Bandeau DOCUMENT À RETOURNER — double bordure ─────────────────────────
  const bannerY = doc.y;
  const bannerW = doc.page.width - 104;
  doc.rect(52, bannerY, bannerW, 50).fill("#FFF8E6");
  doc.rect(52,               bannerY, 5, 50).fill(GOLD);
  doc.rect(52 + bannerW - 5, bannerY, 5, 50).fill(GOLD);
  doc.fillColor("#92400E").font("Helvetica-Bold").fontSize(12)
    .text(
      lang === "fr"
        ? "DOCUMENT A COMPLETER ET A RETOURNER SIGNE"
        : "DOCUMENT TO COMPLETE AND RETURN SIGNED",
      68, bannerY + 18,
      { width: bannerW - 26, align: "center", lineBreak: false },
    );
  doc.y = bannerY + 60;

  // ── Instruction ───────────────────────────────────────────────────────────
  doc.moveDown(0.3);
  const instrY = doc.y;
  doc.rect(52, instrY, bannerW, 28).fill(BLEU_CLAIR);
  doc.rect(52, instrY, 4, 28).fill(BLEU_INFO);
  doc.fillColor(BLEU_INFO).font("Helvetica").fontSize(8.5)
    .text(
      lang === "fr"
        ? "Veuillez compléter toutes les sections ci-dessous et retourner ce document signé à votre conseiller FEDE dans les meilleurs délais."
        : "Please complete all sections below and return this signed document to your FEDE advisor as soon as possible.",
      68, instrY + 8, { width: bannerW - 28 },
    );
  doc.y = instrY + 36;
  doc.moveDown(0.3);

  // ── En-tête de section + champs ───────────────────────────────────────────
  sectionTitle(doc, t(lang, "p6_section"));

  // Ligne d'en-tête du tableau
  const tX = 52;
  const tW = doc.page.width - 104;
  const thY = doc.y;
  doc.rect(tX, thY, tW, 20).fill(BLEU);
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(8)
    .text(lang === "fr" ? "Intitulé" : "Field", tX + 16, thY + 6, { width: 230 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(8)
    .text(lang === "fr" ? "Valeur à renseigner" : "Value to fill in", tX + 302, thY + 6, { width: tW - 314 });
  doc.y = thY + 22;

  const fieldKeys = [
    "p6_f1","p6_f2","p6_f3","p6_f4","p6_f5","p6_f6","p6_f7",
    "p6_f8","p6_f9","p6_f10","p6_f11","p6_f12","p6_f13",
  ];

  fieldKeys.forEach((key, i) => {
    const y  = doc.y;
    const bg = i % 2 === 0 ? BLANC : "#F8FAFC";
    doc.rect(tX, y, tW, 22).fill(bg);
    doc.rect(tX, y, 3, 22).fill(i % 2 === 0 ? "#D1DAE8" : GOLD);
    // Séparateur vertical
    doc.rect(tX + 250, y, 1, 22).fill("#DDE4EF");
    doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8.5)
      .text(t(lang, key), tX + 12, y + 6, { width: 232, lineBreak: false });
    // Zone de saisie
    doc.rect(tX + 254, y + 2, tW - 258, 18).fillAndStroke(BLANC, "#CBD5E0");
    doc.y = y + 24;
  });

  // Ligne de clôture du tableau
  const clotY = doc.y;
  doc.rect(tX, clotY, tW, 20).fill(BLEU);
  doc.rect(tX, clotY, 3, 20).fill(GOLD);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(8)
    .text(
      lang === "fr"
        ? `- ${fieldKeys.length} champs — Dossier : ${dossier.reference} — Porteur : ${user.prenom} ${user.nom}`
        : `- ${fieldKeys.length} fields — Application: ${dossier.reference} — Owner: ${user.prenom} ${user.nom}`,
      tX + 12, clotY + 6, { width: tW - 20 },
    );
  doc.y = clotY + 24;

  // ── Notice de retour ──────────────────────────────────────────────────────
  doc.moveDown(0.4);
  const noticeY = doc.y;
  doc.rect(52, noticeY, bannerW, 24).fill("#FFFBEB");
  doc.rect(52, noticeY, 4, 24).fill(GOLD);
  doc.fillColor("#92400E").font("Helvetica").fontSize(8)
    .text(
      lang === "fr"
        ? `Ce document doit être complété, signé et retourné à votre conseiller. Référence à rappeler : ${dossier.reference}.`
        : `This document must be completed, signed and returned to your advisor. Reference to quote: ${dossier.reference}.`,
      64, noticeY + 7, { width: bannerW - 20, lineBreak: false },
    );
  doc.y = noticeY + 32;

  // ── Bloc signature ────────────────────────────────────────────────────────
  doc.moveDown(0.5);
  signatureBlock(
    doc,
    t(lang, "p6_sign_left"),
    t(lang, "p6_sign_right", { expert: dossier.expertDesigne ?? "—" }),
  );

  addFooter(doc, contact, "1 / 1");
  doc.end();
  return promise;
}
