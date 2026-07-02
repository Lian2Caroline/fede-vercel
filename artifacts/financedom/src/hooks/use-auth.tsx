import { createContext, useContext, useState, ReactNode } from "react";
import { useGetMe, useLogin, useRegister, useLogout, User, LoginBody, RegisterBody } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

export interface PendingVerification {
  type: "email" | "2fa" | "totp";
  userId: number;
  email: string;
  prenom: string;
  message: string;
  expiresAt?: string;
}

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  pendingVerification: PendingVerification | null;
  clearPending: () => void;
  login: (data: LoginBody, override?: { token: string; user: User }) => Promise<void>;
  register: (data: RegisterBody) => Promise<void>;
  logout: () => Promise<void>;
  onVerified: (data: { token: string; user: User }) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);

  const clearPending = () => setPendingVerification(null);

  const onVerified = (data: { token: string; user: User }) => {
    queryClient.setQueryData(["/api/auth/me"], data.user);
    setPendingVerification(null);
    setLocation(data.user.role === "admin" ? "/admin" : "/dashboard");
  };

  const login = async (data: LoginBody, override?: { token: string; user: User }) => {
    if (override) {
      queryClient.setQueryData(["/api/auth/me"], override.user);
      setPendingVerification(null);
      setLocation(override.user.role === "admin" ? "/admin" : "/dashboard");
      return;
    }

    const result = await loginMutation.mutateAsync({ data });
    const anyResult = result as any;

    // Email not verified
    if (anyResult?.requiresEmailVerification) {
      setPendingVerification({
        type: "email",
        userId: anyResult.userId,
        email: data.email,
        prenom: "",
        message: anyResult.message ?? t("auth.msg_verify_email"),
      });
      return;
    }

    // Admin TOTP required
    if (anyResult?.requiresTotpVerification) {
      setPendingVerification({
        type: "totp",
        userId: anyResult.userId,
        email: data.email,
        prenom: "",
        message: anyResult.message ?? t("auth.msg_totp_open"),
      });
      return;
    }

    // IP-based 2FA for regular users
    if (anyResult?.requiresVerification) {
      setPendingVerification({
        type: "2fa",
        userId: anyResult.userId,
        email: data.email,
        prenom: "",
        message: anyResult.message ?? t("auth.msg_verify_sent"),
        expiresAt: anyResult.expiresAt,
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    setLocation("/dashboard");
  };

  const register = async (data: RegisterBody) => {
    const result = await registerMutation.mutateAsync({ data });
    const anyResult = result as any;

    if (anyResult?.requiresEmailVerification) {
      setPendingVerification({
        type: "email",
        userId: anyResult.userId,
        email: data.email,
        prenom: data.prenom,
        message: anyResult.message ?? t("auth.msg_verify_email"),
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    setLocation("/dashboard");
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(["/api/auth/me"], null);
    setPendingVerification(null);
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, pendingVerification, clearPending,
      login, register, logout, onVerified,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
