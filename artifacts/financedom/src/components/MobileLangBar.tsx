import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n";

export function MobileLangBar() {
  const { i18n, t } = useTranslation();

  return (
    <div className="border-t border-[#EEF1F7] pt-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B9BB4] mb-2 px-1">
        {t("country_selector.label")}
      </p>
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {SUPPORTED_LANGUAGES.map(lang => {
          const active = i18n.language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                localStorage.setItem("fede_lang", lang.code);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${active
                  ? "bg-[#0D1F3C] text-white border-[#0D1F3C]"
                  : "bg-white text-[#4B5574] border-[#DDE2EC] hover:border-[#0D1F3C]/30 hover:bg-[#F1F4FA]"
                }`}
            >
              <span className="text-sm leading-none">{lang.flag}</span>
              <span>{lang.code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
