import React from "react";
import i18n from "@/i18n";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export interface AcknowledgementReceiptProps {
  reference: string;
  dateEmission: string;
  porteur: string;
  territoire: string;
  dispositif: string;
  secteur: string;
  montantDemande: string;
  dateDepot?: string;
  delaiTraitement?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  statut?: string;
  nextSteps?: string[];
  lang?: string;
}

/* ─── Palette ────────────────────────────────────────────────────────────────── */
const NAVY   = "#0B1F4D";
const GOLD   = "#C9993A";
const GREEN  = "#16A34A";
const LGRAY  = "#F5F5F5";
const BGRAY  = "#E5E7EB";
const MGRAY  = "#9CA3AF";
const DGRAY  = "#374151";

/* ─── Logo ───────────────────────────────────────────────────────────────────── */
function CLogoSquare({ size = 32 }: { size?: number; bg?: string; fg?: string }) {
  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    return { cx: +(50 + 40 * Math.cos(angle)).toFixed(2), cy: +(50 + 40 * Math.sin(angle)).toFixed(2) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#0D1F3C" />
      {dots.map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r="3.5" fill="#FFD500" opacity="0.85" />)}
      <circle cx="50" cy="50" r="30" fill="#162B52" />
      <text x="50" y="65" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="40" fill="#FFD500">F</text>
    </svg>
  );
}

/* ─── Row icons (outline style) ─────────────────────────────────────────────── */
function IconTag() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 7c0-1.1.9-2 2-2h5.6c.5 0 1 .2 1.4.6l6.4 6.4c.8.8.8 2 0 2.8l-5.6 5.6c-.8.8-2 .8-2.8 0L3.6 14c-.4-.4-.6-.9-.6-1.4V7z" stroke={MGRAY} strokeWidth="1.5"/><circle cx="9" cy="9" r="1.5" fill={MGRAY}/></svg>;
}
function IconPerson() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={MGRAY} strokeWidth="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IconPin() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.7 2 6 4.7 6 8c0 5 6 13 6 13s6-8 6-13c0-3.3-2.7-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" stroke={MGRAY} strokeWidth="1.5" fill="none"/></svg>;
}
function IconGrid() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke={MGRAY} strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke={MGRAY} strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke={MGRAY} strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke={MGRAY} strokeWidth="1.5"/></svg>;
}
function IconChart() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="12" width="4" height="9" rx="0.5" stroke={MGRAY} strokeWidth="1.5"/><rect x="10" y="7" width="4" height="14" rx="0.5" stroke={MGRAY} strokeWidth="1.5"/><rect x="17" y="3" width="4" height="18" rx="0.5" stroke={MGRAY} strokeWidth="1.5"/></svg>;
}
function IconEuro() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={MGRAY} strokeWidth="1.5"/><path d="M14.5 8.5C13.7 7.6 12.9 7 12 7c-2.2 0-4 2.2-4 5s1.8 5 4 5c.9 0 1.7-.5 2.5-1.4M7 11h5M7 13h5" stroke={MGRAY} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IconCalendar() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke={MGRAY} strokeWidth="1.5"/><path d="M3 9h18M8 2v4M16 2v4" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IconClock() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={MGRAY} strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IconMail() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke={MGRAY} strokeWidth="1.5"/><path d="M3 7l9 7 9-7" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IconLock() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke={MGRAY} strokeWidth="1.5"/><path d="M8 11V7a4 4 0 018 0v4" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IconInfo() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill={GREEN}/><path d="M12 11v5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="8" r="0.8" fill="#fff" stroke="#fff" strokeWidth="0.4"/></svg>;
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────────── */

export function AcknowledgementReceipt({
  reference,
  dateEmission,
  porteur,
  territoire,
  dispositif,
  secteur,
  montantDemande,
  dateDepot,
  delaiTraitement,
  contactEmail    = "support@fede-financement.com",
  contactPhone    = "+33 (0) 800 123 456",
  contactWebsite  = "www.fede-financement.com",
  statut,
  nextSteps,
  lang,
}: AcknowledgementReceiptProps) {
  const T = (key: string, opts?: object) => i18n.t(key, { lng: lang || i18n.language || 'fr', ...opts });

  const resolvedDelai = delaiTraitement ?? T('docs.accuse.delai_default');
  const resolvedStatut = statut ?? T('docs.accuse.statut_default');
  const resolvedSteps = nextSteps ?? [
    T('docs.accuse.step1'),
    T('docs.accuse.step2'),
    T('docs.accuse.step3'),
  ];

  const rows = [
    { icon: <IconTag />,      label: T('docs.common.ref_dossier'),  value: reference,       bold: true },
    { icon: <IconPerson />,   label: T('docs.common.porteur'),      value: porteur,         bold: true },
    { icon: <IconPin />,      label: T('docs.common.territoire'),   value: territoire,      bold: false },
    { icon: <IconGrid />,     label: T('docs.common.dispositif'),   value: dispositif,      bold: false },
    { icon: <IconChart />,    label: T('docs.common.secteur'),      value: secteur,         bold: true },
    { icon: <IconEuro />,     label: T('docs.common.montant'),      value: montantDemande,  bold: true },
    { icon: <IconCalendar />, label: T('docs.common.date_depot'),   value: dateDepot || dateEmission, bold: false },
  ];

  return (
    <div style={{
      width: 794,
      minHeight: 1123,
      background: "#fff",
      fontFamily: "'Inter', sans-serif",
      fontSize: 10,
      color: NAVY,
      boxShadow: "0 4px 40px rgba(11,31,77,0.13), 0 1px 4px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── HEADER ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px 16px",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <CLogoSquare size={38} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: NAVY, lineHeight: 1.1 }}>FEDE</div>
            <div style={{ fontWeight: 600, fontSize: 7, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase" as const }}>{T('docs.common.slogan')}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ textAlign: "right", paddingRight: 20 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 3 }}>{T('docs.common.ref_dossier')}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, letterSpacing: "0.03em" }}>{reference}</div>
          </div>
          <div style={{ width: 1, height: 34, background: BGRAY, flexShrink: 0 }} />
          <div style={{ textAlign: "left", paddingLeft: 20 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 3 }}>{T('docs.common.date_emission')}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{dateEmission}</div>
          </div>
        </div>
      </header>

      {/* Gold line */}
      <div style={{ height: 2, background: GOLD, flexShrink: 0 }} />

      {/* ── TITLE — centered ── */}
      <div style={{ textAlign: "center", padding: "44px 40px 32px", flexShrink: 0 }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 40, fontWeight: 700, color: NAVY,
          margin: "0 0 10px", lineHeight: 1.1,
        }}>
          {T('docs.accuse.title')}
        </h1>
        <p style={{ fontSize: 12, color: MGRAY, margin: 0, fontWeight: 400 }}>
          {T('docs.accuse.subtitle')}
        </p>
      </div>

      {/* ── DOSSIER ENREGISTRÉ card ── */}
      <div style={{ padding: "0 40px 28px", flexShrink: 0 }}>
        <div style={{
          border: `1.5px solid ${BGRAY}`, borderRadius: 8,
          padding: "20px 24px",
          display: "flex", alignItems: "flex-start", gap: 20,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%", background: GREEN,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5L9.5 17L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontSize: 13, fontWeight: 800, color: GREEN,
              letterSpacing: "0.05em", textTransform: "uppercase" as const,
              marginBottom: 8,
            }}>
              {T('docs.accuse.status_registered')}
            </div>
            <p style={{ fontSize: 10, color: DGRAY, margin: 0, lineHeight: 1.7 }}>
              {T('docs.accuse.body1')}<br />
              {T('docs.accuse.body2')}
            </p>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN SECTION ── */}
      <div style={{ padding: "0 40px 24px", display: "flex", gap: 20, flexShrink: 0 }}>

        {/* LEFT — Récapitulatif */}
        <div style={{ flex: "0 0 310px" }}>
          <div style={{
            fontSize: 8.5, fontWeight: 800, color: NAVY,
            letterSpacing: "0.1em", textTransform: "uppercase" as const,
            marginBottom: 12,
          }}>
            {T('docs.accuse.recap_title')}
          </div>
          <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, overflow: "hidden" }}>
            {rows.map((row, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center",
                padding: "9px 14px",
                borderBottom: i < rows.length - 1 ? `1px solid ${LGRAY}` : "none",
                gap: 10,
              }}>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{row.icon}</div>
                <div style={{ fontSize: 9, color: MGRAY, width: 110, flexShrink: 0 }}>{row.label}</div>
                <div style={{
                  fontSize: 10, color: NAVY,
                  fontWeight: row.bold ? 700 : 500,
                  flex: 1,
                }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Délai + Prochaines étapes */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Délai de traitement estimé */}
          <div>
            <div style={{
              fontSize: 8.5, fontWeight: 800, color: NAVY,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              marginBottom: 12,
            }}>
              {T('docs.accuse.delay_title')}
            </div>
            <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, overflow: "hidden" }}>
              {[
                { icon: <IconClock />,  label: T('docs.accuse.delay_label'),   value: resolvedDelai },
                { icon: <IconPerson />, label: T('docs.accuse.advisor_label'),  value: T('docs.accuse.advisor_pending') },
                { icon: <IconMail />,   label: T('docs.accuse.contact_label'),  value: contactEmail },
              ].map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", padding: "9px 14px",
                  borderBottom: i < 2 ? `1px solid ${LGRAY}` : "none",
                  gap: 10,
                }}>
                  <div style={{ flexShrink: 0 }}>{r.icon}</div>
                  <div style={{ fontSize: 9, color: MGRAY, flex: "0 0 110px" }}>{r.label}</div>
                  <div style={{ fontSize: 9.5, color: NAVY, fontWeight: 600, flex: 1 }}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prochaines étapes */}
          <div>
            <div style={{
              fontSize: 8.5, fontWeight: 800, color: NAVY,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              marginBottom: 10,
            }}>
              {T('docs.accuse.next_steps_title')}
            </div>
            <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {resolvedSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", background: GREEN,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "#fff" }}>{i + 1}</span>
                  </div>
                  <p style={{ fontSize: 9, color: DGRAY, margin: 0, lineHeight: 1.6 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── STATUT DU DOSSIER bar ── */}
      <div style={{ padding: "0 40px 16px", flexShrink: 0 }}>
        <div style={{
          border: `1.5px solid ${BGRAY}`, borderRadius: 6,
          display: "flex", alignItems: "center",
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "14px 20px", flex: 1,
          }}>
            <span style={{
              fontSize: 8.5, fontWeight: 800, color: NAVY,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
            }}>
              {T('docs.accuse.statut_label')}
            </span>
            <span style={{
              background: GREEN, color: "#fff",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
              padding: "4px 12px", borderRadius: 4,
              textTransform: "uppercase" as const,
            }}>
              {resolvedStatut}
            </span>
          </div>
          <div style={{ width: 1, alignSelf: "stretch", background: BGRAY, flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", flex: 1 }}>
            <IconLock />
            <p style={{ fontSize: 8.5, color: DGRAY, margin: 0, lineHeight: 1.5 }}>
              {T('docs.accuse.notifications')}
            </p>
          </div>
        </div>
      </div>

      {/* ── INFO BAR ── */}
      <div style={{ padding: "0 40px 20px", flexShrink: 0 }}>
        <div style={{
          background: "#F0FDF4", border: `1px solid #BBF7D0`,
          borderRadius: 6, padding: "10px 18px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <IconInfo />
          <span style={{ fontSize: 9.5, color: "#166534" }}>
            {T('docs.accuse.registered_note')} <strong>{reference}</strong>
          </span>
        </div>
      </div>

      {/* ── AUTO-GEN NOTE ── */}
      <div style={{
        textAlign: "center", padding: "4px 40px 0",
        flexShrink: 0,
      }}>
        <p style={{ fontSize: 9, color: MGRAY, margin: "0 0 10px", lineHeight: 1.7 }}>
          {T('docs.common.auto_generated', { date: dateEmission })}
        </p>
        <div style={{ width: 36, height: 2, background: GOLD, borderRadius: 2, margin: "0 auto" }} />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ── FOOTER (dark navy) ── */}
      <footer style={{
        background: NAVY, padding: "0 36px",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 0 12px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CLogoSquare size={24} bg={GOLD} fg={NAVY} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {[
              { sym: "✉", val: contactEmail },
              { sym: "☎", val: contactPhone },
              { sym: "⊕", val: contactWebsite },
            ].map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>|</span>}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{c.sym}</span>
                  <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.7)" }}>{c.val}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{ width: 24 }} />
        </div>
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.35)" }}>{T('docs.common.rgpd')} &nbsp;|&nbsp; © 2026 FEDE</span>
        </div>
      </footer>
    </div>
  );
}
