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

  return (
    <div className="flex items-center gap-3">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CapSubvention"
      >
        <defs>
          <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D1F3C" />
            <stop offset="100%" stopColor="#1A3561" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A847" />
            <stop offset="100%" stopColor="#B5872A" />
          </linearGradient>
        </defs>

        {/* Outer circle — gold ring */}
        <circle cx="50" cy="50" r="48" fill="url(#goldGrad)" />

        {/* Inner circle — navy background */}
        <circle cx="50" cy="50" r="42" fill="url(#navyGrad)" />

        {/* 5 stars representing the 5 overseas territories — arranged in arc at top */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (-90 + (i - 2) * 22) * (Math.PI / 180);
          const r = 32;
          const cx = 50 + r * Math.cos(angle);
          const cy = 25 + r * Math.sin(angle);
          return (
            <text
              key={i}
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize="9"
              fill="#D4A847"
              opacity="0.7"
            >
              ★
            </text>
          );
        })}

        {/* "CS" letters — main mark */}
        <text
          x="50"
          y="64"
          textAnchor="middle"
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="38"
          letterSpacing="-2"
          fill="url(#goldGrad)"
        >
          CS
        </text>

        {/* Thin bottom decorative line */}
        <rect x="28" y="73" width="44" height="1.5" rx="1" fill="#D4A847" opacity="0.5" />
      </svg>

      {showText && (
        <div>
          <div className={`font-extrabold leading-tight tracking-tight ${titleSize} ${titleColor}`}>
            CapSubvention
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
