import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { useLang } from "@/contexts/LangContext";
import type { LangCode } from "@/lib/lang";

interface Props {
  variant?: "light" | "dark";
}

export function LanguageSelector({ variant = "light" }: Props) {
  const { i18n, t } = useTranslation();
  const { switchLang } = useLang();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const current = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dropdownW = Math.min(340, window.innerWidth - 16);
    const rightAligned = rect.right - dropdownW;
    const left = rightAligned < 8 ? 8 - rect.left : undefined;
    const right = rightAligned >= 8 ? 0 : undefined;
    setDropdownStyle({ width: dropdownW, left, right });
  }, [open]);

  const isDark = variant === "dark";

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all border
          ${isDark
            ? "bg-white/10 border-white/15 text-white/80 hover:bg-white/15 hover:text-white"
            : "bg-[#F1F4FA] border-[#DDE2EC] text-[#0D1F3C] hover:bg-white hover:border-[#0D1F3C]/20"
          }`}
        aria-label={t("country_selector.label")}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute mt-2 bg-white border border-[#DDE2EC] rounded-xl shadow-xl z-50 overflow-hidden"
          style={dropdownStyle}
        >
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#8B9BB4] border-b border-[#F1F4FA]">
            {t("country_selector.label")}
          </div>
          <div className="grid grid-cols-2 max-h-[60vh] overflow-y-auto">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  switchLang(lang.code as LangCode);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F1F4FA] transition-colors text-left
                  ${i18n.language === lang.code ? "bg-[#F1F4FA]" : ""}`}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{lang.flag}</span>
                <span className="flex-1 font-medium text-[#0D1F3C] truncate">{lang.label}</span>
                {i18n.language === lang.code && <Check className="w-3 h-3 text-[#FFD500] flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
