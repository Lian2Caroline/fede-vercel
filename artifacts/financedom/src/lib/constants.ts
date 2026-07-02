export const TERRITORIES = [
  // ── France métropolitaine ─────────────────────────────────────────────────
  { id: "france", name: "France", flag: "FR", code: "FR",
    fonds: ["FEDER France 2021–2027", "FSE+ Emploi & Formation", "BPI France", "Plan de Relance", "Banque des Territoires"] },
  // ── Espagne ───────────────────────────────────────────────────────────────
  { id: "espagne", name: "Espagne", flag: "ES", code: "ES",
    fonds: ["FEDER España 2021–2027", "FSE+ España", "CDTI Innovation", "ICO Emprendedores", "Plan de Recuperación"] },
  // ── Italie ────────────────────────────────────────────────────────────────
  { id: "italie", name: "Italie", flag: "IT", code: "IT",
    fonds: ["FEDER Italia 2021–2027", "FSE+ Italia", "Invitalia PMI", "SIMEST Export", "Piano Nazionale Ripresa"] },
  // ── Allemagne ─────────────────────────────────────────────────────────────
  { id: "allemagne", name: "Allemagne", flag: "DE", code: "DE",
    fonds: ["EFRE Deutschland 2021–2027", "ESF+ Deutschland", "KfW Förderbank", "BAFA Energieeffizienz", "Gründungszuschuss"] },
  // ── Portugal ──────────────────────────────────────────────────────────────
  { id: "portugal", name: "Portugal", flag: "PT", code: "PT",
    fonds: ["FEDER Portugal 2030", "FSE+ Portugal", "IAPMEI PME", "Portugal Ventures", "PRR Récupération"] },
  // ── Pays-Bas ──────────────────────────────────────────────────────────────
  { id: "pays-bas", name: "Pays-Bas", flag: "NL", code: "NL",
    fonds: ["EFRO Nederland 2021–2027", "ESF+ Nederland", "RVO Subsidies", "Topsectorenbeleid", "Interreg NWE"] },
  // ── Belgique ──────────────────────────────────────────────────────────────
  { id: "belgique", name: "Belgique", flag: "BE", code: "BE",
    fonds: ["FEDER Wallonie 2021–2027", "FSE+ Belgique", "Sowalfin Garantie", "Innoviris Bruxelles", "VLAIO Flandre"] },
  // ── Pologne ───────────────────────────────────────────────────────────────
  { id: "pologne", name: "Pologne", flag: "PL", code: "PL",
    fonds: ["FEDER Polska 2021–2027", "EFS+ Polska", "Polski Fundusz Rozwoju", "BGK Infrastruktura", "KPO Récupération"] },
  // ── Roumanie ──────────────────────────────────────────────────────────────
  { id: "roumanie", name: "Roumanie", flag: "RO", code: "RO",
    fonds: ["FEDR Romania 2021–2027", "FSE+ Romania", "IMM Invest Romania", "Start-Up Nation", "PNRR Récupération"] },
  // ── Grèce ─────────────────────────────────────────────────────────────────
  { id: "grece", name: "Grèce", flag: "GR", code: "GR",
    fonds: ["FEDER Grèce 2021–2027", "FSE+ Grèce", "ESPA 2021–2027", "TEPIX II Fonds", "TAA Résilience"] },
  // ── Hongrie ───────────────────────────────────────────────────────────────
  { id: "hongrie", name: "Hongrie", flag: "HU", code: "HU",
    fonds: ["FEDER Hongrie 2021–2027", "FSE+ Hongrie", "Széchenyi Tőkealap", "GINOP Compétitivité", "NHP Hajrá"] },
  // ── Suède ─────────────────────────────────────────────────────────────────
  { id: "suede", name: "Suède", flag: "SE", code: "SE",
    fonds: ["FEDER Sverige 2021–2027", "ESF+ Sverige", "Tillväxtverket", "Almi Entreprise", "Vinnova Innovation"] },
  // ── Danemark ──────────────────────────────────────────────────────────────
  { id: "danemark", name: "Danemark", flag: "DK", code: "DK",
    fonds: ["FEDER Danmark 2021–2027", "ESF+ Danmark", "Erhvervsstyrelsen", "EKF Export Kredit", "GreenFund Énergie"] },
  // ── Autriche ──────────────────────────────────────────────────────────────
  { id: "autriche", name: "Autriche", flag: "AT", code: "AT",
    fonds: ["FEDER Österreich 2021–2027", "ESF+ Österreich", "AWS Gründerfonds", "FFG Innovation", "WKO Export"] },
  // ── Finlande ──────────────────────────────────────────────────────────────
  { id: "finlande", name: "Finlande", flag: "FI", code: "FI",
    fonds: ["FEDER Suomi 2021–2027", "ESF+ Suomi", "Business Finland", "Finnvera Garanties", "ELY-Centres"] },
  // ── Irlande ───────────────────────────────────────────────────────────────
  { id: "irlande", name: "Irlande", flag: "IE", code: "IE",
    fonds: ["FEDER Ireland 2021–2027", "ESF+ Ireland", "Enterprise Ireland", "SBCI Finance", "LEO Local Enterprise"] },
  // ── Slovaquie ─────────────────────────────────────────────────────────────
  { id: "slovaquie", name: "Slovaquie", flag: "SK", code: "SK",
    fonds: ["FEDER Slovensko 2021–2027", "ESF+ Slovensko", "SIEA Énergie", "SARIO Investissement", "SBA PME"] },
  // ── Croatie ───────────────────────────────────────────────────────────────
  { id: "croatie", name: "Croatie", flag: "HR", code: "HR",
    fonds: ["FEDER Hrvatska 2021–2027", "ESF+ Hrvatska", "HAMAG-BICRO", "HBOR Banque", "HZZ Emploi"] },
  // ── Lituanie ──────────────────────────────────────────────────────────────
  { id: "lituanie", name: "Lituanie", flag: "LT", code: "LT",
    fonds: ["FEDER Lietuva 2021–2027", "ESF+ Lietuva", "INVEGA Garanties", "MITA Innovation", "LDA Développement"] },
  // ── Bulgarie ──────────────────────────────────────────────────────────────
  { id: "bulgarie", name: "Bulgarie", flag: "BG", code: "BG",
    fonds: ["FEDER България 2021–2027", "ESF+ България", "ББР Banque Dev.", "Fond des Fonds", "NKIZ Export"] },
  // ── Lettonie ──────────────────────────────────────────────────────────────
  { id: "lettonie", name: "Lettonie", flag: "LV", code: "LV",
    fonds: ["FEDER Latvija 2021–2027", "ESF+ Latvija", "ALTUM Garanties", "LIAA Innovation", "CFLA Investissement"] },
  // ── Slovénie ──────────────────────────────────────────────────────────────
  { id: "slovenie", name: "Slovénie", flag: "SI", code: "SI",
    fonds: ["FEDER Slovenija 2021–2027", "ESF+ Slovenija", "Spirit Slovenia", "SID Banka", "SPIRIT Export"] },
  // ── Luxembourg ────────────────────────────────────────────────────────────
  { id: "luxembourg", name: "Luxembourg", flag: "LU", code: "LU",
    fonds: ["FEDER Luxembourg 2021–2027", "FSE+ Luxembourg", "Luxinnovation", "SNCI Finance", "Fit 4 Innovation"] },
  // ── Estonie ───────────────────────────────────────────────────────────────
  { id: "estonie", name: "Estonie", flag: "EE", code: "EE",
    fonds: ["FEDER Eesti 2021–2027", "ESF+ Eesti", "EAS Entreprise", "KredEx Garanties", "Startup Estonia"] },
  // ── Chypre ────────────────────────────────────────────────────────────────
  { id: "chypre", name: "Chypre", flag: "CY", code: "CY",
    fonds: ["FEDER Κύπρος 2021–2027", "ESF+ Κύπρος", "RIEF Innovation", "CIPA Investissement", "Recovery Plan CY"] },
  // ── Malte ─────────────────────────────────────────────────────────────────
  { id: "malte", name: "Malte", flag: "MT", code: "MT",
    fonds: ["FEDER Malta 2021–2027", "ESF+ Malta", "Malta Enterprise", "FinanceMalta", "MFIN Développement"] },
  // ── République tchèque ────────────────────────────────────────────────────
  { id: "republique-tcheque", name: "République tchèque", flag: "CZ", code: "CZ",
    fonds: ["FEDER Česko 2021–2027", "ESF+ Česko", "CzechInvest", "ČMZRB Garantie", "MPO Innovation"] },
  // ── Territoires français d'Outre-Mer (héritage) ───────────────────────────
  { id: "nouvelle-caledonie", name: "Nouvelle-Calédonie", flag: "NC", code: "NC",
    fonds: ["FIDES", "ACE Entrepreneuriat", "Subvention Agricole", "DEFI Jeunes", "Formation Pro"] },
  { id: "martinique", name: "Martinique", flag: "MQ", code: "MQ",
    fonds: ["FEDER 2021–2027", "FSE+ Emploi & Formation", "LEADER Agriculture & Rural", "BPI France Outre-Mer", "Subvention CTM"] },
  { id: "polynesie-francaise", name: "Polynésie française", flag: "PF", code: "PF",
    fonds: ["SEFI", "FDA Archipels", "Tourisme Durable", "ALS Logement", "FSP Solidarité"] },
  { id: "guadeloupe", name: "Guadeloupe", flag: "GP", code: "GP",
    fonds: ["FEDER Guadeloupe", "FSE+", "Plan de Relance", "Subvention Région", "ADIE Microfinancement"] },
  { id: "reunion", name: "La Réunion", flag: "RE", code: "RE",
    fonds: ["FEDER Réunion", "Aide Région Réunion", "FSE+", "NACRE", "DEETS Cohésion"] },
];

export const SECTEURS = [
  "Création d'entreprise", "Innovation & Numérique", "Agriculture & Pêche",
  "Environnement & Énergie", "Tourisme", "Logement social",
  "Formation & Emploi", "Culture & Sport", "Santé & Social", "Autre",
];

export const TYPES_PORTEURS = [
  "Entrepreneur individuel", "Association", "Collectivité", "Entreprise", "Groupement",
];

export const STATUS_COLORS: Record<string, string> = {
  "Nouveau dossier":        "bg-gray-100 text-gray-600 border-gray-200",
  "Soumis":                 "bg-blue-50 text-blue-700 border-blue-200",
  "En instruction":         "bg-amber-50 text-amber-700 border-amber-200",
  "Frais émis":             "bg-orange-50 text-orange-700 border-orange-200",
  "En attente de paiement": "bg-orange-50 text-orange-700 border-orange-200",
  "Paiement reçu":          "bg-teal-50 text-teal-700 border-teal-200",
  "Validé":                 "bg-green-50 text-green-700 border-green-200",
  "Refusé":                 "bg-red-50 text-red-700 border-red-200",
  brouillon:      "bg-gray-100 text-gray-600 border-gray-200",
  soumis:         "bg-blue-50 text-blue-700 border-blue-200",
  en_instruction: "bg-amber-50 text-amber-700 border-amber-200",
  expertise:      "bg-violet-50 text-violet-700 border-violet-200",
  contrat_envoye: "bg-indigo-50 text-indigo-700 border-indigo-200",
  en_attente:     "bg-amber-50 text-amber-700 border-amber-200",
  valide:         "bg-green-50 text-green-700 border-green-200",
  verse:          "bg-teal-50 text-teal-700 border-teal-200",
  rejete:         "bg-red-50 text-red-700 border-red-200",
  manquant:       "bg-red-50 text-red-700 border-red-200",
  paye:           "bg-green-50 text-green-700 border-green-200",
  annule:         "bg-gray-50 text-gray-700 border-gray-200",
};
