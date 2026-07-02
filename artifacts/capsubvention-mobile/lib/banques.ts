export interface Banque {
  slug: string;
  nom: string;
  pays: string;
  couleur: string;
  couleurTexte: string;
  logo: string;
}

export const BANQUES: Banque[] = [
  // ── France ────────────────────────────────────────────────────────────────
  {
    slug: "bnp-paribas",
    nom: "BNP Paribas",
    pays: "France",
    couleur: "#009B44",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#009B44"/>
      <text x="10" y="26" font-family="Arial" font-size="13" font-weight="900" fill="#FFFFFF">BNP</text>
      <text x="44" y="26" font-family="Arial" font-size="13" font-weight="400" fill="#FFFFFF">PARIBAS</text>
      <rect x="104" y="8" width="10" height="10" rx="2" fill="#FFFFFF" opacity="0.5"/>
      <rect x="104" y="22" width="10" height="10" rx="2" fill="#FFFFFF" opacity="0.9"/>
    </svg>`,
  },
  {
    slug: "societe-generale",
    nom: "Société Générale",
    pays: "France",
    couleur: "#E60028",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#E60028"/>
      <circle cx="20" cy="20" r="12" fill="none" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="20" cy="20" r="6" fill="#FFFFFF"/>
      <text x="38" y="26" font-family="Arial" font-size="11" font-weight="800" fill="#FFFFFF">Sté Générale</text>
    </svg>`,
  },
  {
    slug: "credit-agricole",
    nom: "Crédit Agricole",
    pays: "France",
    couleur: "#008C45",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#008C45"/>
      <polygon points="18,28 12,18 24,18" fill="#FFFFFF"/>
      <polygon points="24,18 18,8 30,8" fill="#FFFFFF" opacity="0.7"/>
      <text x="36" y="26" font-family="Arial" font-size="11" font-weight="800" fill="#FFFFFF">Crédit Agricole</text>
    </svg>`,
  },
  {
    slug: "la-banque-postale",
    nom: "La Banque Postale",
    pays: "France",
    couleur: "#FFCC00",
    couleurTexte: "#003189",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#FFCC00"/>
      <text x="10" y="16" font-family="Arial" font-size="8" font-weight="800" fill="#003189">LA BANQUE</text>
      <text x="10" y="29" font-family="Arial" font-size="8" font-weight="800" fill="#003189">POSTALE</text>
      <rect x="95" y="10" width="18" height="20" rx="3" fill="#003189" opacity="0.15"/>
      <path d="M95 18 L113 18" stroke="#003189" stroke-width="2"/>
    </svg>`,
  },
  {
    slug: "bpce",
    nom: "BPCE / Natixis",
    pays: "France",
    couleur: "#002D62",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#002D62"/>
      <rect x="10" y="10" width="20" height="20" rx="3" fill="#E8871E"/>
      <text x="38" y="26" font-family="Arial" font-size="14" font-weight="900" fill="#FFFFFF">BPCE</text>
    </svg>`,
  },
  {
    slug: "cic",
    nom: "CIC",
    pays: "France",
    couleur: "#1A3C6E",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#1A3C6E"/>
      <text x="30" y="28" font-family="Arial" font-size="20" font-weight="900" fill="#FFFFFF">CIC</text>
      <circle cx="14" cy="20" r="7" fill="#E30613"/>
    </svg>`,
  },
  {
    slug: "lcl",
    nom: "LCL",
    pays: "France",
    couleur: "#FDD000",
    couleurTexte: "#003188",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#FDD000"/>
      <text x="30" y="29" font-family="Arial" font-size="22" font-weight="900" fill="#003188">LCL</text>
      <circle cx="14" cy="20" r="8" fill="#003188"/>
      <text x="10" y="25" font-family="Arial" font-size="10" font-weight="900" fill="#FDD000">€</text>
    </svg>`,
  },
  {
    slug: "caisse-epargne",
    nom: "Caisse d'Épargne",
    pays: "France",
    couleur: "#7AB800",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#7AB800"/>
      <path d="M10 28 Q14 12 18 20 Q22 28 26 20 Q30 12 34 28" stroke="#FFFFFF" stroke-width="3" fill="none"/>
      <text x="40" y="26" font-family="Arial" font-size="10" font-weight="800" fill="#FFFFFF">Caisse d'Épargne</text>
    </svg>`,
  },
  {
    slug: "boursorama",
    nom: "Boursorama Banque",
    pays: "France",
    couleur: "#0072BC",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#0072BC"/>
      <text x="10" y="26" font-family="Arial" font-size="12" font-weight="900" fill="#FFFFFF">Boursorama</text>
    </svg>`,
  },
  // ── Europe ─────────────────────────────────────────────────────────────────
  {
    slug: "ing",
    nom: "ING",
    pays: "Pays-Bas / Europe",
    couleur: "#FF6200",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#FF6200"/>
      <text x="35" y="28" font-family="Arial" font-size="22" font-weight="900" fill="#FFFFFF">ING</text>
      <path d="M16 20 Q14 14 20 14 Q26 14 24 20 Q22 26 20 28 Q18 26 16 20Z" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    slug: "revolut",
    nom: "Revolut",
    pays: "Europe (fintech)",
    couleur: "#191C1F",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#191C1F"/>
      <text x="16" y="26" font-family="Arial" font-size="14" font-weight="900" fill="#FFFFFF">Revolut</text>
    </svg>`,
  },
  {
    slug: "deutsche-bank",
    nom: "Deutsche Bank",
    pays: "Allemagne",
    couleur: "#0018A8",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#0018A8"/>
      <rect x="10" y="10" width="20" height="20" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
      <path d="M15 20 L25 20 M20 15 L20 25" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="36" y="26" font-family="Arial" font-size="10" font-weight="800" fill="#FFFFFF">Deutsche Bank</text>
    </svg>`,
  },
  {
    slug: "santander",
    nom: "Santander",
    pays: "Espagne / Europe",
    couleur: "#CC0000",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#CC0000"/>
      <circle cx="20" cy="20" r="11" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="36" y="26" font-family="Arial" font-size="12" font-weight="800" fill="#FFFFFF">Santander</text>
    </svg>`,
  },
  {
    slug: "unicredit",
    nom: "UniCredit",
    pays: "Italie / Europe",
    couleur: "#E2001A",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#E2001A"/>
      <text x="10" y="26" font-family="Arial" font-size="14" font-weight="900" fill="#FFFFFF">UniCredit</text>
    </svg>`,
  },
  {
    slug: "rabobank",
    nom: "Rabobank",
    pays: "Pays-Bas",
    couleur: "#FF6E00",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#FF6E00"/>
      <rect x="10" y="12" width="16" height="16" rx="8" fill="#FFFFFF"/>
      <text x="34" y="26" font-family="Arial" font-size="13" font-weight="800" fill="#FFFFFF">Rabobank</text>
    </svg>`,
  },
  {
    slug: "kbc",
    nom: "KBC Bank",
    pays: "Belgique",
    couleur: "#00629F",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#00629F"/>
      <text x="28" y="28" font-family="Arial" font-size="16" font-weight="900" fill="#FFFFFF">KBC</text>
      <rect x="10" y="10" width="14" height="20" rx="2" fill="#FFFFFF" opacity="0.3"/>
    </svg>`,
  },
  {
    slug: "nordea",
    nom: "Nordea",
    pays: "Nordique / Europe",
    couleur: "#00245D",
    couleurTexte: "#FFFFFF",
    logo: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="120" height="40" rx="6" fill="#00245D"/>
      <text x="28" y="27" font-family="Arial" font-size="14" font-weight="800" fill="#FFFFFF">Nordea</text>
      <circle cx="14" cy="20" r="7" fill="#3ECBD4"/>
    </svg>`,
  },
];

export function getBanqueBySlug(slug: string): Banque | undefined {
  return BANQUES.find(b => b.slug === slug);
}
