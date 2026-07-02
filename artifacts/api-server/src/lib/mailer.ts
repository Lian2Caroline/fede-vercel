import { Resend } from "resend";
import { t, type Lang } from "./i18n";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM ?? "FEDE <noreply@fede-financement.com>";
const IS_CONFIGURED = !!RESEND_API_KEY;

// ─── HTML escaping — appliqué à toutes les valeurs fournies par l'utilisateur ─
function htmlEscape(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ─── Base HTML layout ─────────────────────────────────────────────────────────

function layout(lang: string, title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F1F4FA;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F4FA;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,31,60,0.08);">
      <tr>
        <td style="background:linear-gradient(135deg,#0D1F3C 0%,#1A3561 100%);padding:28px 40px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:44px;height:44px;border-radius:50%;background:#0D1F3C;border:2px solid #FFD500;text-align:center;vertical-align:middle;font-size:18px;font-weight:900;color:#FFD500;letter-spacing:0.05em;">F</td>
              <td style="padding-left:12px;">
                <div style="color:#FFFFFF;font-size:16px;font-weight:800;letter-spacing:0.12em;">FEDE</div>
                <div style="color:rgba(255,255,255,0.4);font-size:10px;">${t(lang, "email_subtitle")}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="padding:32px 40px;">${body}</td></tr>
      <tr>
        <td style="background:#F8F9FC;border-top:1px solid #EEF0F7;padding:18px 40px;text-align:center;">
          <p style="margin:0;color:#B0BAD0;font-size:10px;line-height:1.7;">
            FEDE · Article L1611-2 CGCT · RGPD · France<br/>
            © ${new Date().getFullYear()} FEDE — <a href="mailto:support@fede-financement.com" style="color:#B5872A;text-decoration:none;">support@fede-financement.com</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function codeBlock(lang: string, code: string, expiresMinutes = 5): string {
  const expiryLine = expiresMinutes > 0
    ? `<p style="margin:10px 0 0;color:#DC2626;font-size:11px;font-weight:600;">⏱ ${t(lang, "code_expires", { n: expiresMinutes })}</p>`
    : `<p style="margin:10px 0 0;color:#6B7280;font-size:11px;font-weight:600;">${t(lang, "code_valid_until_entry")}</p>`;
  return `
    <div style="background:#F8F9FC;border:2px solid #DDE2EC;border-radius:14px;padding:28px;text-align:center;margin:20px 0;">
      <p style="margin:0 0 8px;color:#8B9BB4;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${t(lang, "code_label")}</p>
      <div style="font-size:38px;font-weight:900;letter-spacing:8px;color:#0D1F3C;font-family:'Courier New',monospace;">${code}</div>
      ${expiryLine}
    </div>`;
}

function statusBadge(lang: string, statut: string): { label: string; color: string; bg: string } {
  const colors: Record<string, { color: string; bg: string }> = {
    soumis:         { color: "#1E40AF", bg: "#EFF6FF" },
    en_instruction: { color: "#92400E", bg: "#FFFBEB" },
    expertise:      { color: "#7C3AED", bg: "#F5F3FF" },
    valide:         { color: "#065F46", bg: "#ECFDF5" },
    rejete:         { color: "#991B1B", bg: "#FEF2F2" },
    verse:          { color: "#065F46", bg: "#ECFDF5" },
  };
  const labelKey = `sl_${statut}`;
  const label = t(lang, labelKey) !== labelKey ? t(lang, labelKey) : statut;
  const c = colors[statut] ?? { color: "#374151", bg: "#F3F4F6" };
  return { label, ...c };
}

function warningBanner(text: string): string {
  return `<div style="background:#FFF8F0;border:1px solid #F0D9A8;border-radius:10px;padding:12px 16px;margin:16px 0;">
    <p style="margin:0;color:#92400E;font-size:12px;line-height:1.6;">⚠️ ${text}</p>
  </div>`;
}

function infoBanner(text: string): string {
  return `<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:12px 16px;margin:16px 0;">
    <p style="margin:0;color:#1E40AF;font-size:12px;line-height:1.6;">ℹ️ ${text}</p>
  </div>`;
}

function ctaButton(label: string, href: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${href}" style="display:inline-block;background:#0D1F3C;color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;">
      ${label}
    </a>
  </div>`;
}

function tag(text: string): string {
  return `<p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">${text}</p>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">${text}</h1>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 8px;color:#4B5574;font-size:14px;line-height:1.7;">${text}</p>`;
}

function dossierTable(rows: [string, string][]): string {
  const rowsHtml = rows.map(([label, value]) =>
    `<tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;width:40%;">${label}</td><td style="color:#0D1F3C;font-size:13px;">${value}</td></tr>`
  ).join("");
  return `<table style="width:100%;background:#F8F9FC;border:1px solid #EEF0F7;border-radius:12px;padding:16px;margin-bottom:20px;" cellpadding="8">${rowsHtml}</table>`;
}

// ─── Email send helper ────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string, consoleFallback: () => void) {
  if (!IS_CONFIGURED) {
    console.log("\n📧 [MAILER — MODE DEV] Email non envoyé (RESEND_API_KEY non configuré)");
    consoleFallback();
    console.log("─".repeat(60));
    return;
  }
  const resend = new Resend(RESEND_API_KEY!);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. INSCRIPTION — Vérification email
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailVerification(opts: {
  to: string; prenom: string; code: string; lang?: string;
}) {
  const { to, code, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const subject = t(lang, "e1_subject", { code });
  const html = layout(lang, subject, `
    ${tag(t(lang, "e1_tag"))}
    ${h1(t(lang, "e1_heading", { prenom }))}
    ${para(t(lang, "e1_body"))}
    ${codeBlock(lang, code, 10)}
    ${warningBanner(t(lang, "code_warning"))}
    <p style="margin:0;color:#8B9BB4;font-size:12px;line-height:1.6;">${t(lang, "e1_ignore")}</p>
  `);
  await send(to, subject, html, () => {
    console.log(`  To: ${to} | Name: ${prenom} | Code: ${code} (10 min)`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONNEXION — Nouvelle IP (2FA)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendLoginVerification(opts: {
  to: string; prenom: string; code: string; ipAddress: string; lang?: string;
}) {
  const { to, code, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const ipAddress = htmlEscape(opts.ipAddress);
  const subject = t(lang, "e2_subject", { code });
  const html = layout(lang, subject, `
    ${tag(t(lang, "e2_tag"))}
    ${h1(t(lang, "e2_heading"))}
    ${para(t(lang, "e2_body", { prenom }))}
    ${codeBlock(lang, code, 5)}
    ${warningBanner(t(lang, "e2_ip_warning", { ip: ipAddress }))}
  `);
  await send(to, subject, html, () => {
    console.log(`  To: ${to} | Name: ${prenom} | Code: ${code} | IP: ${ipAddress}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DOSSIER — Création
// ─────────────────────────────────────────────────────────────────────────────

export async function sendDossierCreated(opts: {
  to: string; prenom: string; reference: string; titre: string; territoire: string; lang?: string;
}) {
  const { to, reference, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const titre = htmlEscape(opts.titre);
  const territoire = htmlEscape(opts.territoire);
  const subject = `[FEDE] ${t(lang, "e3_heading")} — ${reference}`;
  const html = layout(lang, subject, `
    ${tag(t(lang, "e3_tag"))}
    ${h1(t(lang, "e3_heading"))}
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">${t(lang, "e3_body", { prenom })}</p>
    ${dossierTable([
      [t(lang, "lbl_reference"), `<span style="font-family:monospace;font-size:14px;font-weight:800;color:#0D1F3C;">${reference}</span>`],
      [t(lang, "lbl_intitule"), titre],
      [t(lang, "lbl_territoire"), territoire],
      [t(lang, "lbl_statut"), `<span style="background:#F3F4F6;color:#374151;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:700;">${t(lang, "e3_tag")}</span>`],
    ])}
    ${infoBanner(t(lang, "e3_info"))}
  `);
  await send(to, subject, html, () => {
    console.log(`  To: ${to} | Dossier: ${reference}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DOSSIER — Soumission
// ─────────────────────────────────────────────────────────────────────────────

export async function sendDossierSoumis(opts: {
  to: string; prenom: string; reference: string; titre: string;
  allDocsComplete?: boolean; lang?: string;
}) {
  const { to, reference, lang = "fr", allDocsComplete = false } = opts;
  const prenom = htmlEscape(opts.prenom);
  const titre = htmlEscape(opts.titre);
  const subject = `[FEDE] ${t(lang, "e4_tag")} — ${reference}`;
  const bottomBlock = allDocsComplete
    ? infoBanner(t(lang, "e4_complete_info"))
    : `<div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;color:#78350F;font-size:13px;line-height:1.7;">⚠️ ${t(lang, "e4_partial_warning")}</p>
      </div>`;
  const html = layout(lang, subject, `
    ${tag(t(lang, "e4_tag"))}
    ${h1(t(lang, "e4_heading"))}
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">${t(lang, "e4_body", { prenom, ref: reference })}</p>
    ${dossierTable([
      [t(lang, "lbl_reference"), `<span style="font-family:monospace;font-size:14px;font-weight:800;color:#0D1F3C;">${reference}</span>`],
      [t(lang, "lbl_projet"), titre],
    ])}
    ${bottomBlock}
  `);
  await send(to, subject, html, () => {
    console.log(`  To: ${to} | Dossier: ${reference} | Complete: ${allDocsComplete}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ADMIN — Changement de statut
// ─────────────────────────────────────────────────────────────────────────────

export async function sendStatutChange(opts: {
  to: string; prenom: string; reference: string; titre: string;
  statut: string; commentaire?: string; lang?: string;
}) {
  const { to, reference, statut, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const titre = htmlEscape(opts.titre);
  const commentaire = opts.commentaire != null ? htmlEscape(opts.commentaire) : undefined;

  const titleKey = `s_${statut}_title`;
  const introKey = `s_${statut}_intro`;
  const title = t(lang, titleKey) !== titleKey
    ? t(lang, titleKey)
    : t(lang, "s_en_instruction_title");
  const intro = t(lang, introKey) !== introKey
    ? t(lang, introKey)
    : t(lang, "s_en_instruction_intro");

  const emojiMap: Record<string, string> = {
    en_instruction: "🔍", expertise: "📋", valide: "🎉", rejete: "❌", verse: "💰",
  };
  const emoji = emojiMap[statut] ?? "📌";
  const badge = statusBadge(lang, statut);
  const bannerKey = statut === "verse" ? "connect_info_verse"
    : statut === "valide" ? "connect_info_valide"
    : "connect_info";
  const subject = `[FEDE] ${t(lang, "e5_tag")} — ${reference}`;

  const html = layout(lang, subject, `
    ${tag(t(lang, "e5_tag"))}
    ${h1(`${emoji} ${title}`)}
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">${t(lang, "greeting", { prenom })}, ${intro}</p>
    ${dossierTable([
      [t(lang, "lbl_reference"), `<span style="font-family:monospace;font-size:14px;font-weight:800;color:#0D1F3C;">${reference}</span>`],
      [t(lang, "lbl_projet"), titre],
      [t(lang, "lbl_nouveau_statut"), `<span style="background:${badge.bg};color:${badge.color};padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">${badge.label}</span>`],
    ])}
    ${commentaire ? `
    <div style="background:#F8F9FC;border-left:4px solid #B5872A;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0 0 4px;color:#8B9BB4;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;">${t(lang, "lbl_conseiller_msg")}</p>
      <p style="margin:0;color:#0D1F3C;font-size:14px;line-height:1.6;">${commentaire}</p>
    </div>` : ""}
    ${infoBanner(t(lang, bannerKey))}
  `);
  await send(to, subject, html, () => {
    console.log(`  To: ${to} | Dossier: ${reference} | Statut: ${statut}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ADMIN — Émission de frais
// ─────────────────────────────────────────────────────────────────────────────

export async function sendFraisEmis(opts: {
  to: string; prenom: string; reference: string; dossierRef: string;
  montantTTC: number; echeance: Date; lang?: string;
  coordonnees?: {
    beneficiaire: string; iban: string; bic: string;
    banque: string; domiciliation: string; libelleVirement: string;
  };
}) {
  const { to, reference, dossierRef, montantTTC, echeance, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const coordonnees = opts.coordonnees ? {
    ...opts.coordonnees,
    beneficiaire:   htmlEscape(opts.coordonnees.beneficiaire),
    banque:         htmlEscape(opts.coordonnees.banque),
    domiciliation:  htmlEscape(opts.coordonnees.domiciliation),
    libelleVirement: htmlEscape(opts.coordonnees.libelleVirement),
  } : undefined;
  const locale = lang === "fr" ? "fr-FR" : lang === "en" ? "en-GB" : `${lang}-${lang.toUpperCase()}`;
  const dateStr = echeance.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });

  const ribBlock = coordonnees ? `
    <p style="margin:20px 0 8px;color:#0D1F3C;font-size:13px;font-weight:800;">${t(lang, "e6_bank_title")}</p>
    <table style="width:100%;background:#F0FDF4;border:2px solid #BBF7D0;border-radius:12px;padding:16px;margin-bottom:20px;" cellpadding="8">
      <tr><td style="color:#065F46;font-size:12px;font-weight:700;width:45%;">${t(lang, "lbl_beneficiaire")}</td>
          <td style="color:#065F46;font-size:13px;font-weight:700;">${coordonnees.beneficiaire}</td></tr>
      <tr><td style="color:#065F46;font-size:12px;font-weight:700;">IBAN</td>
          <td style="color:#065F46;font-size:14px;font-weight:800;font-family:monospace;">${coordonnees.iban}</td></tr>
      <tr><td style="color:#065F46;font-size:12px;font-weight:700;">BIC / SWIFT</td>
          <td style="color:#065F46;font-size:13px;font-family:monospace;">${coordonnees.bic}</td></tr>
      <tr><td style="color:#065F46;font-size:12px;font-weight:700;">${t(lang, "lbl_banque")}</td>
          <td style="color:#065F46;font-size:13px;">${coordonnees.banque}</td></tr>
      <tr><td style="color:#065F46;font-size:12px;font-weight:700;">${t(lang, "lbl_domiciliation")}</td>
          <td style="color:#065F46;font-size:13px;">${coordonnees.domiciliation}</td></tr>
      <tr><td style="color:#065F46;font-size:12px;font-weight:700;">${t(lang, "lbl_libelle")}</td>
          <td style="color:#1E40AF;font-size:13px;font-weight:800;font-family:monospace;">${coordonnees.libelleVirement}</td></tr>
    </table>` : infoBanner(t(lang, "connect_info"));

  const subject = `[FEDE] ${t(lang, "e6_tag")} ${reference} — ${montantTTC.toFixed(2)}€ TTC`;
  const html = layout(lang, subject, `
    ${tag(t(lang, "e6_tag"))}
    ${h1(t(lang, "e6_heading", { ref: reference }))}
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">${t(lang, "e6_body", { prenom, dossierRef })}</p>
    ${dossierTable([
      [t(lang, "lbl_ref_facturation"), `<span style="font-family:monospace;font-size:14px;font-weight:800;color:#0D1F3C;">${reference}</span>`],
      [t(lang, "lbl_dossier_concerne"), `<span style="font-family:monospace;">${dossierRef}</span>`],
      [t(lang, "lbl_montant_ttc"), `<span style="font-size:20px;font-weight:900;color:#0D1F3C;">${montantTTC.toFixed(2)} €</span>`],
      [t(lang, "lbl_echeance"), `<span style="color:#DC2626;font-weight:700;">${dateStr}</span>`],
    ])}
    ${ribBlock}
    ${warningBanner(t(lang, "e6_warning", { date: dateStr }))}
  `);
  await send(to, subject, html, () => {
    console.log(`  To: ${to} | Frais: ${reference} | Montant: ${montantTTC}€`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MESSAGE — Nouveau message
// ─────────────────────────────────────────────────────────────────────────────

export async function sendNewMessageNotification(opts: {
  to: string; prenom: string; dossierRef: string; extraits: string[]; lang?: string;
}) {
  const { to, dossierRef, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const extraits = opts.extraits.map(htmlEscape);
  const n = extraits.length;
  const heading = n > 1
    ? t(lang, "e7_heading_multi", { n: String(n) })
    : t(lang, "e7_heading");
  const subject = `[FEDE] ${heading} — ${dossierRef}`;
  const messagesHtml = extraits.map((extrait) => {
    const excerpt = extrait.length > 200 ? extrait.slice(0, 200) + "…" : extrait;
    return `<div style="background:#F8F9FC;border-left:4px solid #0D1F3C;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:12px;">
      <p style="margin:0 0 4px;color:#8B9BB4;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;">${t(lang, "e7_extrait")}</p>
      <p style="margin:0;color:#0D1F3C;font-size:14px;line-height:1.6;font-style:italic;">"${excerpt}"</p>
    </div>`;
  }).join("");
  const html = layout(lang, subject, `
    ${tag(t(lang, "e7_tag"))}
    ${h1(heading)}
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">${t(lang, "e7_body", { prenom, ref: dossierRef })}</p>
    ${messagesHtml}
    ${infoBanner(t(lang, "e7_connect"))}
  `);
  await send(to, subject, html, () => {
    console.log(`  To: ${to} | Dossier: ${dossierRef} | Messages: ${n}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MOT DE PASSE — Réinitialisation
// ─────────────────────────────────────────────────────────────────────────────

export async function sendPasswordReset(opts: {
  to: string; prenom: string; resetUrl: string; lang?: string;
}) {
  const { to, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const resetUrl = opts.resetUrl;
  const subject = t(lang, "e8_subject");
  const html = layout(lang, subject, `
    ${tag(t(lang, "e8_tag"))}
    ${h1(t(lang, "e8_heading"))}
    ${para(t(lang, "e8_body", { prenom }))}
    <p style="margin:0 0 16px;color:#4B5574;font-size:14px;line-height:1.7;">
      ${t(lang, "e8_body_link")}
    </p>
    ${ctaButton(t(lang, "e8_cta"), resetUrl)}
    ${warningBanner(t(lang, "link_warning"))}
    <p style="margin:16px 0 0;color:#8B9BB4;font-size:12px;line-height:1.6;">
      ${t(lang, "e8_link_copy")}<br/>
      <a href="${resetUrl}" style="color:#B5872A;word-break:break-all;font-size:11px;">${resetUrl}</a>
    </p>
  `);
  await send(to, subject, html, () => {
    console.log(`  To: ${to}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DOCUMENTS — Transmission admin
// ─────────────────────────────────────────────────────────────────────────────

export async function sendDocumentsToAdmin(opts: {
  to: string;
  userPrenom: string;
  userNom: string;
  userEmail: string;
  dossierRef: string;
  dossierTitre: string;
  territoire?: string;
  secteur?: string;
  montantDemande?: number;
  montantApport?: number;
  description?: string | null;
  justificationBudget?: string | null;
  documents: { nom: string; type: string }[];
  attachments?: { filename: string; content: Buffer }[];
}): Promise<void> {
  const { to, userEmail, dossierRef, montantDemande, montantApport, documents, attachments } = opts;
  const userPrenom        = htmlEscape(opts.userPrenom);
  const userNom           = htmlEscape(opts.userNom);
  const dossierTitre      = htmlEscape(opts.dossierTitre);
  const territoire        = opts.territoire        != null ? htmlEscape(opts.territoire)        : undefined;
  const secteur           = opts.secteur           != null ? htmlEscape(opts.secteur)           : undefined;
  const description       = opts.description       != null ? htmlEscape(opts.description)       : null;
  const justificationBudget = opts.justificationBudget != null ? htmlEscape(opts.justificationBudget) : null;
  const lang = "fr";
  const subject = `[Admin] Documents reçus — ${dossierRef}`;
  const docsHtml = documents.map((d) =>
    `<li style="margin:4px 0;color:#0D1F3C;font-size:13px;"><strong>${d.nom}</strong> <span style="color:#8B9BB4;">(${d.type})</span></li>`
  ).join("");
  const projectRows: [string, string][] = [
    ["Porteur", `${userPrenom} ${userNom}`],
    ["Email", userEmail],
    ["Référence", dossierRef],
    ["Projet", dossierTitre],
    ...(territoire ? [["Territoire", territoire] as [string, string]] : []),
    ...(secteur ? [["Secteur", secteur] as [string, string]] : []),
    ...(montantDemande != null ? [["Montant demandé", `${montantDemande.toLocaleString("fr-FR")} €`] as [string, string]] : []),
    ...(montantApport != null ? [["Apport personnel", `${montantApport.toLocaleString("fr-FR")} €`] as [string, string]] : []),
  ];
  const descBlock = description ? `
    <div style="background:#F8F9FC;border-left:4px solid #B5872A;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:12px;">
      <p style="margin:0 0 4px;color:#8B9BB4;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;">Description du projet</p>
      <p style="margin:0;color:#0D1F3C;font-size:13px;line-height:1.6;white-space:pre-wrap;">${description}</p>
    </div>` : "";
  const justifBlock = justificationBudget ? `
    <div style="background:#F8F9FC;border-left:4px solid #B5872A;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0 0 4px;color:#8B9BB4;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;">Justification budgétaire</p>
      <p style="margin:0;color:#0D1F3C;font-size:13px;line-height:1.6;white-space:pre-wrap;">${justificationBudget}</p>
    </div>` : "";
  const html = layout(lang, subject, `
    ${tag("Notification admin")}
    ${h1("Documents reçus")}
    ${dossierTable(projectRows)}
    ${descBlock}
    ${justifBlock}
    ${para("Les documents suivants ont été soumis :")}
    <ul style="margin:8px 0 16px;padding-left:20px;">${docsHtml}</ul>
  `);
  if (!IS_CONFIGURED) {
    console.log(`\n📧 [MAILER DEV] sendDocumentsToAdmin → ${to}`);
    return;
  }
  const resend = new Resend(RESEND_API_KEY!);
  const payload: Parameters<typeof resend.emails.send>[0] = {
    from: FROM, to, subject, html,
    attachments: attachments?.map((a) => ({ filename: a.filename, content: a.content })),
  };
  const { error } = await resend.emails.send(payload);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9b. ADMIN — Nouveau dossier soumis (alerte)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendNewDossierAdmin(opts: {
  to: string;
  userPrenom: string;
  userNom: string;
  userEmail: string;
  dossierRef: string;
  dossierTitre: string;
  territoire?: string;
  secteur?: string;
  montantDemande?: number;
  description?: string | null;
}): Promise<void> {
  const { to, userEmail, dossierRef, montantDemande } = opts;
  const userPrenom   = htmlEscape(opts.userPrenom);
  const userNom      = htmlEscape(opts.userNom);
  const dossierTitre = htmlEscape(opts.dossierTitre);
  const territoire   = opts.territoire != null ? htmlEscape(opts.territoire) : undefined;
  const secteur      = opts.secteur    != null ? htmlEscape(opts.secteur)    : undefined;
  const description  = opts.description != null ? htmlEscape(opts.description) : null;
  const lang = "fr";
  const subject = `[Admin] Nouveau dossier soumis — ${dossierRef}`;
  const rows: [string, string][] = [
    ["Porteur", `${userPrenom} ${userNom}`],
    ["Email", userEmail],
    ["Référence", `<span style="font-family:monospace;font-size:14px;font-weight:800;color:#0D1F3C;">${dossierRef}</span>`],
    ["Projet", dossierTitre],
    ...(territoire ? [["Territoire", territoire] as [string, string]] : []),
    ...(secteur ? [["Secteur", secteur] as [string, string]] : []),
    ...(montantDemande != null ? [["Montant demandé", `${montantDemande.toLocaleString("fr-FR")} €`] as [string, string]] : []),
  ];
  const descBlock = description ? `
    <div style="background:#F8F9FC;border-left:4px solid #B5872A;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0 0 4px;color:#8B9BB4;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;">Description du projet</p>
      <p style="margin:0;color:#0D1F3C;font-size:13px;line-height:1.6;white-space:pre-wrap;">${description}</p>
    </div>` : "";
  const html = layout(lang, subject, `
    ${tag("Nouveau dossier")}
    ${h1("Nouveau dossier soumis")}
    ${dossierTable(rows)}
    ${descBlock}
    ${infoBanner("Connectez-vous à l'interface d'administration pour instruire ce dossier.")}
  `);
  await send(to, subject, html, () => {
    console.log(`\n📧 [MAILER DEV] sendNewDossierAdmin → ${to} | Dossier: ${dossierRef}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. DOCUMENTS — Rejet d'un document
// ─────────────────────────────────────────────────────────────────────────────

export async function sendDocumentRejected(opts: {
  to: string;
  prenom: string;
  dossierRef: string;
  documentNom: string;
  motif: string;
  lang?: string;
}): Promise<void> {
  const { to, dossierRef, lang = "fr" } = opts;
  const prenom      = htmlEscape(opts.prenom);
  const documentNom = htmlEscape(opts.documentNom);
  const motif       = htmlEscape(opts.motif);
  const subject = `[FEDE] ${t(lang, "e10_heading")} — ${dossierRef}`;
  const html = layout(lang, subject, `
    ${tag(t(lang, "lbl_reference"))}
    ${h1(t(lang, "e10_heading"))}
    ${para(t(lang, "greeting", { prenom }))}
    ${para(t(lang, "e10_body", { document: documentNom, ref: dossierRef }))}
    ${dossierTable([[t(lang, "e10_motif_label"), motif]])}
    ${para(t(lang, "e10_action"))}
  `);
  await send(to, subject, html, () => {
    console.log(`  Document rejeté: ${documentNom} — Dossier: ${dossierRef}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. VIREMENT — Code de validation (utilisateur)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendVirementCodeEmail(opts: {
  to: string;
  prenom: string;
  etape: number;
  code: string;
  reference: string;
  montant: number;
  lang?: string;
}): Promise<void> {
  const { to, etape, code, reference, montant, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const pct = Math.round((etape / 4) * 100);
  const libelleEtape = t(lang, `virement_etape_${etape}`);
  const locale = lang === "fr" ? "fr-FR" : lang === "en" ? "en-GB" : `${lang}-${lang.toUpperCase()}`;
  const subject = `[FEDE] ${libelleEtape} · ${pct}% — ${reference}`;
  const html = layout(lang, subject, `
    ${tag(t(lang, "e11_tag", { pct: String(pct) }))}
    ${h1(libelleEtape)}
    ${para(t(lang, "greeting", { prenom }))}
    ${para(t(lang, "e11_body", { libelle: libelleEtape, ref: reference, pct: String(pct) }))}
    ${dossierTable([
      [t(lang, "lbl_reference"), reference],
      [t(lang, "lbl_montant"), `${montant.toLocaleString(locale)} €`],
      [t(lang, "e11_progression_label"), `${pct}%`],
    ])}
    ${codeBlock(lang, code, 0)}
    ${warningBanner(t(lang, "virement_code_warning"))}
  `);
  await send(to, subject, html, () => {
    console.log(`  Virement code étape ${etape}: ${code} — Dossier: ${reference}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. VIREMENT — Code de validation (admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendVirementCodeAdmin(opts: {
  to: string;
  prenom: string;
  etape: number;
  code: string;
  libelle: string;
  reference: string;
  banqueNom: string;
  lang?: string;
}): Promise<void> {
  const { to, etape, code, reference, lang = "fr" } = opts;
  const prenom    = htmlEscape(opts.prenom);
  const libelle   = htmlEscape(opts.libelle);
  const banqueNom = htmlEscape(opts.banqueNom);
  const pct = Math.round((etape / 4) * 100);
  const subject = `[FEDE] ${libelle} · ${pct}% — ${reference}`;
  const html = layout(lang, subject, `
    ${tag(t(lang, "e12_tag", { pct: String(pct) }))}
    ${h1(libelle)}
    ${para(t(lang, "greeting", { prenom }))}
    ${para(t(lang, "e12_body2", { libelle, pct: String(pct) }))}
    ${dossierTable([
      [t(lang, "lbl_reference"), reference],
      [t(lang, "lbl_libelle"), libelle],
      [t(lang, "lbl_banque"), banqueNom],
      [t(lang, "lbl_progression"), `${pct}%`],
    ])}
    ${codeBlock(lang, code, 0)}
    ${warningBanner(t(lang, "virement_code_warning"))}
  `);
  await send(to, subject, html, () => {
    console.log(`  Virement code admin étape ${etape}: ${code} — Dossier: ${reference}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. VIREMENT — Confirmation de virement effectué
// ─────────────────────────────────────────────────────────────────────────────

export async function sendVirementComplete(opts: {
  to: string;
  prenom: string;
  reference: string;
  montant: number;
  iban: string;
  lang?: string;
}): Promise<void> {
  const { to, reference, montant, iban, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const locale = lang === "fr" ? "fr-FR" : lang === "en" ? "en-GB" : `${lang}-${lang.toUpperCase()}`;
  const subject = `[FEDE] ${t(lang, "e13_heading")} — ${reference}`;
  const maskedIban = iban.length > 8 ? `${iban.substring(0, 4)}****${iban.slice(-4)}` : iban;
  const html = layout(lang, subject, `
    ${tag(t(lang, "e11_tag", { pct: "100" }))}
    ${h1(t(lang, "e13_heading"))}
    ${para(t(lang, "greeting", { prenom }))}
    ${para(t(lang, "e13_body", { ref: reference }))}
    ${dossierTable([
      [t(lang, "lbl_reference"), reference],
      [t(lang, "e13_montant_label"), `${montant.toLocaleString(locale)} €`],
      [t(lang, "e13_iban_label"), maskedIban],
    ])}
    ${infoBanner(t(lang, "e13_info"))}
  `);
  await send(to, subject, html, () => {
    console.log(`  Virement complet: ${montant}€ → ${maskedIban} — Dossier: ${reference}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. ADMIN — Demande de documents complémentaires
// ─────────────────────────────────────────────────────────────────────────────

export async function sendDemandeDocuments(opts: {
  to: string;
  prenom: string;
  reference: string;
  documents: string[];
  lang?: string;
}): Promise<void> {
  const { to, reference, lang = "fr" } = opts;
  const prenom    = htmlEscape(opts.prenom);
  const documents = opts.documents.map(htmlEscape);
  const subject = `[FEDE] ${t(lang, "e14_heading")} — ${reference}`;
  const docsHtml = documents.map((d) =>
    `<li style="margin:4px 0;color:#0D1F3C;font-size:13px;">${d}</li>`
  ).join("");
  const html = layout(lang, subject, `
    ${tag(t(lang, "lbl_reference"))}
    ${h1(t(lang, "e14_heading"))}
    ${para(t(lang, "greeting", { prenom }))}
    ${para(t(lang, "e14_body", { ref: reference }))}
    <ul style="margin:8px 0 16px;padding-left:20px;">${docsHtml}</ul>
    ${para(t(lang, "e14_action"))}
    ${infoBanner(t(lang, "e14_info"))}
  `);
  await send(to, subject, html, () => {
    console.log(`  Demande documents — Dossier: ${reference} — ${documents.length} docs`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. ADMIN — Broadcast message
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBroadcast(opts: {
  to: string;
  prenom: string;
  sujet: string;
  contenu: string;
  lang?: string;
}): Promise<void> {
  const { to, lang = "fr" } = opts;
  const prenom  = htmlEscape(opts.prenom);
  const sujet   = htmlEscape(opts.sujet);
  const contenu = htmlEscape(opts.contenu);
  const html = layout(lang, sujet, `
    ${tag("FEDE")}
    ${h1(sujet)}
    ${para(t(lang, "greeting", { prenom }))}
    ${para(contenu)}
    ${infoBanner(t(lang, "broadcast_support"))}
  `);
  await send(to, sujet, html, () => {
    console.log(`  Broadcast → ${to}: ${sujet}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. ADMIN — Action de phase
// ─────────────────────────────────────────────────────────────────────────────

export async function sendPhaseAction(opts: {
  to: string;
  prenom: string;
  action: string;
  reference: string;
  note?: string | null;
  lang?: string;
}): Promise<void> {
  const { to, reference, lang = "fr" } = opts;
  const prenom = htmlEscape(opts.prenom);
  const action = htmlEscape(opts.action);
  const note   = opts.note != null ? htmlEscape(opts.note) : undefined;
  const subject = `[FEDE] ${t(lang, "e16_subject_tag")} — ${reference}`;
  const html = layout(lang, subject, `
    ${tag(t(lang, "lbl_reference"))}
    ${h1(t(lang, "e16_heading"))}
    ${para(t(lang, "greeting", { prenom }))}
    ${para(t(lang, "e16_body", { ref: reference, action }))}
    ${note ? dossierTable([[t(lang, "e16_note_label"), note]]) : ""}
    ${infoBanner(t(lang, "phase_action_connect"))}
  `);
  await send(to, subject, html, () => {
    console.log(`  Phase action: ${action} — Dossier: ${reference}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. ADMIN — Demande de virement avec instructions bancaires
// ─────────────────────────────────────────────────────────────────────────────

export async function sendVirementPaiementRequest(opts: {
  to: string;
  prenom: string;
  etape: number;
  montant: number;
  libelle: string;
  reference: string;
  instructions: string;
  banqueNom: string;
  lang?: string;
}): Promise<void> {
  const { to, etape, montant, reference, lang = "fr" } = opts;
  const prenom       = htmlEscape(opts.prenom);
  const libelle      = htmlEscape(opts.libelle);
  const banqueNom    = htmlEscape(opts.banqueNom);
  const instructions = htmlEscape(opts.instructions);
  const pct = Math.round((etape / 4) * 100);
  const locale = lang === "fr" ? "fr-FR" : lang === "en" ? "en-GB" : `${lang}-${lang.toUpperCase()}`;
  const subject = `[FEDE] ${libelle} — ${reference}`;
  const html = layout(lang, subject, `
    ${tag(t(lang, "e11_tag", { pct: String(pct) }))}
    ${h1(t(lang, "e17_heading"))}
    ${para(t(lang, "greeting", { prenom }))}
    ${para(t(lang, "e17_body", { libelle }))}
    ${dossierTable([
      [t(lang, "lbl_reference"), reference],
      [t(lang, "lbl_montant"), `${montant.toLocaleString(locale)} €`],
      [t(lang, "lbl_libelle"), libelle],
      [t(lang, "lbl_banque"), banqueNom],
      [t(lang, "e11_progression_label"), `${pct}%`],
    ])}
    <div style="background:#F8F9FC;border:1px solid #DDE2EC;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="margin:0 0 8px;color:#8B9BB4;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${t(lang, "e17_instructions_label")}</p>
      <p style="margin:0;color:#0D1F3C;font-size:13px;line-height:1.7;white-space:pre-wrap;">${instructions}</p>
    </div>
    ${warningBanner(t(lang, "e17_warning"))}
  `);
  await send(to, subject, html, () => {
    console.log(`  Virement paiement request étape ${etape}: ${montant}€ — Dossier: ${reference}`);
  });
}
