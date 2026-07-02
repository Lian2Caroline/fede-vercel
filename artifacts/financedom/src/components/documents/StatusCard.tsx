import React from "react";

type StatusVariant = "success" | "pending" | "info" | "warning" | "rejected";

interface StatusCardProps {
  status: string;
  label: string;
  description?: string;
  variant?: StatusVariant;
  className?: string;
}

const VARIANT_STYLES: Record<StatusVariant, {
  border: string; bg: string; dot: string; statusColor: string; labelColor: string;
}> = {
  success:  { border: "#16A34A", bg: "#F0FDF4", dot: "#16A34A", statusColor: "#166534", labelColor: "#15803D" },
  pending:  { border: "#D97706", bg: "#FFFBEB", dot: "#D97706", statusColor: "#92400E", labelColor: "#B45309" },
  info:     { border: "#0B1F4D", bg: "#EFF6FF", dot: "#0B1F4D", statusColor: "#1E3A5F", labelColor: "#1E40AF" },
  warning:  { border: "#DC2626", bg: "#FEF2F2", dot: "#DC2626", statusColor: "#991B1B", labelColor: "#B91C1C" },
  rejected: { border: "#6B7280", bg: "#F9FAFB", dot: "#6B7280", statusColor: "#374151", labelColor: "#6B7280" },
};

export function StatusCard({
  status,
  label,
  description,
  variant = "info",
  className = "",
}: StatusCardProps) {
  const s = VARIANT_STYLES[variant];

  return (
    <div
      className={`doc-status-card ${className}`}
      style={{ borderColor: s.border, backgroundColor: s.bg }}
    >
      <div className="doc-status-left" style={{ backgroundColor: s.border }} />
      <div className="doc-status-body">
        <div className="doc-status-top">
          <span className="doc-status-dot" style={{ backgroundColor: s.dot }} />
          <span className="doc-status-label" style={{ color: s.statusColor }}>{label}</span>
        </div>
        <p className="doc-status-status" style={{ color: s.labelColor }}>{status}</p>
        {description && (
          <p className="doc-status-desc">{description}</p>
        )}
      </div>
    </div>
  );
}
