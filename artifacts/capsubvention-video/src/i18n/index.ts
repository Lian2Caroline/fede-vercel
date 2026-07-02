import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import de from './locales/de.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import ro from './locales/ro.json';
import el from './locales/el.json';
import hu from './locales/hu.json';
import sv from './locales/sv.json';
import da from './locales/da.json';
import fi from './locales/fi.json';
import sk from './locales/sk.json';
import hr from './locales/hr.json';
import lt from './locales/lt.json';
import bg from './locales/bg.json';
import lv from './locales/lv.json';
import sl from './locales/sl.json';
import et from './locales/et.json';
import cs from './locales/cs.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt },
      it: { translation: it },
      de: { translation: de },
      nl: { translation: nl },
      pl: { translation: pl },
      ro: { translation: ro },
      el: { translation: el },
      hu: { translation: hu },
      sv: { translation: sv },
      da: { translation: da },
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
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'navigator'],
      lookupQuerystring: 'lang',
    },
  });

export default i18n;
