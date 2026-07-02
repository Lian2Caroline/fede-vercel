import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch, saveToken, clearToken, loadToken } from "@/lib/api";

interface User {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  territoire: string;
  typePorteur: string;
  organisation?: string;
  role: "user" | "admin";
  emailVerified: boolean;
  createdAt: string;
}

export interface PendingVerification {
  type: "email" | "2fa";
  userId: number;
  email: string;
  prenom: string;
  message: string;
}

interface UpdateProfileData {
  telephone?: string;
  organisation?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  pendingVerification: PendingVerification | null;
  clearPending: () => void;
  kickedOutMessage: string | null;
  clearKickedOutMessage: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithVerifiedCode: (userId: number, code: string) => Promise<void>;
  verifyEmail: (userId: number, code: string) => Promise<void>;
  resendVerification: (userId: number) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

interface RegisterData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  telephone?: string;
  territoire: string;
  typePorteur: string;
  organisation?: string;
}

const USER_KEY = "caps_user_v2";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);
  const [kickedOutMessage, setKickedOutMessage] = useState<string | null>(null);

  const clearPending = useCallback(() => setPendingVerification(null), []);
  const clearKickedOutMessage = useCallback(() => setKickedOutMessage(null), []);

  const refreshUser = useCallback(async () => {
    const token = await loadToken();
    if (!token) { setUser(null); return; }
    try {
      const data = await apiFetch<{ user?: User } | User>("/api/auth/me");
      const u = (data as { user?: User }).user ?? (data as User);
      setUser(u);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch (err: any) {
      if (err?.accountSuspended) {
        setKickedOutMessage("Your account has been suspended by an administrator. Please contact support.");
      } else if (err?.accountDeleted) {
        setKickedOutMessage("Your session is no longer valid. This account no longer exists.");
      }
      setUser(null);
      await AsyncStorage.removeItem(USER_KEY);
      await clearToken();
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (token) {
        const cached = await AsyncStorage.getItem(USER_KEY);
        if (cached) setUser(JSON.parse(cached));
        await refreshUser();
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{
      user?: User; token?: string;
      requiresVerification?: boolean;
      requiresEmailVerification?: boolean;
      userId?: number; message?: string;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Email not verified → show verify email screen
    if (data.requiresEmailVerification) {
      setPendingVerification({
        type: "email",
        userId: data.userId!,
        email,
        prenom: "",
        message: data.message ?? t("auth_fallback.email_not_verified"),
      });
      return;
    }

    // 2FA: new IP
    if (data.requiresVerification) {
      setPendingVerification({
        type: "2fa",
        userId: data.userId!,
        email,
        prenom: "",
        message: data.message ?? t("auth_fallback.code_sent"),
      });
      return;
    }

    await saveToken(data.token!);
    setUser(data.user!);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }, [t]);

  const loginWithVerifiedCode = useCallback(async (userId: number, code: string) => {
    const data = await apiFetch<{ user: User; token: string }>("/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ userId, code }),
    });
    await saveToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setPendingVerification(null);
  }, []);

  const verifyEmail = useCallback(async (userId: number, code: string) => {
    const data = await apiFetch<{ user: User; token: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ userId, code }),
    });
    await saveToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setPendingVerification(null);
  }, []);

  const resendVerification = useCallback(async (userId: number) => {
    await apiFetch("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }, []);

  const register = useCallback(async (formData: RegisterData) => {
    const data = await apiFetch<{
      user?: User; token?: string;
      requiresEmailVerification?: boolean;
      userId?: number; message?: string;
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (data.requiresEmailVerification) {
      setPendingVerification({
        type: "email",
        userId: data.userId!,
        email: formData.email,
        prenom: formData.prenom,
        message: data.message ?? t("auth_fallback.code_sent_email"),
      });
      return;
    }

    await saveToken(data.token!);
    setUser(data.user!);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }, [t]);

  const logout = useCallback(async () => {
    try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch {}
    await clearToken();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
    setPendingVerification(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    const updated = await apiFetch<User>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setUser(updated);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading, pendingVerification, clearPending,
      kickedOutMessage, clearKickedOutMessage,
      login, loginWithVerifiedCode, verifyEmail, resendVerification,
      register, logout, refreshUser, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
