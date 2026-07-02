import { useQuery } from "@tanstack/react-query";

export interface ApiCountry {
  code: string;
  name: string;
  currency: string;
  isEu: boolean;
  sortOrder: number;
  programCount: number;
  flag: string;
  lang: string;
}

export interface ApiProgram {
  id: number;
  countryCode: string;
  name: string;
  type: string;
  description: string | null;
  maxAmountEur: string | null;
  isActive: boolean;
  sortOrder: number;
}

const COUNTRY_META: Record<string, { flag: string; lang: string }> = {
  FR: { flag: "🇫🇷", lang: "fr" },
  ES: { flag: "🇪🇸", lang: "es" },
  IT: { flag: "🇮🇹", lang: "it" },
  PT: { flag: "🇵🇹", lang: "pt" },
  BE: { flag: "🇧🇪", lang: "fr" },
  LU: { flag: "🇱🇺", lang: "fr" },
  DE: { flag: "🇩🇪", lang: "de" },
  AT: { flag: "🇦🇹", lang: "de" },
  NL: { flag: "🇳🇱", lang: "nl" },
  IE: { flag: "🇮🇪", lang: "en" },
  GR: { flag: "🇬🇷", lang: "el" },
  FI: { flag: "🇫🇮", lang: "fi" },
  SK: { flag: "🇸🇰", lang: "sk" },
  SI: { flag: "🇸🇮", lang: "sl" },
  EE: { flag: "🇪🇪", lang: "et" },
  LV: { flag: "🇱🇻", lang: "lv" },
  LT: { flag: "🇱🇹", lang: "lt" },
  CY: { flag: "🇨🇾", lang: "el" },
  MT: { flag: "🇲🇹", lang: "en" },
  HR: { flag: "🇭🇷", lang: "hr" },
  SE: { flag: "🇸🇪", lang: "sv" },
  DK: { flag: "🇩🇰", lang: "da" },
  PL: { flag: "🇵🇱", lang: "pl" },
  RO: { flag: "🇷🇴", lang: "ro" },
  BG: { flag: "🇧🇬", lang: "bg" },
  HU: { flag: "🇭🇺", lang: "hu" },
  CZ: { flag: "🇨🇿", lang: "cs" },
  MQ: { flag: "🇲🇶", lang: "fr" },
  GP: { flag: "🇬🇵", lang: "fr" },
  RE: { flag: "🇷🇪", lang: "fr" },
  NC: { flag: "🇳🇨", lang: "fr" },
  PF: { flag: "🇵🇫", lang: "fr" },
};

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function fetchCountries(): Promise<ApiCountry[]> {
  const res = await fetch(`${API_BASE}/api/countries`);
  if (!res.ok) throw new Error("Failed to fetch countries");
  const data: Omit<ApiCountry, "flag" | "lang">[] = await res.json();
  return data.map((c) => ({
    ...c,
    flag: COUNTRY_META[c.code]?.flag ?? "🏳️",
    lang: COUNTRY_META[c.code]?.lang ?? "fr",
  }));
}

export function useCountries() {
  return useQuery<ApiCountry[]>({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCountryPrograms(code: string | undefined) {
  return useQuery<{ country: ApiCountry; programs: ApiProgram[] }>({
    queryKey: ["country-programs", code],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/countries/${code}/programs`);
      if (!res.ok) throw new Error("Failed to fetch programs");
      return res.json();
    },
    enabled: !!code,
    staleTime: 10 * 60 * 1000,
  });
}
