interface CSLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  showText?: boolean;
  subtitle?: string;
}

export function CSLogo({
  size = "md",
  variant = "dark",
  showText = true,
  subtitle,
}: CSLogoProps) {
  const dim = size === "sm" ? 32 : size === "lg" ? 52 : 40;
  const titleSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const subSize = size === "sm" ? "text-[9px]" : "text-[10px]";
  const titleColor = variant === "light" ? "text-white" : "text-[#0D1F3C]";
  const subColor = variant === "light" ? "text-white/50" : "text-[#6B7896]";

  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    return {
      cx: +(50 + 40 * Math.cos(angle)).toFixed(2),
      cy: +(50 + 40 * Math.sin(angle)).toFixed(2),
    };
  });

  return (
    <div className="flex items-center gap-3">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FEDE"
      >
        <circle cx="50" cy="50" r="50" fill="#0D1F3C" />
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="3.5" fill="#FFD500" opacity="0.85" />
        ))}
        <circle cx="50" cy="50" r="30" fill="#162B52" />
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="40"
          fill="#FFD500"
        >
          F
        </text>
      </svg>

      {showText && (
        <div>
          <div
            className={`font-black leading-tight ${titleSize} ${titleColor}`}
            style={{ letterSpacing: "0.14em" }}
          >
            FEDE
          </div>
          {subtitle && (
            <div className={`leading-tight hidden sm:block ${subSize} ${subColor}`}>
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
