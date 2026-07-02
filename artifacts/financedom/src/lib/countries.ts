export interface Country {
  code: string;
  name: string;
  nameFr: string;
  flag: string;
  lang: string;
  currency: "EUR" | "SEK" | "DKK" | "PLN";
  currencySymbol: string;
  feeAmount: number;
  feeHT: number;
  feeTVA: number;
  dispositifs: string[];
}

export const EU_COUNTRIES: Country[] = [
  // ── Zone euro ────────────────────────────────────────────────────────────────
  {
    code: "FR", name: "France", nameFr: "France", flag: "🇫🇷", lang: "fr",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["FEDER 2021–2027", "FSE+ Emploi & Formation", "LEADER Agriculture", "BPI France", "Subvention Région", "Plan de Relance", "NACRE", "DEETS Cohésion"],
  },
  {
    code: "ES", name: "España", nameFr: "Espagne", flag: "🇪🇸", lang: "es",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["FEDER España", "FSE+ Empleo", "LEADER Agrario", "CDTI Innovación", "ICO Financiación", "Subvención Comunidad Autónoma"],
  },
  {
    code: "IT", name: "Italia", nameFr: "Italie", flag: "🇮🇹", lang: "it",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["FESR Italia", "FSE+ Occupazione", "LEADER Agricoltura", "MISE Innovazione", "Invitalia Startup", "Contributo Regionale"],
  },
  {
    code: "PT", name: "Portugal", nameFr: "Portugal", flag: "🇵🇹", lang: "pt",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["PT2030 FEDER", "FSE+ Emprego", "LEADER Agricultura", "IAPMEI Inovação", "Portugal Ventures", "Apoio Regional"],
  },
  {
    code: "BE", name: "België / Belgique", nameFr: "Belgique", flag: "🇧🇪", lang: "fr",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["FEDER Wallonie", "FSE+ Emploi", "LEADER Rural", "Sowalfin Financement", "Innoviris R&D", "Subvention Flandre"],
  },
  {
    code: "LU", name: "Luxembourg", nameFr: "Luxembourg", flag: "🇱🇺", lang: "fr",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["FEDER Luxembourg", "FSE+ Emploi", "Luxinnovation R&D", "SNCI Financement", "Aide PME"],
  },
  {
    code: "DE", name: "Deutschland", nameFr: "Allemagne", flag: "🇩🇪", lang: "de",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["EFRE Deutschland", "ESF+ Beschäftigung", "KfW Förderung", "BAFA Innovationsförderung", "Landesförderung", "LEADER Ländlicher Raum"],
  },
  {
    code: "NL", name: "Nederland", nameFr: "Pays-Bas", flag: "🇳🇱", lang: "nl",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["EFRO Nederland", "ESF+ Werkgelegenheid", "RVO Subsidies", "Innovatiekrediet", "MIT Mkb-innovatiestimulering", "Provinciale Subsidie"],
  },
  {
    code: "AT", name: "Österreich", nameFr: "Autriche", flag: "🇦🇹", lang: "de",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["EFRE Österreich", "ESF+ Beschäftigung", "AWS Förderungen", "FFG Forschungsförderung", "Landesförderung"],
  },
  {
    code: "GR", name: "Ελλάδα", nameFr: "Grèce", flag: "🇬🇷", lang: "el",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["ΕΣΠΑ ΕΤΠΑ", "ΕΚΤ+ Απασχόληση", "Αναπτυξιακός Νόμος", "ΕΠΑνΕΚ Επιχειρηματικότητα"],
  },
  {
    code: "FI", name: "Suomi", nameFr: "Finlande", flag: "🇫🇮", lang: "fi",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["EAKR Suomi", "ESR+ Työllisyys", "Business Finland Avustus", "ELY-keskus Tuki", "LEADER Maaseutu"],
  },
  {
    code: "IE", name: "Ireland", nameFr: "Irlande", flag: "🇮🇪", lang: "en",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["ERDF Ireland", "ESF+ Employment", "Enterprise Ireland Grant", "IDA Ireland Support", "LEADER Rural"],
  },
  {
    code: "SK", name: "Slovensko", nameFr: "Slovaquie", flag: "🇸🇰", lang: "sk",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["ERDF Slovensko", "ESF+ Zamestnanosť", "SARIO Investície", "SIH Finančné Nástroje"],
  },
  {
    code: "SI", name: "Slovenija", nameFr: "Slovénie", flag: "🇸🇮", lang: "sl",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["ESRR Slovenija", "ESS+ Zaposlovanje", "SPS Podjetništvo", "SPIRIT Subvencija"],
  },
  {
    code: "EE", name: "Eesti", nameFr: "Estonie", flag: "🇪🇪", lang: "et",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["ERF Eesti", "ESF+ Tööhõive", "EAS Toetus", "KredEx Laen"],
  },
  {
    code: "LV", name: "Latvija", nameFr: "Lettonie", flag: "🇱🇻", lang: "lv",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["ERAF Latvija", "ESF+ Nodarbinātība", "LIAA Atbalsts", "Altum Finansējums"],
  },
  {
    code: "LT", name: "Lietuva", nameFr: "Lituanie", flag: "🇱🇹", lang: "lt",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["ERPF Lietuva", "ESF+ Užimtumas", "Versli Lietuva Parama", "Invega Finansavimas"],
  },
  {
    code: "CY", name: "Κύπρος", nameFr: "Chypre", flag: "🇨🇾", lang: "el",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["ΕΤΠΑ Κύπρος", "ΕΚΤ+ Απασχόληση", "ΙΔΕΚ Έρευνα"],
  },
  {
    code: "MT", name: "Malta", nameFr: "Malte", flag: "🇲🇹", lang: "en",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["ERDF Malta", "ESF+ Employment", "Malta Enterprise Grant", "MCST Research Fund"],
  },
  {
    code: "HR", name: "Hrvatska", nameFr: "Croatie", flag: "🇭🇷", lang: "hr",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["EFRR Hrvatska", "ESF+ Zapošljavanje", "HAMAG-BICRO Potpore", "HBA Jamstva"],
  },
  // ── Hors zone euro (devises fortes) ──────────────────────────────────────────
  {
    code: "SE", name: "Sverige", nameFr: "Suède", flag: "🇸🇪", lang: "sv",
    currency: "SEK", currencySymbol: "kr", feeAmount: 5200, feeHT: 4333, feeTVA: 867,
    dispositifs: ["ERUF Sverige", "ESF+ Sysselsättning", "Vinnova Bidrag", "Tillväxtverket Stöd", "LEADER Landsbygd"],
  },
  {
    code: "DK", name: "Danmark", nameFr: "Danemark", flag: "🇩🇰", lang: "da",
    currency: "DKK", currencySymbol: "kr", feeAmount: 3400, feeHT: 2833, feeTVA: 567,
    dispositifs: ["EFRU Danmark", "ESF+ Beskæftigelse", "Innovationsfonden Tilskud", "Vækstfonden Finansiering", "LEADER Landdistrikter"],
  },
  {
    code: "PL", name: "Polska", nameFr: "Pologne", flag: "🇵🇱", lang: "pl",
    currency: "PLN", currencySymbol: "zł", feeAmount: 2100, feeHT: 1750, feeTVA: 350,
    dispositifs: ["EFRR Polska", "EFS+ Zatrudnienie", "PARP Dotacje", "BGK Gwarancje", "LEADER Obszary Wiejskie"],
  },
  // ── Territoires français d'outre-mer (conservés) ─────────────────────────────
  {
    code: "MQ", name: "Martinique", nameFr: "Martinique", flag: "🇲🇶", lang: "fr",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["FEDER 2021–2027", "FSE+ Emploi & Formation", "LEADER Agriculture & Rural", "BPI France Outre-Mer", "Subvention CTM"],
  },
  {
    code: "GP", name: "Guadeloupe", nameFr: "Guadeloupe", flag: "🇬🇵", lang: "fr",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["FEDER Guadeloupe", "FSE+", "Plan de Relance", "Subvention Région", "ADIE Microfinancement"],
  },
  {
    code: "RE", name: "La Réunion", nameFr: "La Réunion", flag: "🇷🇪", lang: "fr",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["FEDER Réunion", "Aide Région Réunion", "FSE+", "NACRE", "DEETS Cohésion"],
  },
  {
    code: "NC", name: "Nouvelle-Calédonie", nameFr: "Nouvelle-Calédonie", flag: "🇳🇨", lang: "fr",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["FIDES", "ACE Entrepreneuriat", "Subvention Agricole", "DEFI Jeunes", "Formation Pro"],
  },
  {
    code: "PF", name: "Polynésie française", nameFr: "Polynésie française", flag: "🇵🇫", lang: "fr",
    currency: "EUR", currencySymbol: "€", feeAmount: 456, feeHT: 380, feeTVA: 76,
    dispositifs: ["SEFI", "FDA Archipels", "Tourisme Durable", "ALS Logement", "FSP Solidarité"],
  },
];

export function getCountryByCode(code: string): Country | undefined {
  return EU_COUNTRIES.find(c => c.code === code);
}

export function getCountryByLang(lang: string): Country | undefined {
  return EU_COUNTRIES.find(c => c.lang === lang);
}

export function formatFee(country: Country): string {
  const { feeAmount, currency, currencySymbol } = country;
  if (currency === "EUR") return `${feeAmount.toFixed(2)} €`;
  return `${feeAmount.toLocaleString()} ${currencySymbol} (≈ 456 €)`;
}

export function formatFeeHT(country: Country): string {
  const { feeHT, currency, currencySymbol } = country;
  if (currency === "EUR") return `${feeHT.toFixed(2)} €`;
  return `${feeHT.toLocaleString()} ${currencySymbol}`;
}
