import React from "react";
import i18n from "@/i18n";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export interface InformationFormProps {
  reference: string;
  dateEmission: string;
  nomProjet: string;
  territoire: string;
  montantCible: string;
  porteur: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  lang?: string;
}

/* ─── Palette ────────────────────────────────────────────────────────────────── */
const NAVY  = "#0B1F4D";
const GOLD  = "#C9993A";
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

/* ─── Section header ─────────────────────────────────────────────────────────── */
function NumberBadge({ n }: { n: number }) {
  return (
    <div style={{ width: 22, height: 22, borderRadius: "50%", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 10, color: "#fff" }}>{n}</span>
    </div>
  );
}
function SectionHeader({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
      <NumberBadge n={n} />
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 700, color: NAVY, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>{label}</span>
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const stroke = { stroke: GOLD, strokeWidth: "1.5", fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function Ic({ d, vb = "0 0 24 24", children }: { d?: string; vb?: string; children?: React.ReactNode }) {
  return (
    <svg width="14" height="14" viewBox={vb} fill="none" style={{ flexShrink: 0 }}>
      {d && <path d={d} {...stroke} />}
      {children}
    </svg>
  );
}
const IcBuilding = () => <Ic><rect x="3" y="4" width="18" height="17" rx="1" {...stroke}/><path d="M9 21V12h6v9" {...stroke}/><rect x="7" y="7" width="3" height="3" rx="0.5" stroke={GOLD} strokeWidth="1.5"/><rect x="14" y="7" width="3" height="3" rx="0.5" stroke={GOLD} strokeWidth="1.5"/></Ic>;
const IcGrid = () => <Ic><rect x="3" y="3" width="7" height="7" rx="1" {...stroke}/><rect x="14" y="3" width="7" height="7" rx="1" {...stroke}/><rect x="3" y="14" width="7" height="7" rx="1" {...stroke}/><rect x="14" y="14" width="7" height="7" rx="1" {...stroke}/></Ic>;
const IcColumns = () => <Ic><rect x="3" y="4" width="18" height="16" rx="2" {...stroke}/><path d="M3 9h18" {...stroke}/></Ic>;
const IcCalendarEdit = () => <Ic><rect x="3" y="4" width="18" height="17" rx="2" {...stroke}/><path d="M3 9h18M8 2v4M16 2v4" {...stroke}/></Ic>;
const IcPin = () => <Ic d="M12 2C8.7 2 6 4.7 6 8c0 5 6 13 6 13s6-8 6-13c0-3.3-2.7-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" />;
const IcPerson = () => <Ic><circle cx="12" cy="8" r="4" {...stroke}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" {...stroke}/></Ic>;
const IcDoc = () => <Ic><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" {...stroke}/><path d="M14 3v5h5M9 13h6M9 17h4" {...stroke}/></Ic>;
const IcTarget = () => <Ic><circle cx="12" cy="12" r="9" {...stroke}/><circle cx="12" cy="12" r="4" {...stroke}/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" {...stroke}/></Ic>;
const IcClock = () => <Ic><circle cx="12" cy="12" r="9" {...stroke}/><path d="M12 7v5l3 3" {...stroke}/></Ic>;
const IcEuro = () => <Ic><circle cx="12" cy="12" r="9" {...stroke}/><path d="M14.5 8.5C13.7 7.6 12.9 7 12 7c-2.2 0-4 2.2-4 5s1.8 5 4 5c.9 0 1.7-.5 2.5-1.4M7 11h5M7 13h5" {...stroke}/></Ic>;
const IcRefresh = () => <Ic><path d="M4 4v6h6" {...stroke}/><path d="M4.1 15A9 9 0 1020 9.1" {...stroke}/></Ic>;
const IcFolderOut = () => <Ic><path d="M3 7c0-1.1.9-2 2-2h4l2 2h8c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z" {...stroke}/></Ic>;
const IcChart = () => <Ic><rect x="3" y="12" width="4" height="9" rx="0.5" {...stroke}/><rect x="10" y="7" width="4" height="14" rx="0.5" {...stroke}/><rect x="17" y="3" width="4" height="18" rx="0.5" {...stroke}/></Ic>;
const IcShield = () => <Ic d="M12 3L4 7v5c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V7l-8-4z" />;
const IcInfo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" fill={NAVY} opacity="0.15" stroke={NAVY} strokeWidth="1.5"/>
    <path d="M12 11v5" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="8" r="0.8" fill={NAVY} stroke={NAVY} strokeWidth="0.4"/>
  </svg>
);

/* ─── Form field ─────────────────────────────────────────────────────────────── */
interface FieldProps {
  icon: React.ReactNode;
  label: string;
  tall?: boolean;
  taller?: boolean;
}
function Field({ icon, label, tall = false, taller = false }: FieldProps) {
  const h = taller ? 48 : tall ? 38 : 24;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
        {icon}
        <span style={{ fontSize: 9, color: DGRAY, fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
      </div>
      <div style={{
        height: h, border: `1px solid ${BGRAY}`, borderRadius: 4,
        background: LGRAY,
      }} />
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────────── */

export function InformationForm({
  reference,
  dateEmission,
  nomProjet,
  territoire,
  montantCible,
  porteur,
  contactEmail    = "support@fede-financement.com",
  contactPhone    = "+33 (0) 800 123 456",
  contactWebsite  = "www.fede-financement.com",
  lang,
}: InformationFormProps) {
  const T = (key: string) => i18n.t(key, { lng: lang || i18n.language || 'fr' });

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
            <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 3 }}>{T('docs.common.date_emission')}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{dateEmission}</div>
          </div>
        </div>
      </header>
      <div style={{ height: 2, background: GOLD }} />

      {/* ── TITLE ZONE ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24, padding: "22px 36px 20px", borderBottom: `1px solid ${BGRAY}` }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: NAVY, lineHeight: 1.15, margin: "0 0 10px" }}>
            {T('docs.fiche.title')}
          </h1>
          <div style={{ width: 40, height: 2.5, background: GOLD, borderRadius: 2, marginBottom: 12 }} />
          <p style={{ fontSize: 9.5, color: DGRAY, lineHeight: 1.65, margin: 0, maxWidth: 350 }}>
            {T('docs.fiche.instruction')}
          </p>
        </div>
        <div style={{ width: 180, flexShrink: 0, paddingTop: 4 }}>
          {[
            { icon: <IcFolderOut />, label: T('docs.fiche.projet'),        value: nomProjet },
            { icon: <IcPin />,       label: T('docs.fiche.territoire'),    value: territoire },
            { icon: <IcChart />,     label: T('docs.fiche.montant_cible'), value: montantCible, large: true },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: i < 2 ? 10 : 0, marginBottom: i < 2 ? 10 : 0, borderBottom: i < 2 ? `1px solid ${BGRAY}` : "none" }}>
              <div style={{ flexShrink: 0 }}>{row.icon}</div>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 1 }}>{row.label}</div>
                <div style={{ fontFamily: row.large ? "'Playfair Display', serif" : "'Inter', sans-serif", fontSize: row.large ? 16 : 11, fontWeight: 700, color: NAVY }}>{row.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, padding: "18px 36px 0" }}>

        {/* ── SECTION 1: INFORMATIONS À COMPLÉTER ── */}
        <div style={{ marginBottom: 18 }}>
          <SectionHeader n={1} label={T('docs.fiche.section1_title')} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 22px" }}>
            <div>
              <Field icon={<IcBuilding />}     label={T('docs.fiche.f1')} />
              <Field icon={<IcGrid />}         label={T('docs.fiche.f2')} />
              <Field icon={<IcColumns />}      label={T('docs.fiche.f3')} />
              <Field icon={<IcCalendarEdit />} label={T('docs.fiche.f4')} />
              <Field icon={<IcPin />}          label={T('docs.fiche.f5')} tall />
              <Field icon={<IcPerson />}       label={T('docs.fiche.f6')} tall />
            </div>
            <div>
              <Field icon={<IcDoc />}          label={T('docs.fiche.f7')} taller />
              <Field icon={<IcTarget />}       label={T('docs.fiche.f8')} />
              <Field icon={<IcCalendarEdit />} label={T('docs.fiche.f9')} tall />
              <Field icon={<IcClock />}        label={T('docs.fiche.f10')} />
              <Field icon={<IcEuro />}         label={T('docs.fiche.f11')} />
              <Field icon={<IcRefresh />}      label={T('docs.fiche.f12')} />
              <Field icon={<IcBuilding />}     label={T('docs.fiche.f13')} />
            </div>
          </div>
        </div>

        {/* ── SECTION 2: SIGNATURES ── */}
        <div style={{ marginBottom: 18 }}>
          <SectionHeader n={2} label={T('docs.fiche.signatures_title')} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

            <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, padding: "14px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <IcBuilding />
                <span style={{ fontSize: 9.5, fontWeight: 800, color: GOLD, letterSpacing: "0.03em" }}>{T('docs.fiche.le_beneficiaire')}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 10 }}>{porteur}</div>
              <div style={{ fontSize: 8.5, color: DGRAY, marginBottom: 4 }}>
                {T('docs.fiche.date_label')} <span style={{ borderBottom: `1px solid ${MGRAY}`, paddingBottom: 1 }}>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
              <div style={{ fontSize: 8, color: MGRAY, marginBottom: 5 }}>{T('docs.fiche.signature_label')}</div>
              <div style={{ height: 40, border: `1px solid ${BGRAY}`, borderRadius: 3, background: LGRAY }} />
            </div>

            <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, padding: "14px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <IcPerson />
                <span style={{ fontSize: 9.5, fontWeight: 800, color: NAVY }}>{T('docs.fiche.conseiller')}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, color: MGRAY, marginBottom: 10 }}>&nbsp;</div>
              <div style={{ fontSize: 8.5, color: DGRAY, marginBottom: 4 }}>
                {T('docs.fiche.date_label')} <span style={{ borderBottom: `1px solid ${MGRAY}`, paddingBottom: 1 }}>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
              <div style={{ fontSize: 8, color: MGRAY, marginBottom: 5 }}>{T('docs.fiche.signature_conseiller')}</div>
              <div style={{ height: 40, border: `1px solid ${BGRAY}`, borderRadius: 3, background: LGRAY }} />
            </div>

            <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, padding: "14px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <IcShield />
                <span style={{ fontSize: 9.5, fontWeight: 800, color: GOLD }}>FEDE</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: DGRAY, marginBottom: 10 }}>{T('docs.fiche.validation')}</div>
              <div style={{ fontSize: 8.5, color: DGRAY, marginBottom: 4 }}>
                {T('docs.fiche.date_label')} <span style={{ borderBottom: `1px solid ${MGRAY}`, paddingBottom: 1 }}>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
              <div style={{ fontSize: 8, color: MGRAY, marginBottom: 5 }}>{T('docs.fiche.signature_conseiller')}</div>
              <div style={{ height: 40, border: `1px solid ${BGRAY}`, borderRadius: 3, background: LGRAY }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── RGPD INFO BAR ── */}
      <div style={{ padding: "0 36px 16px" }}>
        <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, padding: "10px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flexShrink: 0, marginTop: 1 }}><IcInfo /></div>
          <p style={{ fontSize: 8.5, color: MGRAY, margin: 0, lineHeight: 1.6 }}>
            {T('docs.fiche.rgpd_note1')}<br />
            {T('docs.fiche.rgpd_note2')}
          </p>
        </div>
      </div>

      {/* ── FOOTER (dark navy) ── */}
      <footer style={{ background: NAVY, padding: "0 36px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0 11px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CLogoSquare size={22} bg={GOLD} fg={NAVY} />
            <span style={{ fontWeight: 700, fontSize: 11, color: "#fff" }}>FEDE</span>
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
