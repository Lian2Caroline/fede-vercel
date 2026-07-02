import React from "react";

type InfoCardVariant = "default" | "highlight" | "muted" | "navy";

interface InfoRow {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

interface InfoCardProps {
  title?: string;
  rows: InfoRow[];
  variant?: InfoCardVariant;
  className?: string;
}

const VARIANT_STYLES: Record<InfoCardVariant, { border: string; bg: string; titleColor: string }> = {
  default:   { border: "#E5E7EB", bg: "#FFFFFF",  titleColor: "#0B1F4D" },
  highlight: { border: "#D4A63A", bg: "#FFFBEB",  titleColor: "#92400E" },
  muted:     { border: "#E5E7EB", bg: "#F9FAFB",  titleColor: "#6B7280" },
  navy:      { border: "#0B1F4D", bg: "#0B1F4D",  titleColor: "#D4A63A" },
};

export function InfoCard({ title, rows, variant = "default", className = "" }: InfoCardProps) {
  const s = VARIANT_STYLES[variant];
  const isNavy = variant === "navy";

  return (
    <div
      className={`doc-info-card ${className}`}
      style={{ borderColor: s.border, backgroundColor: s.bg }}
    >
      {title && (
        <div
          className="doc-info-card-title"
          style={{ color: s.titleColor, borderBottomColor: s.border }}
        >
          {title}
        </div>
      )}
      <div className="doc-info-card-rows">
        {rows.map((row, i) => (
          <div key={i} className="doc-info-row">
            <span
              className="doc-info-label"
              style={{ color: isNavy ? "#D4A63A" : "#6B7280" }}
            >
              {row.label}
            </span>
            <span
              className={`doc-info-value ${row.mono ? "doc-info-mono" : ""}`}
              style={{ color: isNavy ? "#F9FAFB" : "#111827" }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
