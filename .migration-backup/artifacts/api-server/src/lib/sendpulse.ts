import nodemailer from "nodemailer";

// ─── SendPulse SMTP configuration ────────────────────────────────────────────
// Configure via environment variables:
//   SENDPULSE_SMTP_USER  → your SendPulse account email
//   SENDPULSE_SMTP_PASS  → SendPulse SMTP password (found in Account Settings → SMTP)
//   SENDPULSE_FROM       → sender address, e.g. "CapSubvention <noreply@capsubvention.com>"

const SMTP_USER = process.env.SENDPULSE_SMTP_USER;
const SMTP_PASS = process.env.SENDPULSE_SMTP_PASS;
const FROM = process.env.SENDPULSE_FROM ?? "CapSubvention <noreply@capsubvention.com>";
const IS_CONFIGURED = !!(SMTP_USER && SMTP_PASS);

function transport() {
  if (!IS_CONFIGURED) return null;
  return nodemailer.createTransport({
    host: "smtp-pulse.com",
    port: 465,
    secure: true,
    auth: { user: SMTP_USER!, pass: SMTP_PASS! },
  });
}

// ─── Base HTML layout ─────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F1F4FA;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F4FA;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,31,60,0.08);">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#0D1F3C 0%,#1A3561 100%);padding:28px 40px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:44px;height:44px;border-radius:22px;background:#B5872A;text-align:center;vertical-align:middle;font-size:17px;font-weight:900;color:#0D1F3C;letter-spacing:-0.5px;">CS</td>
              <td style="padding-left:12px;">
                <div style="color:#FFFFFF;font-size:16px;font-weight:800;">CapSubvention</div>
                <div style="color:rgba(255,255,255,0.4);font-size:10px;">Financements publics non remboursables · Outre-Mer</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Body -->
      <tr><td style="padding:32px 40px;">${body}</td></tr>
      <!-- Footer -->
      <tr>
        <td style="background:#F8F9FC;border-top:1px solid #EEF0F7;padding:18px 40px;text-align:center;">
          <p style="margin:0;color:#B0BAD0;font-size:10px;line-height:1.7;">
            CapSubvention · Article L1611-2 CGCT · Données RGPD · Hébergement France<br/>
            © ${new Date().getFullYear()} CapSubvention — <a href="mailto:support@capsubvention.com" style="color:#B5872A;text-decoration:none;">support@capsubvention.com</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function codeBlock(code: string, expiresMinutes = 5): string {
  return `
    <div style="background:#F8F9FC;border:2px solid #DDE2EC;border-radius:14px;padding:28px;text-align:center;margin:20px 0;">
      <p style="margin:0 0 8px;color:#8B9BB4;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Votre code de vérification</p>
      <div style="font-size:38px;font-weight:900;letter-spacing:8px;color:#0D1F3C;font-family:'Courier New',monospace;">${code}</div>
      <p style="margin:10px 0 0;color:#DC2626;font-size:11px;font-weight:600;">⏱ Valide ${expiresMinutes} minutes uniquement</p>
    </div>`;
}

function statusBadge(statut: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    soumis:        { label: "Soumis",           color: "#1E40AF", bg: "#EFF6FF" },
    en_instruction:{ label: "En instruction",   color: "#92400E", bg: "#FFFBEB" },
    expertise:     { label: "En expertise",     color: "#7C3AED", bg: "#F5F3FF" },
    valide:        { label: "Validé ✓",         color: "#065F46", bg: "#ECFDF5" },
    rejete:        { label: "Refusé",           color: "#991B1B", bg: "#FEF2F2" },
    verse:         { label: "Versement effectué",color: "#065F46", bg: "#ECFDF5" },
  };
  return map[statut] ?? { label: statut, color: "#374151", bg: "#F3F4F6" };
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

// ─── Email send helper ────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string, consoleFallback: () => void) {
  const t = transport();
  if (!t) {
    console.log("\n📧 [SENDPULSE — MODE DEV] Email non envoyé (SMTP non configuré)");
    consoleFallback();
    console.log("─".repeat(60));
    return;
  }
  await t.sendMail({ from: FROM, to, subject, html });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. INSCRIPTION — Vérification email
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailVerification(opts: {
  to: string; prenom: string; code: string;
}) {
  const { to, prenom, code } = opts;
  const html = layout("Vérifiez votre adresse email — CapSubvention", `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Confirmation d'inscription</p>
    <h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">Bienvenue, ${prenom} !</h1>
    <p style="margin:0 0 8px;color:#4B5574;font-size:14px;line-height:1.7;">
      Votre compte CapSubvention a bien été créé. Pour finaliser votre inscription et accéder à votre espace personnel, veuillez saisir le code ci-dessous.
    </p>
    ${codeBlock(code, 10)}
    ${warningBanner("Ne partagez jamais ce code. L'équipe CapSubvention ne vous le demandera jamais.")}
    <p style="margin:0;color:#8B9BB4;font-size:12px;line-height:1.6;">
      Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer ce message.
    </p>
  `);
  await send(to, `[CapSubvention] Confirmez votre adresse email — Code : ${code}`, html, () => {
    console.log(`  Destinataire : ${to}`);
    console.log(`  Prénom       : ${prenom}`);
    console.log(`  Code         : ${code} (valide 10 min)`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONNEXION — Nouvelle IP (2FA)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendLoginVerification(opts: {
  to: string; prenom: string; code: string; ipAddress: string;
}) {
  const { to, prenom, code, ipAddress } = opts;
  const html = layout("Vérification de connexion — CapSubvention", `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Vérification de connexion</p>
    <h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">Nouvelle adresse IP détectée</h1>
    <p style="margin:0 0 8px;color:#4B5574;font-size:14px;line-height:1.7;">
      Bonjour ${prenom}, une connexion à votre espace CapSubvention a été initiée depuis une adresse IP différente.
      Pour confirmer votre identité, saisissez le code ci-dessous.
    </p>
    ${codeBlock(code, 5)}
    ${warningBanner(`IP détectée : ${ipAddress}. Si vous n'êtes pas à l'origine de cette connexion, ignorez ce message — votre compte reste protégé.`)}
  `);
  await send(to, `[CapSubvention] Code de vérification : ${code}`, html, () => {
    console.log(`  Destinataire : ${to}`);
    console.log(`  Prénom       : ${prenom}`);
    console.log(`  Code         : ${code} (valide 5 min)`);
    console.log(`  IP           : ${ipAddress}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DOSSIER — Création
// ─────────────────────────────────────────────────────────────────────────────

export async function sendDossierCreated(opts: {
  to: string; prenom: string; reference: string; titre: string; territoire: string;
}) {
  const { to, prenom, reference, titre, territoire } = opts;
  const html = layout("Votre dossier a été créé — CapSubvention", `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Nouveau dossier</p>
    <h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">Dossier créé avec succès</h1>
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">
      Bonjour ${prenom}, votre dossier de demande de financement non remboursable a bien été créé sur la plateforme CapSubvention.
    </p>
    <table style="width:100%;background:#F8F9FC;border:1px solid #EEF0F7;border-radius:12px;padding:16px;margin-bottom:20px;" cellpadding="8">
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;width:40%;">Référence</td><td style="color:#0D1F3C;font-size:14px;font-weight:800;font-family:monospace;">${reference}</td></tr>
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;">Intitulé</td><td style="color:#0D1F3C;font-size:13px;">${titre}</td></tr>
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;">Territoire</td><td style="color:#0D1F3C;font-size:13px;">${territoire}</td></tr>
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;">Statut</td><td><span style="background:#F3F4F6;color:#374151;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:700;">Brouillon</span></td></tr>
    </table>
    ${infoBanner("Prochaine étape : complétez votre dossier et déposez vos pièces justificatives depuis votre espace personnel.")}
  `);
  await send(to, `[CapSubvention] Dossier ${reference} créé — ${titre}`, html, () => {
    console.log(`  Destinataire : ${to}  |  Dossier : ${reference}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DOSSIER — Soumission
// ─────────────────────────────────────────────────────────────────────────────

export async function sendDossierSoumis(opts: {
  to: string; prenom: string; reference: string; titre: string;
}) {
  const { to, prenom, reference, titre } = opts;
  const html = layout("Dossier soumis — CapSubvention", `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Accusé de réception</p>
    <h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">Votre dossier est soumis ✓</h1>
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">
      Bonjour ${prenom}, nous accusons bonne réception de votre dossier <strong>${reference}</strong>.
      Nos conseillers vont procéder à l'instruction administrative dans les meilleurs délais.
    </p>
    <table style="width:100%;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:16px;margin-bottom:20px;" cellpadding="8">
      <tr><td style="color:#065F46;font-size:12px;font-weight:700;width:40%;">Référence</td><td style="color:#065F46;font-size:14px;font-weight:800;font-family:monospace;">${reference}</td></tr>
      <tr><td style="color:#065F46;font-size:12px;font-weight:700;">Projet</td><td style="color:#065F46;font-size:13px;">${titre}</td></tr>
      <tr><td style="color:#065F46;font-size:12px;font-weight:700;">Étape</td><td style="color:#065F46;font-size:13px;font-weight:700;">2 / 5 — Instruction administrative</td></tr>
    </table>
    ${infoBanner("Délai d'instruction moyen : 10 à 15 jours ouvrés. Vous recevrez un email à chaque évolution de votre dossier.")}
    <p style="margin:16px 0 0;color:#8B9BB4;font-size:12px;line-height:1.6;">
      Conservez la référence <strong style="color:#0D1F3C;">${reference}</strong> pour tout échange avec nos conseillers.
    </p>
  `);
  await send(to, `[CapSubvention] Dossier ${reference} soumis — Accusé de réception`, html, () => {
    console.log(`  Destinataire : ${to}  |  Dossier : ${reference}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ADMIN — Changement de statut
// ─────────────────────────────────────────────────────────────────────────────

const statutMessages: Record<string, { title: string; intro: string; emoji: string }> = {
  en_instruction: {
    emoji: "🔍",
    title: "Votre dossier est en cours d'instruction",
    intro: "Nos conseillers procèdent à la vérification administrative et réglementaire de votre dossier.",
  },
  expertise: {
    emoji: "📋",
    title: "Votre dossier est en phase d'expertise",
    intro: "Votre dossier fait l'objet d'une évaluation technique et financière approfondie par nos experts.",
  },
  valide: {
    emoji: "🎉",
    title: "Félicitations — Votre dossier a été validé !",
    intro: "Votre projet a été retenu par le comité de financement. Nos conseillers vous contacteront prochainement pour les modalités de versement.",
  },
  rejete: {
    emoji: "❌",
    title: "Décision concernant votre dossier",
    intro: "Après examen de votre dossier, le comité de financement n'a pas pu donner une suite favorable à votre demande.",
  },
  verse: {
    emoji: "💰",
    title: "Versement de votre subvention effectué",
    intro: "Nous avons le plaisir de vous informer que le versement de votre subvention a été effectué.",
  },
};

export async function sendStatutChange(opts: {
  to: string; prenom: string; reference: string; titre: string;
  statut: string; commentaire?: string;
}) {
  const { to, prenom, reference, titre, statut, commentaire } = opts;
  const info = statutMessages[statut] ?? {
    emoji: "📌",
    title: `Statut de votre dossier mis à jour`,
    intro: `Le statut de votre dossier a été mis à jour.`,
  };
  const badge = statusBadge(statut);

  const html = layout(`${info.emoji} ${info.title} — CapSubvention`, `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Mise à jour de dossier</p>
    <h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">${info.emoji} ${info.title}</h1>
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">
      Bonjour ${prenom}, ${info.intro}
    </p>
    <table style="width:100%;background:#F8F9FC;border:1px solid #EEF0F7;border-radius:12px;padding:16px;margin-bottom:20px;" cellpadding="8">
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;width:40%;">Référence</td><td style="color:#0D1F3C;font-size:14px;font-weight:800;font-family:monospace;">${reference}</td></tr>
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;">Projet</td><td style="color:#0D1F3C;font-size:13px;">${titre}</td></tr>
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;">Nouveau statut</td>
          <td><span style="background:${badge.bg};color:${badge.color};padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">${badge.label}</span></td></tr>
    </table>
    ${commentaire ? `
    <div style="background:#F8F9FC;border-left:4px solid #B5872A;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0 0 4px;color:#8B9BB4;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;">Message de votre conseiller</p>
      <p style="margin:0;color:#0D1F3C;font-size:14px;line-height:1.6;">${commentaire}</p>
    </div>` : ""}
    ${infoBanner("Connectez-vous à votre espace CapSubvention pour consulter le détail complet de votre dossier.")}
  `);
  await send(to, `[CapSubvention] Dossier ${reference} — ${info.title}`, html, () => {
    console.log(`  Destinataire : ${to}  |  Dossier : ${reference}  |  Statut → ${statut}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ADMIN — Émission de frais (456€ TTC)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendFraisEmis(opts: {
  to: string; prenom: string; reference: string; dossierRef: string;
  montantTTC: number; echeance: Date;
}) {
  const { to, prenom, reference, dossierRef, montantTTC, echeance } = opts;
  const dateStr = echeance.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const html = layout("Frais d'instruction émis — CapSubvention", `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Frais d'instruction</p>
    <h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">Appel de frais — ${reference}</h1>
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">
      Bonjour ${prenom}, conformément à l'article L1611-2 du Code Général des Collectivités Territoriales,
      des frais d'instruction ont été émis pour votre dossier <strong>${dossierRef}</strong>.
    </p>
    <table style="width:100%;background:#F8F9FC;border:2px solid #DDE2EC;border-radius:12px;padding:16px;margin-bottom:20px;" cellpadding="8">
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;width:50%;">Référence de facturation</td>
          <td style="color:#0D1F3C;font-size:14px;font-weight:800;font-family:monospace;">${reference}</td></tr>
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;">Dossier concerné</td>
          <td style="color:#0D1F3C;font-size:13px;font-family:monospace;">${dossierRef}</td></tr>
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;">Montant TTC</td>
          <td style="color:#0D1F3C;font-size:20px;font-weight:900;">${montantTTC.toFixed(2)} €</td></tr>
      <tr><td style="color:#8B9BB4;font-size:12px;font-weight:700;">Échéance de règlement</td>
          <td style="color:#DC2626;font-size:13px;font-weight:700;">${dateStr}</td></tr>
    </table>
    ${warningBanner(`Le règlement doit être effectué avant le ${dateStr} depuis votre espace CapSubvention pour ne pas suspendre l'instruction de votre dossier.`)}
  `);
  await send(to, `[CapSubvention] Frais d'instruction ${reference} — ${montantTTC.toFixed(2)}€ TTC`, html, () => {
    console.log(`  Destinataire : ${to}  |  Frais : ${reference}  |  Montant : ${montantTTC}€ TTC`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MESSAGE — Nouveau message d'un conseiller
// ─────────────────────────────────────────────────────────────────────────────

export async function sendNewMessageNotification(opts: {
  to: string; prenom: string; dossierRef: string; extrait: string;
}) {
  const { to, prenom, dossierRef, extrait } = opts;
  const html = layout("Nouveau message de votre conseiller — CapSubvention", `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Messagerie</p>
    <h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">💬 Nouveau message reçu</h1>
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">
      Bonjour ${prenom}, votre conseiller CapSubvention vous a adressé un message concernant le dossier
      <strong style="font-family:monospace;">${dossierRef}</strong>.
    </p>
    <div style="background:#F8F9FC;border-left:4px solid #0D1F3C;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;color:#8B9BB4;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;">Extrait du message</p>
      <p style="margin:0;color:#0D1F3C;font-size:14px;line-height:1.6;font-style:italic;">"${extrait.length > 200 ? extrait.slice(0, 200) + "…" : extrait}"</p>
    </div>
    ${infoBanner("Connectez-vous à votre espace pour lire le message complet et répondre à votre conseiller.")}
  `);
  await send(to, `[CapSubvention] Nouveau message — Dossier ${dossierRef}`, html, () => {
    console.log(`  Destinataire : ${to}  |  Dossier : ${dossierRef}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MOT DE PASSE — Réinitialisation
// ─────────────────────────────────────────────────────────────────────────────

export async function sendPasswordReset(opts: {
  to: string; prenom: string; resetUrl: string;
}) {
  const { to, prenom, resetUrl } = opts;
  const html = layout("Réinitialisation de votre mot de passe — CapSubvention", `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Sécurité du compte</p>
    <h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">🔐 Réinitialisation du mot de passe</h1>
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">
      Bonjour ${prenom}, nous avons reçu une demande de réinitialisation du mot de passe associé à votre compte CapSubvention.
    </p>
    <p style="margin:0 0 16px;color:#4B5574;font-size:14px;line-height:1.7;">
      Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien est valable <strong>1 heure</strong>.
    </p>
    ${ctaButton("Réinitialiser mon mot de passe", resetUrl)}
    ${warningBanner("Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. Votre mot de passe ne sera pas modifié. Ne partagez jamais ce lien.")}
    <p style="margin:16px 0 0;color:#8B9BB4;font-size:12px;line-height:1.6;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
      <a href="${resetUrl}" style="color:#B5872A;word-break:break-all;font-size:11px;">${resetUrl}</a>
    </p>
  `);
  await send(to, `[CapSubvention] Réinitialisation de votre mot de passe`, html, () => {
    console.log(`  Destinataire : ${to}`);
    console.log(`  Prénom       : ${prenom}`);
    console.log(`  Lien         : ${resetUrl}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DOCUMENT — Demande de pièces complémentaires
// ─────────────────────────────────────────────────────────────────────────────

export async function sendDemandeDocuments(opts: {
  to: string; prenom: string; reference: string; documents: string[];
}) {
  const { to, prenom, reference, documents } = opts;
  const listItems = documents.map(d => `<li style="padding:4px 0;color:#0D1F3C;font-size:13px;">📎 ${d}</li>`).join("");
  const html = layout("Pièces complémentaires requises — CapSubvention", `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Documents manquants</p>
    <h1 style="margin:0 0 16px;color:#0D1F3C;font-size:20px;font-weight:800;">📂 Documents complémentaires requis</h1>
    <p style="margin:0 0 20px;color:#4B5574;font-size:14px;line-height:1.7;">
      Bonjour ${prenom}, dans le cadre de l'instruction de votre dossier <strong style="font-family:monospace;">${reference}</strong>,
      nos conseillers ont besoin des pièces complémentaires suivantes :
    </p>
    <ul style="background:#F8F9FC;border:1px solid #EEF0F7;border-radius:12px;padding:16px 20px 16px 36px;margin:0 0 20px;">
      ${listItems}
    </ul>
    ${warningBanner("Merci de déposer ces documents dans votre espace CapSubvention dans les meilleurs délais pour ne pas retarder l'instruction de votre dossier.")}
  `);
  await send(to, `[CapSubvention] Documents requis — Dossier ${reference}`, html, () => {
    console.log(`  Destinataire : ${to}  |  Dossier : ${reference}  |  Docs : ${documents.join(", ")}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. BROADCAST — Notification admin groupée
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBroadcast(opts: {
  to: string; prenom: string; sujet: string; contenu: string;
}) {
  const { to, prenom, sujet, contenu } = opts;
  const html = layout(`${sujet} — CapSubvention`, `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Information importante</p>
    <h1 style="margin:0 0 20px;color:#0D1F3C;font-size:20px;font-weight:800;">${sujet}</h1>
    <p style="margin:0 0 8px;color:#4B5574;font-size:14px;line-height:1.7;">Bonjour ${prenom},</p>
    <div style="color:#4B5574;font-size:14px;line-height:1.7;margin-bottom:20px;">${contenu.replace(/\n/g, "<br/>")}</div>
    ${infoBanner("Pour toute question, contactez nos conseillers via votre espace CapSubvention.")}
  `);
  await send(to, `[CapSubvention] ${sujet}`, html, () => {
    console.log(`  Destinataire : ${to}  |  Sujet : ${sujet}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. PHASE ACTION — Notification de progression du dossier
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, { sujet: string; titre: string; corps: string; cta: string }> = {
  accuser_reception: {
    sujet: "Votre dossier a bien été reçu",
    titre: "Accusé de réception officiel",
    corps: "Votre demande de financement non remboursable a bien été prise en charge par nos équipes. Un accusé de réception officiel est disponible dans votre espace personnel.",
    cta: "Consulter mon dossier",
  },
  envoyer_eligibilite: {
    sujet: "Résultat d'éligibilité — Décision favorable",
    titre: "Votre dossier est éligible",
    corps: "Après analyse de votre dossier, nos équipes ont rendu une décision d'éligibilité favorable. Le rapport d'éligibilité et la fiche de renseignements complémentaires sont disponibles dans votre espace. Veuillez compléter et retourner la fiche signée.",
    cta: "Accéder à mes documents",
  },
  envoyer_contrat: {
    sujet: "Votre contrat de mission est prêt",
    titre: "Contrat de mission à signer",
    corps: "Votre contrat de mission de conseil en financement public est disponible dans votre espace personnel. Veuillez le télécharger, le signer et le retourner signé à votre conseiller afin que la constitution de votre dossier puisse débuter.",
    cta: "Télécharger mon contrat",
  },
  marquer_signe: {
    sujet: "Contrat reçu — Constitution du dossier en cours",
    titre: "Dossier en cours de constitution",
    corps: "Votre contrat de mission a bien été réceptionné par nos équipes. La constitution de votre dossier de demande de financement est désormais en cours. Vous serez informé de toute évolution.",
    cta: "Suivre mon dossier",
  },
  marquer_favorable: {
    sujet: "Décision favorable — Subvention accordée",
    titre: "Bonne nouvelle : votre financement est accordé",
    corps: "Nous avons le plaisir de vous informer qu'une décision favorable a été rendue pour votre dossier. La notification d'attribution officielle est disponible dans votre espace. Les frais d'instruction CapSubvention (456 € TTC) sont désormais exigibles.",
    cta: "Consulter la notification",
  },
  confirmer_paiement: {
    sujet: "Paiement confirmé — Mission clôturée",
    titre: "Votre paiement a été enregistré",
    corps: "Votre règlement des frais d'instruction a bien été enregistré. Votre dossier est désormais clôturé et votre facture officielle est disponible dans votre espace personnel. Merci de votre confiance.",
    cta: "Télécharger ma facture",
  },
};

export async function sendPhaseAction(opts: {
  to: string; prenom: string; action: string; reference: string; note?: string;
}) {
  const { to, prenom, action, reference, note } = opts;
  const cfg = PHASE_LABELS[action];
  if (!cfg) return;

  const html = layout(`${cfg.sujet} — CapSubvention`, `
    <p style="margin:0 0 8px;color:#6B7896;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Mise à jour dossier ${reference}</p>
    <h1 style="margin:0 0 20px;color:#0D1F3C;font-size:20px;font-weight:800;">${cfg.titre}</h1>
    <p style="margin:0 0 8px;color:#4B5574;font-size:14px;line-height:1.7;">Bonjour ${prenom},</p>
    <p style="color:#4B5574;font-size:14px;line-height:1.7;margin-bottom:20px;">${cfg.corps}</p>
    ${note ? `<div style="background:#F4F6FB;border-left:4px solid #B5872A;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:20px;"><p style="margin:0;color:#7A5A2A;font-size:13px;font-weight:700;">Note de votre conseiller :</p><p style="margin:6px 0 0;color:#4B5574;font-size:13px;line-height:1.7;">${note}</p></div>` : ""}
    <div style="text-align:center;margin:24px 0;">
      <a href="https://www.capsubvention.com/dashboard" style="display:inline-block;background:#0D1F3C;color:#FFFFFF;font-size:14px;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">${cfg.cta}</a>
    </div>
    ${infoBanner("Pour toute question, contactez votre conseiller via la messagerie de votre espace CapSubvention.")}
  `);

  await send(to, `[CapSubvention] ${cfg.sujet} — Réf. ${reference}`, html, () => {
    console.log(`  Phase action : ${action}  |  Destinataire : ${to}`);
  });
}
