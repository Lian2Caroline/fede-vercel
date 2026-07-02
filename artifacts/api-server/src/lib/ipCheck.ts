import crypto from "crypto";

interface IpInfo {
  isVpn: boolean;
  isProxy: boolean;
  isHosting: boolean;
  continent: string;
  continentCode: string;
  countryCode: string;
  country: string;
  isp: string;
}

// Simple in-memory cache (IP → { info, expiresAt })
const cache = new Map<string, { info: IpInfo; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// African continent country codes (ISO 3166-1 alpha-2)
// Excluded: RE (Réunion), YT (Mayotte) — French territories located in Africa
const AFRICAN_COUNTRIES = new Set([
  "DZ","AO","BJ","BW","BF","BI","CM","CV","CF","TD","KM","CD","CG","CI",
  "DJ","EG","GQ","ER","SZ","ET","GA","GM","GH","GN","GW","KE","LS","LR",
  "LY","MG","MW","ML","MR","MU","MA","MZ","NA","NE","NG","RW","ST","SN",
  "SL","SO","ZA","SS","SD","TZ","TG","TN","UG","ZM","ZW","EH","SC",
]);

// French territories (always allowed for registration)
const FRENCH_TERRITORIES = new Set([
  "FR","GP","MQ","GF","RE","YT","PM","BL","MF","NC","PF","WF","TF",
]);

async function fetchIpInfo(ip: string): Promise<IpInfo | null> {
  // Skip checks for localhost / private IPs
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.") ||
    ip === "unknown"
  ) {
    return {
      isVpn: false, isProxy: false, isHosting: false,
      continent: "Unknown", continentCode: "XX",
      countryCode: "XX", country: "Local",
      isp: "Local",
    };
  }

  try {
    // ip-api.com free tier — HTTP only, 45 req/min
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,continent,continentCode,country,countryCode,isp,proxy,hosting`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json() as any;
    if (data.status !== "success") return null;

    return {
      isVpn: !!(data.proxy),
      isProxy: !!(data.proxy),
      isHosting: !!(data.hosting),
      continent: data.continent ?? "Unknown",
      continentCode: data.continentCode ?? "XX",
      countryCode: data.countryCode ?? "XX",
      country: data.country ?? "Unknown",
      isp: data.isp ?? "Unknown",
    };
  } catch {
    return null;
  }
}

export async function getIpInfo(ip: string): Promise<IpInfo | null> {
  const cached = cache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.info;

  const info = await fetchIpInfo(ip);
  if (info) {
    cache.set(ip, { info, expiresAt: Date.now() + CACHE_TTL_MS });
    // Limit cache size
    if (cache.size > 5000) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
  }
  return info;
}

/** Returns true if the IP is from Africa (excluding French territories RE, YT) */
export function isAfricanIp(info: IpInfo): boolean {
  if (FRENCH_TERRITORIES.has(info.countryCode)) return false;
  return AFRICAN_COUNTRIES.has(info.countryCode) || info.continentCode === "AF";
}

/** Returns true if the IP appears to be a VPN, proxy, or datacenter host */
export function isVpnOrProxy(info: IpInfo): boolean {
  return info.isVpn || info.isProxy || info.isHosting;
}
