import React from "react";
import i18n from "@/i18n";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export interface InvoiceLineItem {
  designation: string;
  description?: string;
  quantite: number;
  puHT: number;
}

export interface InvoiceProps {
  numero: string;
  dateEmission: string;
  echeance?: string;
  porteur: string;
  territoire: string;
  nomProjet?: string;
  dispositif?: string;
  items?: InvoiceLineItem[];
  tvaPct?: number;
  iban?: string;
  bic?: string;
  banque?: string;
  siret?: string;
  tvaIntra?: string;
  adresse?: string;
  codePostalVille?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  lang?: string;
}

/* ─── Palette ─────────────────────────────────────────────────────────────────── */
const NAVY  = "#0B1F4D";
const GOLD  = "#C9993A";
const BGRAY = "#E5E7EB";
const MGRAY = "#9CA3AF";
const DGRAY = "#374151";
const LIGHT = "#F9FAFB";
const GOLD_LIGHT = "#FFFBEB";
const GOLD_BORDER = "#FDE68A";

/* ─── Helpers ─────────────────────────────────────────────────────────────────── */
function fmtEur(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

/* ─── Logo ────────────────────────────────────────────────────────────────────── */
function CLogoSquare({ size = 34 }: { size?: number; bg?: string; fg?: string }) {
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

/* ─── SVG icons ───────────────────────────────────────────────────────────────── */
function IcCalendar({ c = GOLD, size = 16 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke={c} strokeWidth="1.6"/><path d="M3 9h18M8 2v4M16 2v4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
function IcDoc({ c = GOLD, size = 16 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 3v5h5" stroke={c} strokeWidth="1.6"/><path d="M9 13h6M9 17h4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcBuilding({ c = MGRAY, size = 16 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="1" stroke={c} strokeWidth="1.5"/><path d="M9 21V12h6v9" stroke={c} strokeWidth="1.5"/><rect x="7" y="7" width="3" height="3" rx="0.5" stroke={c} strokeWidth="1.5"/><rect x="14" y="7" width="3" height="3" rx="0.5" stroke={c} strokeWidth="1.5"/></svg>;
}
function IcPerson({ c = MGRAY, size = 16 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcCard({ c = GOLD, size = 14 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke={c} strokeWidth="1.6"/><path d="M2 10h20" stroke={c} strokeWidth="1.6"/><path d="M6 15h4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
function IcBank({ c = NAVY, size = 20 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 21h18M3 10h18M5 10V6M8 10V6M12 10V6M16 10V6M19 10V6M12 3L3 6h18L12 3z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 21v-5M8 21v-5M12 21v-5M16 21v-5M19 21v-5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcInfo({ c = NAVY, size = 18 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5"/><path d="M12 11v5M12 8v1" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
function IcPin({ c = "rgba(255,255,255,0.6)", size = 13 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2C8.7 2 6 4.7 6 8c0 5 6 13 6 13s6-8 6-13c0-3.3-2.7-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" stroke={c} strokeWidth="1.5"/></svg>;
}
function IcPhone({ c = "rgba(255,255,255,0.6)", size = 13 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1A19.5 19.5 0 015.5 13a19.8 19.8 0 01-3.1-8.7A2 2 0 014.4 2h3a2 2 0 012 1.7 12.8 12.8 0 00.7 2.8 2 2 0 01-.4 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0122 16.9z" stroke={c} strokeWidth="1.5"/></svg>;
}
function IcMail({ c = "rgba(255,255,255,0.6)", size = 13 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke={c} strokeWidth="1.5"/><path d="M2 7l10 7 10-7" stroke={c} strokeWidth="1.5"/></svg>;
}
function IcGlobe({ c = "rgba(255,255,255,0.6)", size = 13 }: { c?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5"/><path d="M12 3c-2 2.5-3 5.5-3 9s1 6.5 3 9M12 3c2 2.5 3 5.5 3 9s-1 6.5-3 9M3 12h18" stroke={c} strokeWidth="1.3"/></svg>;
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────────── */

export function Invoice({
  numero,
  dateEmission,
  echeance,
  porteur,
  territoire,
  nomProjet,
  dispositif,
  items,
  tvaPct            = 20,
  iban              = "FR76 3000 4006 5800 0100 1234 567",
  bic               = "BNPAFRPPXXX",
  banque            = "BNP Paribas",
  siret             = "914 123 456 00029",
  tvaIntra          = "FR 91 914123456",
  adresse           = "15 rue des Entrepreneurs",
  codePostalVille   = "75015 Paris – France",
  contactEmail      = "support@fede-financement.com",
  contactPhone      = "+33 (0) 800 123 456",
  contactWebsite    = "www.fede-financement.com",
  lang,
}: InvoiceProps) {
  const T = (key: string) => i18n.t(key, { lng: lang || i18n.language || 'fr' });

  const resolvedEcheance = echeance ?? T('docs.facture.echeance_default');
  const resolvedItems: InvoiceLineItem[] = items ?? [
    {
      designation: T('docs.facture.designation'),
      description: T('docs.facture.description'),
      quantite: 1,
      puHT: 380,
    },
  ];

  const totalHT  = resolvedItems.reduce((s, i) => s + i.quantite * i.puHT, 0);
  const tvaAmt   = totalHT * tvaPct / 100;
  const totalTTC = totalHT + tvaAmt;

  const labelGold: React.CSSProperties = {
    fontSize: 7.5, fontWeight: 700, color: GOLD,
    letterSpacing: "0.12em", textTransform: "uppercase",
    marginBottom: 5, display: "block",
  };
  const mono: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

  return (
    <div style={{
      width: 794, minHeight: 1123, background: "#fff",
      fontFamily: "'Inter', sans-serif", fontSize: 10, color: NAVY,
      boxShadow: "0 4px 40px rgba(11,31,77,0.13), 0 1px 4px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── HEADER ── */}
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "22px 36px 18px", borderBottom: `1px solid ${BGRAY}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <CLogoSquare size={40} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: NAVY, lineHeight: 1.1 }}>FEDE</div>
            <div style={{ fontWeight: 600, fontSize: 7, color: GOLD, letterSpacing: "0.22em", textTransform: "uppercase" as const }}>{T('docs.common.slogan')}</div>
            <div style={{ width: 30, height: 2, background: GOLD, borderRadius: 1, marginTop: 4 }} />
          </div>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 5, paddingTop: 2 }}>
          {[
            { ic: "✉", val: contactEmail },
            { ic: "☎", val: contactPhone },
            { ic: "⊕", val: contactWebsite },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
              <span style={{ fontSize: 8, color: MGRAY }}>{c.ic}</span>
              <span style={{ fontSize: 8.5, color: DGRAY }}>{c.val}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── FACTURE TITLE ZONE ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 28, padding: "22px 36px 20px", borderBottom: `1px solid ${BGRAY}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: 42, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6 }}>
            {T('docs.facture.title')}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, color: GOLD, letterSpacing: "0.01em", marginBottom: 6, ...mono }}>
            {T('docs.facture.numero')}&nbsp;&nbsp;{numero}
          </div>
          <div style={{ width: 36, height: 2.5, background: GOLD, borderRadius: 1.5, marginBottom: 10 }} />
          <div style={{ fontSize: 8.5, color: MGRAY, lineHeight: 1.65 }}>
            {T('docs.facture.article')}
          </div>
        </div>
        <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 4, overflow: "hidden", minWidth: 252 }}>
          <div style={{ display: "flex" }}>
            {[
              { icon: <IcCalendar />, label: T('docs.common.date_emission'),  value: dateEmission },
              { icon: <IcDoc />,      label: T('docs.common.ref_dossier'),    value: numero },
            ].map((col, i) => (
              <div key={i} style={{
                flex: 1, padding: "14px 16px",
                borderRight: i === 0 ? `1px solid ${BGRAY}` : "none",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
              }}>
                <div style={{ marginBottom: 8 }}>{col.icon}</div>
                <div style={{ fontSize: 7, fontWeight: 700, color: MGRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 5 }}>
                  {col.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, ...mono }}>{col.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ÉMETTEUR / FACTURÉ À ── */}
      <div style={{ display: "flex", padding: "20px 36px", gap: 0, borderBottom: `1px solid ${BGRAY}` }}>
        <div style={{ flex: 1, paddingRight: 28, borderRight: `1px solid ${BGRAY}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, border: `1px solid ${BGRAY}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IcBuilding c={NAVY} size={16} />
            </div>
            <span style={labelGold}>{T('docs.facture.emetteur')}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 3 }}>FEDE</div>
          <div style={{ fontSize: 8.5, color: DGRAY, lineHeight: 1.65 }}>
            {T('docs.facture.activite')}<br />
            {T('docs.facture.article_cgct')}
          </div>
          <div style={{ marginTop: 8, fontSize: 8.5, color: DGRAY, lineHeight: 1.65 }}>
            {adresse}<br />
            {codePostalVille}
          </div>
          <div style={{ marginTop: 8, fontSize: 8.5, color: MGRAY, lineHeight: 1.65 }}>
            {T('docs.facture.siret')} {siret}<br />
            {T('docs.facture.tva_intra')} {tvaIntra}
          </div>
        </div>

        <div style={{ flex: 1, paddingLeft: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, border: `1px solid ${BGRAY}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IcPerson c={NAVY} size={16} />
            </div>
            <span style={labelGold}>{T('docs.facture.facture_a')}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{porteur}</div>
          <div style={{ fontSize: 8.5, color: DGRAY, lineHeight: 1.65 }}>
            {T('docs.facture.territoire')} {territoire}
          </div>
          {(nomProjet || dispositif) && (
            <div style={{ marginTop: 10, fontSize: 8.5, color: DGRAY, lineHeight: 1.65 }}>
              {nomProjet  && <div>{T('docs.facture.projet')} {nomProjet}</div>}
              {dispositif && <div>{T('docs.facture.dispositif')} {dispositif}</div>}
            </div>
          )}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{ margin: "20px 36px 0", border: `1px solid ${BGRAY}` }}>
        <div style={{ background: NAVY, display: "grid", gridTemplateColumns: "1fr 70px 90px 90px", gap: 0 }}>
          {[T('docs.facture.col_designation'), T('docs.facture.col_qty'), T('docs.facture.col_pu_ht'), T('docs.facture.col_total_ht')].map((h, i) => (
            <div key={i} style={{
              padding: "10px 14px",
              fontSize: 8, fontWeight: 700, color: "#fff",
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              textAlign: i === 0 ? "left" : "right",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
            }}>
              {h}
            </div>
          ))}
        </div>
        {resolvedItems.map((item, i) => {
          const total = item.quantite * item.puHT;
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 70px 90px 90px",
              borderTop: `1px solid ${BGRAY}`,
              background: i % 2 === 0 ? "#fff" : LIGHT,
            }}>
              <div style={{ padding: "14px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{item.designation}</div>
                {item.description && (
                  <div style={{ fontSize: 8, color: MGRAY, lineHeight: 1.6 }}>{item.description}</div>
                )}
              </div>
              <div style={{ padding: "14px 14px", textAlign: "right", fontSize: 10, color: NAVY, display: "flex", alignItems: "center", justifyContent: "flex-end", borderLeft: `1px solid ${BGRAY}`, ...mono }}>
                {item.quantite}
              </div>
              <div style={{ padding: "14px 14px", textAlign: "right", fontSize: 10, color: NAVY, display: "flex", alignItems: "center", justifyContent: "flex-end", borderLeft: `1px solid ${BGRAY}`, ...mono }}>
                {fmtEur(item.puHT)}
              </div>
              <div style={{ padding: "14px 14px", textAlign: "right", fontSize: 10, color: NAVY, display: "flex", alignItems: "center", justifyContent: "flex-end", borderLeft: `1px solid ${BGRAY}`, ...mono }}>
                {fmtEur(total)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODALITÉS / TOTAUX ── */}
      <div style={{ display: "flex", gap: 24, padding: "20px 36px 0", alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 320px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <IcCard />
            <span style={{ ...labelGold, marginBottom: 0 }}>{T('docs.facture.paiement_title')}</span>
          </div>
          <p style={{ fontSize: 8.5, color: DGRAY, margin: "0 0 12px", lineHeight: 1.65 }}>
            {T('docs.facture.paiement_body')}<br />
            {T('docs.facture.paiement_ref')}
          </p>
          <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 4, padding: "12px 14px", background: LIGHT, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 34, height: 34, background: "#E8EDF5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IcBank c={NAVY} size={18} />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: NAVY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 6 }}>
                {T('docs.facture.coordonnees_title')}
              </div>
              <div style={{ fontSize: 8.5, color: DGRAY, lineHeight: 1.7 }}>
                {T('docs.facture.titulaire')}<br />
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 8 }}>IBAN : {iban}</span><br />
                BIC : {bic}<br />
                Banque : {banque}
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${BGRAY}` }}>
            <span style={{ fontSize: 9, color: MGRAY, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{T('docs.facture.total_ht')}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: NAVY, ...mono }}>{fmtEur(totalHT)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${BGRAY}` }}>
            <span style={{ fontSize: 9, color: MGRAY, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{T('docs.facture.tva')} ({tvaPct} %)</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: NAVY, ...mono }}>{fmtEur(tvaAmt)}</span>
          </div>
          <div style={{ height: 1.5, background: GOLD, borderRadius: 1, margin: "4px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 14px" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: NAVY, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{T('docs.facture.total_ttc')}</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: GOLD, ...mono }}>
              {fmtEur(totalTTC)}
            </span>
          </div>
          <div style={{ border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, background: GOLD_LIGHT, padding: "10px 14px", display: "flex", alignItems: "center", gap: 9 }}>
            <IcCalendar c={GOLD} size={14} />
            <span style={{ fontSize: 9, fontWeight: 700, color: "#92400E" }}>
              {T('docs.facture.echeance_label')} {resolvedEcheance}
            </span>
          </div>
        </div>
      </div>

      {/* ── MENTIONS IMPORTANTES ── */}
      <div style={{ margin: "20px 36px 0", border: `1px solid ${BGRAY}`, borderRadius: 4, padding: "13px 16px", background: LIGHT }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
          <IcInfo />
          <span style={{ fontSize: 9, fontWeight: 800, color: NAVY, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
            {T('docs.facture.mentions_title')}
          </span>
        </div>
        <div style={{ fontSize: 8.5, color: DGRAY, lineHeight: 1.7 }}>
          {T('docs.facture.mention1')}<br />
          {T('docs.facture.mention2')}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* ── FOOTER ── */}
      <footer style={{ background: NAVY, padding: "0 36px", flexShrink: 0, marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0 11px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 26, height: 26, background: GOLD, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: NAVY, fontSize: 14, lineHeight: 1 }}>C</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 10, color: "#fff" }}>FEDE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IcPin />
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.65)" }}>{adresse}, {codePostalVille}</span>
            </div>
            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IcPhone />
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.65)" }}>{contactPhone}</span>
            </div>
            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IcMail />
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.65)" }}>{contactEmail}</span>
            </div>
            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IcGlobe />
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.65)" }}>{contactWebsite}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.3)" }}>{T('docs.common.rgpd')}&nbsp;&nbsp;|&nbsp;&nbsp;© 2026 FEDE</span>
        </div>
      </footer>
    </div>
  );
}
