import React from "react";

type AccentColor = "gold" | "navy" | "green" | "gray";
type Level = 1 | 2 | 3;

interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  level?: Level;
  accent?: AccentColor;
  className?: string;
}

const ACCENT_COLORS: Record<AccentColor, string> = {
  gold:  "#D4A63A",
  navy:  "#0B1F4D",
  green: "#16A34A",
  gray:  "#9CA3AF",
};

export function SectionTitle({
  children,
  subtitle,
  level = 2,
  accent = "gold",
  className = "",
}: SectionTitleProps) {
  const color = ACCENT_COLORS[accent];
  const Tag = (`h${level}`) as keyof JSX.IntrinsicElements;

  return (
    <div className={`doc-section-title ${className}`}>
      <div className="doc-section-accent" style={{ backgroundColor: color }} />
      <div className="doc-section-text">
        <Tag className={`doc-section-heading doc-section-h${level}`}>
          {children}
        </Tag>
        {subtitle && <p className="doc-section-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
