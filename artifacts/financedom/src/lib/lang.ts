export const LANG_CODES = new Set([
  "fr", "es", "it", "pt", "de", "nl", "en", "sv", "da", "pl",
  "ro", "el", "hu", "fi", "sk", "hr", "lt", "bg", "lv", "sl", "et", "cs",
] as const);

export type LangCode =
  | "fr" | "es" | "it" | "pt" | "de" | "nl" | "en" | "sv" | "da" | "pl"
  | "ro" | "el" | "hu" | "fi" | "sk" | "hr" | "lt" | "bg" | "lv" | "sl" | "et" | "cs";

export const SITE_URL = "https://www.fede-financement.com";

export const HREFLANG_MAP: Record<LangCode, string> = {
  fr: "fr-FR", es: "es-ES", it: "it-IT", pt: "pt-PT", de: "de-DE",
  nl: "nl-NL", en: "en-GB", sv: "sv-SE", da: "da-DK", pl: "pl-PL",
  ro: "ro-RO", el: "el-GR", hu: "hu-HU", fi: "fi-FI", sk: "sk-SK",
  hr: "hr-HR", lt: "lt-LT", bg: "bg-BG", lv: "lv-LV", sl: "sl-SI",
  et: "et-EE", cs: "cs-CZ",
};

export function isValidLang(code: string): code is LangCode {
  return LANG_CODES.has(code as LangCode);
}

export function getDetectedLang(): LangCode {
  try {
    const stored = localStorage.getItem("fede_lang") ?? "";
    if (isValidLang(stored)) return stored;
  } catch {}
  const browserLang = (navigator.language ?? "").split("-")[0];
  if (isValidLang(browserLang)) return browserLang;
  return "fr";
}

export function getLangFromPathname(pathname: string): LangCode | null {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  return isValidLang(seg) ? seg : null;
}
