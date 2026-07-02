import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import ar from "./locales/ar.json";
import cs from "./locales/cs.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import hu from "./locales/hu.json";
import id from "./locales/id.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import nl from "./locales/nl.json";
import pl from "./locales/pl.json";
import pt from "./locales/pt.json";
import ro from "./locales/ro.json";
import ru from "./locales/ru.json";
import th from "./locales/th.json";
import tr from "./locales/tr.json";
import uk from "./locales/uk.json";
import vi from "./locales/vi.json";
import zh from "./locales/zh.json";

const deviceLang = Localization.getLocales()[0]?.languageCode ?? "fr";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      cs: { translation: cs },
      de: { translation: de },
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      hi: { translation: hi },
      hu: { translation: hu },
      id: { translation: id },
      it: { translation: it },
      ja: { translation: ja },
      ko: { translation: ko },
      nl: { translation: nl },
      pl: { translation: pl },
      pt: { translation: pt },
      ro: { translation: ro },
      ru: { translation: ru },
      th: { translation: th },
      tr: { translation: tr },
      uk: { translation: uk },
      vi: { translation: vi },
      zh: { translation: zh },
    },
    lng: deviceLang,
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: "v4",
  });

export default i18n;
