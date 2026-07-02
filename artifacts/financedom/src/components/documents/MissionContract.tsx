import React from "react";
import i18n from "@/i18n";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export interface MissionContractProps {
  reference: string;
  dateEmission: string;
  nomProjet: string;
  territoire: string;
  montantCible: string;
  porteur: string;
  porteurTerritoire?: string;
  dureeMois?: number;
  dureeNote?: string;
  honorairesTTC?: string;
  honorairesHT?: string;
  tvaPct?: number;
  paiementNote?: string;
  engagementsPrestataire?: string[];
  introPrestataire?: string;
  engagementsClient?: string[];
  introClient?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  lang?: string;
}

/* ─── Palette ────────────────────────────────────────────────────────────────── */
const NAVY   = "#0B1F4D";
const GOLD   = "#C9993A";
const LGRAY  = "#F5F5F5";
const BGRAY  = "#E5E7EB";
const MGRAY  = "#9CA3AF";
const DGRAY  = "#374151";

/* ─── Shared micro-components ───────────────────────────────────────────────── */

function CLogoSquare({ size = 32 }: { size?: number }) {
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

function NumberBadge({ n }: { n: number }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: "50%", background: NAVY,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 10, color: "#fff" }}>{n}</span>
    </div>
  );
}

function SectionHeader({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
      <NumberBadge n={n} />
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 700,
        color: NAVY, letterSpacing: "0.14em", textTransform: "uppercase" as const,
      }}>{label}</span>
    </div>
  );
}

function CheckMark({ color = "#16A34A" }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="8" cy="8" r="8" fill={color} />
      <path d="M4.5 8.5L6.5 10.5L11 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── SVG Icons ──────────────────────────────────────────────────────────────── */

function FolderIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 7c0-1.1.9-2 2-2h4l2 2h8c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z" fill={GOLD}/>
    </svg>
  );
}
function PinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.7 2 6 4.7 6 8c0 5 6 13 6 13s6-8 6-13c0-3.3-2.7-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" fill={GOLD}/>
    </svg>
  );
}
function ChartIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="12" width="4" height="9" fill={GOLD}/>
      <rect x="10" y="7" width="4" height="14" fill={GOLD}/>
      <rect x="17" y="3" width="4" height="18" fill={GOLD}/>
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke={GOLD} strokeWidth="1.8"/>
      <path d="M3 9h18" stroke={GOLD} strokeWidth="1.8"/>
      <path d="M8 2v4M16 2v4" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function EuroSignIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={GOLD} strokeWidth="1.8"/>
      <path d="M14.5 8.5C13.7 7.6 12.9 7 12 7c-2.2 0-4 2.2-4 5s1.8 5 4 5c.9 0 1.7-.5 2.5-1.4M7 11h5M7 13h5" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke={GOLD} strokeWidth="1.8"/>
      <path d="M2 10h20" stroke={GOLD} strokeWidth="1.8"/>
      <rect x="5" y="14" width="4" height="2" rx="0.5" fill={GOLD}/>
    </svg>
  );
}
function BuildingIcon({ color = GOLD }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="1" stroke={color} strokeWidth="1.7"/>
      <path d="M9 21V12h6v9" stroke={color} strokeWidth="1.7"/>
      <rect x="7" y="7" width="3" height="3" rx="0.5" fill={color}/>
      <rect x="14" y="7" width="3" height="3" rx="0.5" fill={color}/>
    </svg>
  );
}
function PersonIcon({ color = MGRAY }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.7"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L4 7v5c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V7l-8-4z" stroke={MGRAY} strokeWidth="1.5" fill="none"/>
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke={MGRAY} strokeWidth="1.5"/>
      <path d="M8 11V7a4 4 0 018 0v4" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 4v6h6" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20v-6h-6" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.1 15A9 9 0 1020 9.1" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function CloudIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 10a6 6 0 00-11.4-2.6A4.5 4.5 0 005.5 17H18a4 4 0 000-7z" stroke={MGRAY} strokeWidth="1.5"/>
    </svg>
  );
}
function ScalesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v18M3 6l9-3 9 3" stroke={MGRAY} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 9l-3 7h6l-3-7zM18 9l-3 7h6l-3-7z" stroke={MGRAY} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export function MissionContract({
  reference,
  dateEmission,
  nomProjet,
  territoire,
  montantCible,
  porteur,
  porteurTerritoire,
  dureeMois = 12,
  dureeNote,
  honorairesTTC = "456,00 € TTC",
  honorairesHT  = "380,00 € HT + TVA 20 %",
  paiementNote,
  engagementsPrestataire,
  introPrestataire,
  engagementsClient,
  introClient,
  contactEmail = "support@fede-financement.com",
  contactPhone = "+33 (0) 800 123 456",
  contactWebsite = "www.fede-financement.com",
  lang,
}: MissionContractProps) {
  const T = (key: string) => i18n.t(key, { lng: lang || i18n.language || 'fr' });

  const resolvedDureeNote        = dureeNote        ?? T('docs.contrat.duree_note');
  const resolvedPaiementNote     = paiementNote     ?? T('docs.contrat.paiement_note');
  const resolvedIntroPrestataire = introPrestataire ?? T('docs.contrat.eng_prestataire_intro');
  const resolvedIntroClient      = introClient      ?? T('docs.contrat.eng_client_intro');
  const resolvedEngP = engagementsPrestataire ?? [
    T('docs.contrat.eng_p1'),
    T('docs.contrat.eng_p2'),
    T('docs.contrat.eng_p3'),
  ];
  const resolvedEngC = engagementsClient ?? [
    T('docs.contrat.eng_c1'),
    T('docs.contrat.eng_c2'),
    T('docs.contrat.eng_c3'),
  ];

  const cadre = [
    { icon: <ShieldIcon />,  label: T('docs.contrat.cadre_confidential_label'), text: T('docs.contrat.cadre_confidential') },
    { icon: <LockIcon />,    label: T('docs.contrat.cadre_rgpd_label'),         text: T('docs.contrat.cadre_rgpd') },
    { icon: <RefreshIcon />, label: T('docs.contrat.cadre_resiliation_label'),  text: T('docs.contrat.cadre_resiliation') },
    { icon: <CloudIcon />,   label: T('docs.contrat.cadre_force_majeure_label'),text: T('docs.contrat.cadre_force_majeure') },
    { icon: <ScalesIcon />,  label: T('docs.contrat.cadre_droit_label'),        text: T('docs.contrat.cadre_droit') },
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

      {/* ─── HEADER ─── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 36px 10px",
        background: "#fff",
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
          <div style={{ textAlign: "right", paddingRight: 18 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 3 }}>{T('docs.common.ref_dossier')}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, letterSpacing: "0.03em" }}>{reference}</div>
          </div>
          <div style={{ width: 1, height: 34, background: BGRAY, flexShrink: 0 }} />
          <div style={{ textAlign: "left", paddingLeft: 18 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 3 }}>{T('docs.common.date_emission')}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{dateEmission}</div>
          </div>
        </div>
      </header>

      {/* Gold separator line */}
      <div style={{ height: 2.5, background: GOLD, flexShrink: 0 }} />

      {/* ─── TITLE ZONE ─── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 24,
        padding: "14px 36px 12px",
        borderBottom: `1px solid ${BGRAY}`,
        flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36, fontWeight: 700, color: NAVY,
            lineHeight: 1.1, margin: "0 0 5px",
          }}>{T('docs.contrat.title')}</h1>
          <div style={{ fontSize: 9, color: MGRAY, fontWeight: 500, marginBottom: 10, letterSpacing: "0.02em" }}>
            {T('docs.contrat.article')}
          </div>
          <div style={{ width: 40, height: 2.5, background: GOLD, borderRadius: 2, marginBottom: 12 }} />
          <p style={{ fontSize: 9.5, color: DGRAY, lineHeight: 1.6, margin: 0, maxWidth: 380 }}>
            {T('docs.contrat.intro')}
          </p>
        </div>

        <div style={{ width: 185, flexShrink: 0, paddingTop: 4 }}>
          {[
            { icon: <FolderIcon />, label: T('docs.contrat.projet'),        value: nomProjet },
            { icon: <PinIcon />,    label: T('docs.contrat.territoire'),    value: territoire },
            { icon: <ChartIcon />,  label: T('docs.contrat.montant_cible'), value: montantCible, bold: true, large: true },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              paddingBottom: i < 2 ? 10 : 0,
              marginBottom: i < 2 ? 10 : 0,
              borderBottom: i < 2 ? `1px solid ${BGRAY}` : "none",
            }}>
              <div style={{ flexShrink: 0 }}>{row.icon}</div>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 1 }}>
                  {row.label}
                </div>
                <div style={{
                  fontFamily: row.large ? "'Playfair Display', serif" : "'Inter', sans-serif",
                  fontSize: row.large ? 16 : 11, fontWeight: 700, color: NAVY,
                }}>
                  {row.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div style={{ flex: 1, padding: "10px 36px 0" }}>

        {/* ── SECTION 1: LES PARTIES ── */}
        <div style={{ marginBottom: 10 }}>
          <SectionHeader n={1} label={T('docs.contrat.parties_title')} />
          <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 1, padding: "14px 16px", borderRight: `1px solid ${BGRAY}` }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 10 }}>{T('docs.contrat.prestataire')}</div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <CLogoSquare size={30} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2 }}>FEDE</div>
                  <div style={{ fontSize: 8.5, color: DGRAY, lineHeight: 1.5 }}>{T('docs.contrat.activity')}</div>
                  <div style={{ fontSize: 8.5, color: MGRAY }}>{T('docs.contrat.article')}</div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, padding: "14px 16px" }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 10 }}>{T('docs.contrat.client')}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: LGRAY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <PersonIcon color={MGRAY} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{porteur}</div>
                  <div style={{ fontSize: 8.5, color: DGRAY }}>{T('docs.contrat.territoire_label')} {porteurTerritoire || territoire}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: CONDITIONS PRINCIPALES ── */}
        <div style={{ marginBottom: 10 }}>
          <SectionHeader n={2} label={T('docs.contrat.conditions_title')} />
          <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 1, padding: "12px 14px", borderRight: `1px solid ${BGRAY}` }}>
              <div style={{ marginBottom: 8 }}><CalendarIcon /></div>
              <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 }}>{T('docs.contrat.duree_label')}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: NAVY, lineHeight: 1, marginBottom: 4 }}>
                {dureeMois} {T('docs.contrat.mois')}
              </div>
              <div style={{ fontSize: 8, color: MGRAY, lineHeight: 1.45 }}>{resolvedDureeNote}</div>
            </div>
            <div style={{ flex: 1, padding: "12px 14px", borderRight: `1px solid ${BGRAY}` }}>
              <div style={{ marginBottom: 8 }}><EuroSignIcon /></div>
              <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 }}>{T('docs.contrat.honoraires_label')}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: NAVY, lineHeight: 1, marginBottom: 4 }}>
                {honorairesTTC}
              </div>
              <div style={{ fontSize: 8, color: MGRAY, lineHeight: 1.45 }}>({honorairesHT})<br />{T('docs.contrat.cgct')}</div>
            </div>
            <div style={{ flex: 1, padding: "12px 14px" }}>
              <div style={{ marginBottom: 8 }}><CardIcon /></div>
              <div style={{ fontSize: 7, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 6 }}>{T('docs.contrat.paiement_label')}</div>
              <div style={{ fontSize: 8.5, color: DGRAY, lineHeight: 1.55 }}>{resolvedPaiementNote}</div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: ENGAGEMENTS ── */}
        <div style={{ marginBottom: 10 }}>
          <SectionHeader n={3} label={T('docs.contrat.engagements_title')} />
          <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 1, padding: "12px 14px", borderRight: `1px solid ${BGRAY}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <BuildingIcon color={GOLD} />
                <span style={{ fontSize: 8.5, fontWeight: 700, color: GOLD, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                  {T('docs.contrat.eng_prestataire')}
                </span>
              </div>
              <p style={{ fontSize: 8.5, color: DGRAY, margin: "0 0 8px", lineHeight: 1.5 }}>{resolvedIntroPrestataire}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {resolvedEngP.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <CheckMark />
                    <span style={{ fontSize: 8, color: DGRAY, lineHeight: 1.5 }}>{e}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <PersonIcon color={DGRAY} />
                <span style={{ fontSize: 8.5, fontWeight: 700, color: NAVY, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                  {T('docs.contrat.eng_client')}
                </span>
              </div>
              <p style={{ fontSize: 8.5, color: DGRAY, margin: "0 0 8px", lineHeight: 1.5 }}>{resolvedIntroClient}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {resolvedEngC.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <CheckMark />
                    <span style={{ fontSize: 8, color: DGRAY, lineHeight: 1.5 }}>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: CADRE CONTRACTUEL ── */}
        <div style={{ marginBottom: 10 }}>
          <SectionHeader n={4} label={T('docs.contrat.cadre_title')} />
          <div style={{ border: `1px solid ${BGRAY}`, borderRadius: 6, display: "flex", overflow: "hidden" }}>
            {cadre.map((c, i) => (
              <div key={i} style={{
                flex: 1, padding: "10px 10px",
                borderRight: i < cadre.length - 1 ? `1px solid ${BGRAY}` : "none",
              }}>
                <div style={{ marginBottom: 5 }}>{c.icon}</div>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: NAVY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 4 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 7.5, color: MGRAY, lineHeight: 1.55 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 5: SIGNATURES ── */}
        <div style={{ marginBottom: 0 }}>
          <SectionHeader n={5} label={T('docs.contrat.signatures_title')} />
          <div style={{ display: "flex", gap: 14 }}>
            {/* Prestataire */}
            <div style={{ flex: 1, border: `1px solid ${BGRAY}`, borderRadius: 6, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: LGRAY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BuildingIcon color={NAVY} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: NAVY }}>{T('docs.contrat.pour_cap')}</div>
                  <div style={{ fontSize: 8, color: MGRAY }}>{T('docs.contrat.le_prestataire')}</div>
                </div>
              </div>
              <div style={{ fontSize: 8.5, color: DGRAY, marginBottom: 5 }}>
                {T('docs.contrat.date_label')} <span style={{ borderBottom: `1px solid ${MGRAY}`, paddingBottom: 1, marginLeft: 2 }}>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
              <div style={{ fontSize: 8, color: MGRAY, marginBottom: 6 }}>{T('docs.contrat.signature_label')}</div>
              <div style={{ height: 44, border: `1px solid ${BGRAY}`, borderRadius: 3 }} />
            </div>
            {/* Client */}
            <div style={{ flex: 1, border: `1px solid ${BGRAY}`, borderRadius: 6, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: LGRAY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PersonIcon color={NAVY} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: NAVY }}>{T('docs.contrat.le_client')}</div>
                  <div style={{ fontSize: 8, color: MGRAY }}>{porteur} — {T('docs.contrat.bon_pour_accord')}</div>
                </div>
              </div>
              <div style={{ fontSize: 8.5, color: DGRAY, marginBottom: 5 }}>
                {T('docs.contrat.date_label')} <span style={{ borderBottom: `1px solid ${MGRAY}`, paddingBottom: 1, marginLeft: 2 }}>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
              <div style={{ fontSize: 8, color: MGRAY, marginBottom: 6 }}>{T('docs.contrat.signature_label')}</div>
              <div style={{ height: 44, border: `1px solid ${BGRAY}`, borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── MID-FOOTER ─── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 36px",
        borderTop: `1px solid ${BGRAY}`,
        marginTop: 10,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 8, color: MGRAY, fontStyle: "italic" }}>Fait en deux exemplaires originaux.</span>
        <span style={{ fontSize: 8, color: MGRAY }}>{T('docs.common.ref_dossier')} : <strong style={{ color: NAVY }}>{reference}</strong></span>
      </div>

      {/* ─── FOOTER (dark navy) ─── */}
      <footer style={{
        background: NAVY,
        padding: "12px 36px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, background: GOLD, borderRadius: 3,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: NAVY, fontSize: 11 }}>C</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 11, color: "#fff" }}>FEDE</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {[
            { sym: "✉", val: contactEmail },
            { sym: "☎", val: contactPhone },
            { sym: "⊕", val: contactWebsite },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{c.sym}</span>
              <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.75)" }}>{c.val}</span>
            </div>
          ))}
        </div>

        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>{T('docs.common.rgpd')} &nbsp;|&nbsp; © 2026</span>
      </footer>
    </div>
  );
}
