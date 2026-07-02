import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "caps_auth_token_v1";
let _token: string | null = null;

export async function saveToken(value: string) {
  _token = value;
  await AsyncStorage.setItem(TOKEN_KEY, value);
}

export async function loadToken(): Promise<string | null> {
  if (_token !== null) return _token;
  _token = await AsyncStorage.getItem(TOKEN_KEY);
  return _token;
}

export async function clearToken() {
  _token = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export function getBaseUrl() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "http://localhost:8080";
}

export class ApiError extends Error {
  status: number;
  accountSuspended: boolean;
  accountDeleted: boolean;
  remainingAttempts?: number;
  minutesLeft?: number;
  vpnDetected?: boolean;
  constructor(
    message: string,
    status: number,
    flags?: {
      accountSuspended?: boolean;
      accountDeleted?: boolean;
      remainingAttempts?: number;
      minutesLeft?: number;
      vpnDetected?: boolean;
    },
  ) {
    super(message);
    this.status = status;
    this.name = "ApiError";
    this.accountSuspended = flags?.accountSuspended ?? false;
    this.accountDeleted = flags?.accountDeleted ?? false;
    this.remainingAttempts = flags?.remainingAttempts;
    this.minutesLeft = flags?.minutesLeft;
    this.vpnDetected = flags?.vpnDetected;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await loadToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    let msg = `Erreur ${response.status}`;
    let accountSuspended = false;
    let accountDeleted = false;
    let remainingAttempts: number | undefined;
    let minutesLeft: number | undefined;
    let vpnDetected: boolean | undefined;
    try {
      const j = JSON.parse(text);
      msg = j.error ?? j.message ?? msg;
      accountSuspended = j.accountSuspended === true;
      accountDeleted = j.accountDeleted === true;
      if (typeof j.remainingAttempts === "number") remainingAttempts = j.remainingAttempts;
      if (typeof j.minutesLeft === "number") minutesLeft = j.minutesLeft;
      if (j.vpnDetected === true) vpnDetected = true;
    } catch {}
    throw new ApiError(msg, response.status, { accountSuspended, accountDeleted, remainingAttempts, minutesLeft, vpnDetected });
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function apiUploadFile<T = unknown>(
  path: string,
  file: { uri: string; name: string; mimeType: string },
  fields: Record<string, string>
): Promise<T> {
  const token = await loadToken();
  const formData = new FormData();
  (formData as any).append("file", { uri: file.uri, name: file.name, type: file.mimeType });
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers,
    body: formData as any,
  });

  if (!response.ok) {
    const text = await response.text();
    let msg = `Erreur ${response.status}`;
    try { const j = JSON.parse(text); msg = j.error ?? j.message ?? msg; } catch {}
    throw new ApiError(msg, response.status);
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
