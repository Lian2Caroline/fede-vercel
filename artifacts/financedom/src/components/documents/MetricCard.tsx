import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  accent?: "gold" | "navy" | "green";
  className?: string;
}

const ACCENT_COLORS = {
  gold:  { line: "#D4A63A", value: "#0B1F4D" },
  navy:  { line: "#0B1F4D", value: "#0B1F4D" },
  green: { line: "#16A34A", value: "#166534" },
};

export function MetricCard({
  label,
  value,
  unit,
  description,
  accent = "gold",
  className = "",
}: MetricCardProps) {
  const colors = ACCENT_COLORS[accent];

  return (
    <div className={`doc-metric-card ${className}`}>
      <div className="doc-metric-accent-line" style={{ backgroundColor: colors.line }} />
      <div className="doc-metric-body">
        <p className="doc-metric-label">{label}</p>
        <div className="doc-metric-value-row">
          <span className="doc-metric-value" style={{ color: colors.value }}>
            {value}
          </span>
          {unit && <span className="doc-metric-unit">{unit}</span>}
        </div>
        {description && <p className="doc-metric-desc">{description}</p>}
      </div>
    </div>
  );
}
