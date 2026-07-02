import React from "react";

type DocBadge = "OFFICIEL" | "CONFIDENTIEL" | "PROVISOIRE" | "ARCHIVE";

interface DocumentHeaderProps {
  title: string;
  subtitle?: string;
  reference: string;
  date: string;
  territory?: string;
  badge?: DocBadge;
}

function FedeLogoSvg({ size = 34 }: { size?: number }) {
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

const BADGE_STYLES: Record<DocBadge, { bg: string; text: string; label: string }> = {
  OFFICIEL:      { bg: "#0B1F4D", text: "#ffffff",  label: "DOCUMENT OFFICIEL" },
  CONFIDENTIEL:  { bg: "#7F1D1D", text: "#ffffff",  label: "CONFIDENTIEL" },
  PROVISOIRE:    { bg: "#78350F", text: "#ffffff",  label: "PROVISOIRE" },
  ARCHIVE:       { bg: "#374151", text: "#ffffff",  label: "ARCHIVE" },
};

export function DocumentHeader({
  title,
  subtitle,
  reference,
  date,
  territory,
  badge = "OFFICIEL",
}: DocumentHeaderProps) {
  const b = BADGE_STYLES[badge];

  return (
    <header className="doc-header">
      <div className="doc-header-band">
        <div className="doc-header-logo">
          <FedeLogoSvg size={34} />
          <span className="doc-logo-cap">FEDE</span>
        </div>
        <div className="doc-header-meta">
          {territory && <span className="doc-meta-territory">{territory}</span>}
          <span className="doc-meta-ref">Réf. {reference}</span>
          <span className="doc-meta-date">{date}</span>
        </div>
      </div>

      <div className="doc-header-title-zone">
        <div className="doc-header-title-left">
          <div
            className="doc-badge"
            style={{ backgroundColor: b.bg, color: b.text }}
          >
            {b.label}
          </div>
          <h1 className="doc-title">{title}</h1>
          {subtitle && <p className="doc-subtitle">{subtitle}</p>}
        </div>
        <div className="doc-header-gold-line" />
      </div>
    </header>
  );
}
