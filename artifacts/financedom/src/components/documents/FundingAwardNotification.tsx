import React from "react";
import i18n from "@/i18n";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export interface FundingAwardNotificationProps {
  reference: string;
  dateDecision: string;
  porteur: string;
  territoire: string;
  dispositif: string;
  nomProjet: string;
  montantAttribue: string;
  honorairesTTC?: string;
  honorairesHT?: string;
  tvaPct?: number;
  obligations?: string[];
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  lang?: string;
}

/* ─── Palette ────────────────────────────────────────────────────────────────── */
const NAVY  = "#0B1F4D";
const GOLD  = "#C9993A";
const GREEN = "#16A34A";
const BGRAY = "#E5E7EB";
const MGRAY = "#9CA3AF";
const DGRAY = "#374151";
const LGRAY = "#F9FAFB";

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

/* ─── Icon circles ───────────────────────────────────────────────────────────── */
function IconCircle({ size = 42, bg, children }: { size?: number; bg: string; children: React.ReactNode }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </div>
  );
}

/* ─── SVG icons ──────────────────────────────────────────────────────────────── */
function IcCheck({ size = 22 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9 17.5L20 6.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcPerson({ c = MGRAY }: { c?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcPin({ c = MGRAY }: { c?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.7 2 6 4.7 6 8c0 5 6 13 6 13s6-8 6-13c0-3.3-2.7-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" stroke={c} strokeWidth="1.5" fill="none"/></svg>;
}
function IcBuilding({ c = MGRAY }: { c?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="1" stroke={c} strokeWidth="1.5"/><path d="M9 21V12h6v9" stroke={c} strokeWidth="1.5"/><rect x="7" y="7" width="3" height="3" rx="0.5" stroke={c} strokeWidth="1.5"/><rect x="14" y="7" width="3" height="3" rx="0.5" stroke={c} strokeWidth="1.5"/></svg>;
}
function IcFolder({ c = MGRAY }: { c?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 7c0-1.1.9-2 2-2h4l2 2h8c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z" stroke={c} strokeWidth="1.5" fill="none"/></svg>;
}
function IcRef({ c = MGRAY }: { c?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke={c} strokeWidth="1.5"/><path d="M9 8h6M9 12h6M9 16h4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcEuroCircle({ c = MGRAY }: { c?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5"/><path d="M14.5 8.5C13.7 7.6 12.9 7 12 7c-2.2 0-4 2.2-4 5s1.8 5 4 5c.9 0 1.7-.5 2.5-1.4M7 11h5M7 13h5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IcScales() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 6l9-3 9 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/><path d="M6 9l-3 7h6l-3-7zM18 9l-3 7h6l-3-7z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
}
function IcCalendarCheck() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="#fff" strokeWidth="1.6"/><path d="M3 9h18M8 2v4M16 2v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/><path d="M8 14l2.5 2.5L16 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcEuroDoc() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 3v5h5" stroke="#fff" strokeWidth="1.6"/><path d="M13.5 13.5C12.9 12.6 12.2 12 11.5 12c-1.7 0-3 1.6-3 3.5s1.3 3.5 3 3.5c.7 0 1.4-.4 2-1.1M9 14.5h3M9 16h3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────────── */

export function FundingAwardNotification({
  reference,
  dateDecision,
  porteur,
  territoire,
  dispositif,
  nomProjet,
  montantAttribue,
  honorairesTTC  = "456,00 € TTC",
  honorairesHT   = "380,00 € HT + TVA 20 %",
  obligations,
  contactEmail   = "support@fede-financement.com",
  contactPhone   = "+33 (0) 800 123 456",
  contactWebsite = "www.fede-financement.com",
  lang,
}: FundingAwardNotificationProps) {
  const T = (key: string) => i18n.t(key, { lng: lang || i18n.language || 'fr' });

  const resolvedObligations = obligations ?? [
    T('docs.notification.obl1'),
    T('docs.notification.obl2'),
    T('docs.notification.obl3'),
    T('docs.notification.obl4'),
  ];

  const summaryItems = [
    { icon: <IcPerson />,      label: T('docs.notification.beneficiaire'),  value: porteur,         hero: false },
    { icon: <IcPin />,         label: T('docs.common.territoire'),          value: territoire,      hero: false },
    { icon: <IcBuilding />,    label: T('docs.notification.dispositif'),    value: dispositif,      hero: false },
    { icon: <IcFolder />,      label: T('docs.notification.projet'),        value: nomProjet,       hero: false },
    { icon: <IcRef />,         label: T('docs.notification.reference'),     value: reference,       hero: false },
    { icon: <IcEuroCircle />,  label: T('docs.notification.montant_attribue'), value: montantAttribue, hero: true },
  ];

  return (
    <div style={{
      width: 794, minHeight: 1123, background: "#fff",
      fontFamily: "'Inter', sans-serif", fontSize: 10, color: NAVY,
      boxShadow: "0 4px 40px rgba(11,31,77,0.13), 0 1px 4px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── HEADER ── */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 36px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <CLogoSquare size={38} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: NAVY, lineHeight: 1.1 }}>FEDE</div>
            <div style={{ fontWeight: 600, fontSize: 7, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase" as const }}>{T('docs.common.slogan')}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ textAlign: "right", paddingRight: 18 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 3 }}>{T('docs.common.ref_dossier')}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, letterSpacing: "0.03em" }}>{reference}</div>
          </div>
          <div style={{ width: 1, height: 34, background: BGRAY }} />
          <div style={{ textAlign: "left", paddingLeft: 18 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 3 }}>{T('docs.notification.date_decision')}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{dateDecision}</div>
          </div>
        </div>
      </header>
      <div style={{ height: 2, background: GOLD, flexShrink: 0 }} />

      {/* ── TITLE ZONE ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 22, padding: "24px 36px 20px", borderBottom: `1px solid ${BGRAY}` }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: NAVY, lineHeight: 1.1, margin: "0 0 6px" }}>
            {T('docs.notification.title')}
          </h1>
          <div style={{ fontSize: 10, color: MGRAY, marginBottom: 14 }}>{T('docs.notification.subtitle')}</div>
          <p style={{ fontSize: 9.5, color: DGRAY, lineHeight: 1.7, margin: 0, maxWidth: 380 }}>
            {T('docs.notification.body')}
          </p>
        </div>
        <div style={{ width: 195, border: `1.5px solid ${BGRAY}`, borderRadius: 8, padding: "20px 18px", textAlign: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <IconCircle size={46} bg={GREEN}>
              <IcCheck size={22} />
            </IconCircle>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: GREEN, letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 4 }}>
            {T('docs.notification.decision_label')}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 10 }}>{T('docs.notification.subvention')}</div>
          <div style={{ height: 1, background: BGRAY, marginBottom: 10 }} />
          <div style={{ fontSize: 9.5, color: DGRAY }}>
            {nomProjet} — {territoire}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, padding: "20px 36px 0" }}>

        {/* ── RÉCAPITULATIF ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 8.5, fontWeight: 800, color: NAVY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>
            {T('docs.notification.recap_title')}
          </div>
          <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, display: "flex", overflow: "hidden" }}>
            {summaryItems.map((item, i) => (
              <div key={i} style={{
                flex: item.hero ? "0 0 150px" : 1,
                padding: "14px 10px",
                borderRight: i < summaryItems.length - 1 ? `1px solid ${BGRAY}` : "none",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                background: item.hero ? "#FAFAFA" : "#fff",
              }}>
                <div style={{ marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 7, fontWeight: 700, color: MGRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: item.hero ? "'Playfair Display', serif" : "'Inter', sans-serif",
                  fontSize: item.hero ? 18 : 11,
                  fontWeight: 700,
                  color: NAVY,
                  lineHeight: 1.1,
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <div style={{ width: 36, height: 2, background: GOLD, borderRadius: 2 }} />
          </div>
        </div>

        {/* ── OBLIGATIONS ── */}
        <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
            <IconCircle size={42} bg={GREEN}>
              <IcCalendarCheck />
            </IconCircle>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#065F46", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 3 }}>
                {T('docs.notification.obligations_title')}
              </div>
              <div style={{ fontSize: 9, color: DGRAY }}>{T('docs.notification.obligations_intro')}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            {resolvedObligations.map((ob, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", background: GREEN,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 8, color: DGRAY, margin: 0, lineHeight: 1.6 }}>{ob}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FRAIS D'INSTRUCTION ── */}
        <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
            <IconCircle size={42} bg={GOLD}>
              <IcEuroDoc />
            </IconCircle>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#92400E", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 3 }}>
                {T('docs.notification.frais_title')}
              </div>
              <div style={{ fontSize: 9, color: DGRAY, marginBottom: 10 }}>
                {T('docs.notification.frais_body')}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: GOLD }}>
                  {honorairesTTC}
                </span>
                <div style={{ width: 1, height: 24, background: BGRAY }} />
                <span style={{ fontSize: 9.5, color: MGRAY }}>({honorairesHT})</span>
              </div>
              <div style={{ fontSize: 8.5, color: MGRAY, lineHeight: 1.6 }}>
                {T('docs.notification.frais_legal')}<br />
                {T('docs.notification.frais_modal')}
              </div>
            </div>
          </div>
        </div>

        {/* ── VOIES ET DÉLAIS DE RECOURS ── */}
        <div style={{ border: `1px solid #C7D2FE`, borderRadius: 6, padding: "16px 18px", background: "#F8F9FF", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <IconCircle size={42} bg={NAVY}>
              <IcScales />
            </IconCircle>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: NAVY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 6 }}>
                {T('docs.notification.recours_title')}
              </div>
              <p style={{ fontSize: 8.5, color: DGRAY, margin: 0, lineHeight: 1.7 }}>
                {T('docs.notification.recours_body')}
              </p>
            </div>
          </div>
        </div>

        {/* ── FÉLICITATION ── */}
        <div style={{ textAlign: "center", paddingBottom: 20 }}>
          <p style={{ fontSize: 10, color: MGRAY, margin: "0 0 12px", lineHeight: 1.7 }}>
            {T('docs.notification.felicitations')}
          </p>
          <div style={{ width: 36, height: 2, background: GOLD, borderRadius: 2, margin: "0 auto" }} />
        </div>
      </div>

      {/* ── FOOTER (dark navy) ── */}
      <footer style={{ background: NAVY, padding: "0 36px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0 11px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CLogoSquare size={24} bg={GOLD} fg={NAVY} />
            <span style={{ fontWeight: 700, fontSize: 10, color: "#fff" }}>FEDE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {[
              { sym: "✉", val: contactEmail },
              { sym: "☎", val: contactPhone },
              { sym: "⊕", val: contactWebsite },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{c.sym}</span>
                <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.7)" }}>{c.val}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{T('docs.common.rgpd')}</span>
        </div>
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.3)" }}>© 2026 FEDE</span>
        </div>
      </footer>
    </div>
  );
}
