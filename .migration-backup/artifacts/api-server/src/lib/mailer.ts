import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? "CapSubvention <noreply@capsubvention.com>";

function isSmtpConfigured() {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function createTransport() {
  if (!isSmtpConfigured()) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendVerificationCode(opts: {
  to: string;
  prenom: string;
  code: string;
  ipAddress: string;
}): Promise<void> {
  const { to, prenom, code, ipAddress } = opts;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#F1F4FA;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F4FA;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,31,60,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0D1F3C 0%,#1A3561 100%);padding:32px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="width:52px;height:52px;border-radius:26px;background:#B5872A;text-align:center;vertical-align:middle;">
                  <span style="color:#0D1F3C;font-size:20px;font-weight:900;letter-spacing:-1px;">CS</span>
                </td>
                <td style="padding-left:14px;text-align:left;">
                  <div style="color:#FFFFFF;font-size:18px;font-weight:800;line-height:1.2;">CapSubvention</div>
                  <div style="color:rgba(255,255,255,0.45);font-size:11px;">Plateforme officielle de financements publics</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;color:#6B7896;font-size:13px;text-transform:uppercase;letter-spacing:0.7px;font-weight:700;">Vérification de connexion</p>
            <h1 style="margin:0 0 20px;color:#0D1F3C;font-size:22px;font-weight:800;">Bonjour ${prenom},</h1>
            <p style="margin:0 0 24px;color:#4B5574;font-size:14px;line-height:1.7;">
              Une tentative de connexion à votre espace CapSubvention a été détectée depuis une
              <strong style="color:#0D1F3C;">adresse IP différente</strong>. Pour confirmer qu'il s'agit bien de vous,
              utilisez le code ci-dessous.
            </p>

            <!-- Code block -->
            <div style="background:#F8F9FC;border:2px solid #DDE2EC;border-radius:14px;padding:28px;text-align:center;margin:0 0 24px;">
              <p style="margin:0 0 10px;color:#8B9BB4;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Votre code de vérification</p>
              <div style="font-size:40px;font-weight:900;letter-spacing:8px;color:#0D1F3C;font-family:'Courier New',monospace;">${code}</div>
              <p style="margin:10px 0 0;color:#DC2626;font-size:12px;font-weight:600;">⏱ Valide 5 minutes uniquement</p>
            </div>

            <!-- IP info -->
            <div style="background:#FFF8F0;border:1px solid #F0D9A8;border-radius:10px;padding:14px 18px;margin:0 0 28px;">
              <p style="margin:0;color:#92400E;font-size:12px;line-height:1.6;">
                <strong>📍 IP détectée :</strong> ${ipAddress}<br/>
                Si vous n'êtes pas à l'origine de cette connexion, ignorez ce message — votre compte reste protégé.
              </p>
            </div>

            <p style="margin:0;color:#8B9BB4;font-size:12px;line-height:1.6;">
              Ne partagez jamais ce code. CapSubvention ne vous le demandera jamais par téléphone ou SMS.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8F9FC;border-top:1px solid #EEF0F7;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#B0BAD0;font-size:10px;line-height:1.6;">
              CapSubvention · Article L1611-2 CGCT · Données RGPD · Hébergement France<br/>
              © 2025 CapSubvention — support@capsubvention.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  const transport = createTransport();

  if (!transport) {
    // SMTP not configured — log to console for development
    console.log(`
╔══════════════════════════════════════════╗
║     CODE DE VÉRIFICATION CAPSUBVENTION   ║
╠══════════════════════════════════════════╣
║  Destinataire : ${to.padEnd(24)}║
║  Prénom       : ${prenom.padEnd(24)}║
║  Code         : ${code.padEnd(24)}║
║  IP           : ${ipAddress.padEnd(24)}║
║  Expire dans  : 5 minutes                ║
╚══════════════════════════════════════════╝
    `);
    return;
  }

  await transport.sendMail({
    from: SMTP_FROM,
    to,
    subject: `[CapSubvention] Code de vérification : ${code}`,
    html,
  });
}
