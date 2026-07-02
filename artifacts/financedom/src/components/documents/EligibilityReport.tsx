import React from "react";
import i18n from "@/i18n";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export interface EligibilityReportProps {
  reference: string;
  dateEmission: string;
  porteur: string;
  nomProjet: string;
  territoire: string;
  secteur: string;
  montantPotentiel: string;
  tauxMin: number;
  tauxMax: number;
  dispositifPrincipal: string;
  organismeFinanceur?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  criterias?: CriteriaItem[];
  nextStepsText?: string;
  avisDescription?: string;
  lang?: string;
}

interface CriteriaItem {
  label: string;
  description: string;
  ok?: boolean;
}

/* ─── Palette ────────────────────────────────────────────────────────────────── */
const NAVY   = "#0B1F4D";
const GOLD   = "#C9993A";
const GREEN  = "#16A34A";
const LGRAY  = "#F5F5F5";
const MGRAY  = "#9CA3AF";
const DGRAY  = "#374151";

/* ─── Micro-components ───────────────────────────────────────────────────────── */

function SectionBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: NAVY, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 700,
        color: NAVY, letterSpacing: "0.12em", textTransform: "uppercase" as const,
      }}>
        {label}
      </span>
    </div>
  );
}

function CheckIcon({ size = 14, color = GREEN }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={color} />
      <path d="M4.5 8.5L6.5 10.5L11 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function EuroIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M14 5C11.2 5 9 7.2 9 10v1H7v2h2v2H7v2h2c0 2.8 2.2 5 5 5 1.4 0 2.7-.6 3.6-1.5l-1.4-1.4C15.6 19.6 14.8 20 14 20c-1.7 0-3-1.3-3-3h4v-2h-4v-2h4v-2h-4c0-1.7 1.3-3 3-3 .8 0 1.6.4 2.2 1l1.4-1.4C16.7 5.6 15.4 5 14 5z" fill="#fff"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6v6c0 5 3.6 9.7 8 11 4.4-1.3 8-6 8-11V6l-8-4z" fill="#fff"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={GOLD}/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 7c0-1.1.9-2 2-2h4l2 2h8c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z" fill={GOLD}/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.7 2 6 4.7 6 8c0 5 6 13 6 13s6-8 6-13c0-3.3-2.7-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" fill={GOLD}/>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="12" width="4" height="9" fill={GOLD}/>
      <rect x="10" y="7" width="4" height="14" fill={GOLD}/>
      <rect x="17" y="3" width="4" height="18" fill={GOLD}/>
    </svg>
  );
}

function CLogoSquare({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, background: NAVY,
      borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700,
        color: GOLD, fontSize: size * 0.55, lineHeight: 1,
      }}>C</span>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */

export function EligibilityReport({
  reference,
  dateEmission,
  porteur,
  nomProjet,
  territoire,
  secteur,
  montantPotentiel,
  tauxMin,
  tauxMax,
  dispositifPrincipal,
  organismeFinanceur,
  contactEmail    = "support@fede-financement.com",
  contactPhone    = "+33 (0) 800 123 456",
  contactWebsite  = "www.fede-financement.com",
  criterias,
  nextStepsText,
  avisDescription,
  lang,
}: EligibilityReportProps) {
  const T = (key: string) => i18n.t(key, { lng: lang || i18n.language || 'fr' });

  const resolvedOrganisme = organismeFinanceur ?? T('docs.eligibility.organisme_default');
  const resolvedNextSteps = nextStepsText ?? T('docs.eligibility.next_steps_text');
  const resolvedAvis = avisDescription ?? T('docs.eligibility.avis_desc');
  const resolvedCriterias: CriteriaItem[] = criterias ?? [
    { label: T('docs.eligibility.criteria_geo'),      description: T('docs.eligibility.criteria_geo_desc'),      ok: true },
    { label: T('docs.eligibility.criteria_secteur'),  description: T('docs.eligibility.criteria_secteur_desc'),  ok: true },
    { label: T('docs.eligibility.criteria_montant'),  description: T('docs.eligibility.criteria_montant_desc'),  ok: true },
    { label: T('docs.eligibility.criteria_complete'), description: T('docs.eligibility.criteria_complete_desc'), ok: true },
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
      position: "relative",
    }}>

      {/* ── HEADER ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px 18px",
        borderBottom: "1px solid #E5E7EB",
        background: "#fff",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CLogoSquare size={36} />
          <div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 15,
              color: NAVY, letterSpacing: "0.01em", lineHeight: 1.1,
            }}>FEDE</div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 7.5,
              color: GOLD, letterSpacing: "0.18em", textTransform: "uppercase",
            }}>{T('docs.common.slogan')}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ textAlign: "right", paddingRight: 20 }}>
            <div style={{ fontSize: 7, fontWeight: 600, color: MGRAY, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
              {T('docs.eligibility.dossier')}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums" }}>
              {reference}
            </div>
          </div>
          <div style={{ width: 1, height: 38, background: "#E5E7EB", flexShrink: 0 }} />
          <div style={{ textAlign: "left", paddingLeft: 20 }}>
            <div style={{ fontSize: 7, fontWeight: 600, color: MGRAY, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
              {T('docs.common.date_emission')}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>
              {dateEmission}
            </div>
          </div>
        </div>
      </header>

      {/* ── TITLE SECTION ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 20,
        padding: "32px 40px 28px",
        borderBottom: "1px solid #E5E7EB",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 8.5, fontWeight: 700, color: GOLD,
            letterSpacing: "0.22em", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            {T('docs.eligibility.rapport')}
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 34, fontWeight: 700, color: NAVY,
            lineHeight: 1.15, margin: "0 0 10px",
          }}>
            {T('docs.eligibility.title')}
          </h1>
          <p style={{
            fontSize: 10, color: DGRAY, margin: "0 0 16px",
            lineHeight: 1.55, maxWidth: 360,
          }}>
            {T('docs.eligibility.subtitle')}
          </p>
          <div style={{ width: 44, height: 2.5, background: GOLD, borderRadius: 2 }} />
        </div>

        <div style={{
          width: 190,
          border: `1.5px solid #E5E7EB`,
          borderRadius: 6,
          padding: "20px 18px",
          textAlign: "center",
          flexShrink: 0,
          background: "#fff",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: GREEN, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10L8 14L16 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 800, color: GREEN,
            letterSpacing: "0.06em", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            {T('docs.eligibility.favorable')}
          </div>
          <p style={{
            fontSize: 9, color: "#4B5563", lineHeight: 1.55, margin: 0,
          }}>
            {resolvedAvis}
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, padding: "28px 40px 0" }}>

        {/* ── RÉSUMÉ DU PROJET ── */}
        <div style={{ marginBottom: 26 }}>
          <SectionBadge
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>}
            label={T('docs.eligibility.resume_title')}
          />
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
            border: "1px solid #E5E7EB", borderRadius: 6, overflow: "hidden",
          }}>
            {[
              { icon: <PersonIcon />, label: T('docs.eligibility.porteur'),    value: porteur },
              { icon: <FolderIcon />, label: T('docs.eligibility.nom_projet'), value: nomProjet },
              { icon: <PinIcon />,    label: T('docs.eligibility.territoire'), value: territoire },
              { icon: <ChartIcon />,  label: T('docs.eligibility.secteur'),    value: secteur },
            ].map((col, i) => (
              <div key={i} style={{
                padding: "16px 14px",
                borderRight: i < 3 ? "1px solid #E5E7EB" : "none",
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", background: "#fff",
              }}>
                <div style={{ marginBottom: 8 }}>{col.icon}</div>
                <div style={{
                  fontSize: 7.5, fontWeight: 600, color: MGRAY,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: 4,
                }}>
                  {col.label}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>
                  {col.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FINANCEMENT + CRITÈRES ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 26 }}>

          {/* Left — Financement */}
          <div>
            <SectionBadge icon={<EuroIcon />} label={T('docs.eligibility.opportunity_title')} />
            <div style={{
              border: "1px solid #E5E7EB", borderRadius: 6,
              padding: "18px 20px", background: "#fff",
            }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  fontSize: 7.5, fontWeight: 600, color: MGRAY,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: 5,
                }}>
                  {T('docs.eligibility.montant_label')}
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 28, fontWeight: 700, color: NAVY,
                  lineHeight: 1, marginBottom: 6,
                }}>
                  {montantPotentiel}
                </div>
                <div style={{ width: 36, height: 2, background: GOLD, borderRadius: 2 }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 7.5, fontWeight: 600, color: MGRAY,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: 4,
                }}>
                  {T('docs.eligibility.taux_label')}
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18, fontWeight: 700, color: GOLD,
                }}>
                  {tauxMin} % – {tauxMax} %
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: 7.5, fontWeight: 600, color: MGRAY,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: 3,
                }}>
                  {T('docs.eligibility.dispositif_label')}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: NAVY }}>
                  {dispositifPrincipal}
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: 7.5, fontWeight: 600, color: MGRAY,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: 3,
                }}>
                  {T('docs.eligibility.organisme_label')}
                </div>
                <div style={{ fontSize: 9.5, color: DGRAY, lineHeight: 1.4 }}>
                  {resolvedOrganisme}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Critères */}
          <div>
            <SectionBadge icon={<ShieldIcon />} label={T('docs.eligibility.criteria_title')} />
            <div style={{
              border: "1px solid #E5E7EB", borderRadius: 6,
              overflow: "hidden", background: "#fff",
            }}>
              {resolvedCriterias.map((c, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < resolvedCriterias.length - 1 ? "1px solid #F3F4F6" : "none",
                }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>
                    <CheckIcon size={15} color={c.ok !== false ? GREEN : "#DC2626"} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: NAVY, marginBottom: 1.5 }}>
                      {c.label}
                    </div>
                    <div style={{ fontSize: 8.5, color: MGRAY, lineHeight: 1.4 }}>
                      {c.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROCHAINES ÉTAPES ── */}
        <div style={{ marginBottom: 32 }}>
          <SectionBadge icon={<ArrowIcon />} label={T('docs.eligibility.next_steps_title')} />
          <div style={{
            borderLeft: `3px solid ${GOLD}`,
            paddingLeft: 18,
            paddingTop: 2,
            paddingBottom: 2,
          }}>
            <p style={{
              fontSize: 10, color: DGRAY, lineHeight: 1.7, margin: 0,
            }}>
              {resolvedNextSteps}
            </p>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        background: LGRAY,
        padding: "14px 40px",
        flexShrink: 0,
        marginTop: "auto",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingBottom: 10,
          borderBottom: "1px solid #E5E7EB",
          marginBottom: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CLogoSquare size={22} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, color: NAVY }}>
              FEDE
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {[
              { icon: "✉", val: contactEmail },
              { icon: "☎", val: contactPhone },
              { icon: "⊕", val: contactWebsite },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 9, color: MGRAY }}>{c.icon}</span>
                <span style={{ fontSize: 8.5, color: DGRAY }}>{c.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 7.5, color: MGRAY }}>
            {T('docs.eligibility.footer_note')}
          </span>
          <span style={{ fontSize: 7.5, color: MGRAY }}>{T('docs.eligibility.confidential')}</span>
          <span style={{ fontSize: 7.5, color: MGRAY }}>1 / 1</span>
        </div>
      </footer>
    </div>
  );
}
