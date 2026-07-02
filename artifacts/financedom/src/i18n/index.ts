import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "./locales/fr.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";
import de from "./locales/de.json";
import nl from "./locales/nl.json";
import en from "./locales/en.json";
import sv from "./locales/sv.json";
import da from "./locales/da.json";
import pl from "./locales/pl.json";
import ro from "./locales/ro.json";
import el from "./locales/el.json";
import hu from "./locales/hu.json";
import fi from "./locales/fi.json";
import sk from "./locales/sk.json";
import hr from "./locales/hr.json";
import lt from "./locales/lt.json";
import bg from "./locales/bg.json";
import lv from "./locales/lv.json";
import sl from "./locales/sl.json";
import et from "./locales/et.json";
import cs from "./locales/cs.json";

const SUPPORTED_CODES = [
  "fr", "es", "it", "pt", "de", "nl", "en", "sv", "da", "pl",
  "ro", "el", "hu", "fi", "sk", "hr", "lt", "bg", "lv", "sl", "et", "cs",
];

const urlPathSeg = typeof window !== "undefined"
  ? window.location.pathname.split("/").filter(Boolean)[0] ?? ""
  : "";
const urlLang = SUPPORTED_CODES.includes(urlPathSeg) ? urlPathSeg : undefined;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      es: { translation: es },
      it: { translation: it },
      pt: { translation: pt },
      de: { translation: de },
      nl: { translation: nl },
      en: { translation: en },
      sv: { translation: sv },
      da: { translation: da },
      pl: { translation: pl },
      ro: { translation: ro },
      el: { translation: el },
      hu: { translation: hu },
      fi: { translation: fi },
      sk: { translation: sk },
      hr: { translation: hr },
      lt: { translation: lt },
      bg: { translation: bg },
      lv: { translation: lv },
      sl: { translation: sl },
      et: { translation: et },
      cs: { translation: cs },
    },
    lng: urlLang,
    fallbackLng: ["en", "fr"],
    supportedLngs: SUPPORTED_CODES,
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "fede_lang",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

export const SUPPORTED_LANGUAGES = [
  { code: "fr", label: "Français",      flag: "🇫🇷", countries: ["FR","MQ","GP","RE","NC","PF","BE","LU"] },
  { code: "es", label: "Español",       flag: "🇪🇸", countries: ["ES"] },
  { code: "it", label: "Italiano",      flag: "🇮🇹", countries: ["IT"] },
  { code: "pt", label: "Português",     flag: "🇵🇹", countries: ["PT"] },
  { code: "de", label: "Deutsch",       flag: "🇩🇪", countries: ["DE","AT"] },
  { code: "nl", label: "Nederlands",    flag: "🇳🇱", countries: ["NL","BE"] },
  { code: "en", label: "English",       flag: "🇮🇪", countries: ["IE","MT"] },
  { code: "sv", label: "Svenska",       flag: "🇸🇪", countries: ["SE"] },
  { code: "da", label: "Dansk",         flag: "🇩🇰", countries: ["DK"] },
  { code: "pl", label: "Polski",        flag: "🇵🇱", countries: ["PL"] },
  { code: "ro", label: "Română",        flag: "🇷🇴", countries: ["RO"] },
  { code: "el", label: "Ελληνικά",      flag: "🇬🇷", countries: ["GR","CY"] },
  { code: "hu", label: "Magyar",        flag: "🇭🇺", countries: ["HU"] },
  { code: "fi", label: "Suomi",         flag: "🇫🇮", countries: ["FI"] },
  { code: "sk", label: "Slovenčina",    flag: "🇸🇰", countries: ["SK"] },
  { code: "hr", label: "Hrvatski",      flag: "🇭🇷", countries: ["HR"] },
  { code: "lt", label: "Lietuvių",      flag: "🇱🇹", countries: ["LT"] },
  { code: "bg", label: "Български",     flag: "🇧🇬", countries: ["BG"] },
  { code: "lv", label: "Latviešu",      flag: "🇱🇻", countries: ["LV"] },
  { code: "sl", label: "Slovenščina",   flag: "🇸🇮", countries: ["SI"] },
  { code: "et", label: "Eesti",         flag: "🇪🇪", countries: ["EE"] },
  { code: "cs", label: "Čeština",       flag: "🇨🇿", countries: ["CZ"] },
];
