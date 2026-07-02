import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { CSLogo } from "@/components/CSLogo";
import { useTranslation } from "react-i18next";

const BASE = import.meta.env.VITE_API_URL ?? "";

export default function ResetPassword() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = password === confirm;
  const isStrong = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !isStrong || !token) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("auth.reset_invalid_desc"));
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? t("auth.forgot_error"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F1F4FA] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0D1F3C] mb-2">{t("auth.reset_invalid_title")}</h2>
          <p className="text-[#6B7896] text-sm mb-4">{t("auth.reset_invalid_desc")}</p>
          <Link href="/forgot-password" className="text-[#0D1F3C] font-semibold hover:underline text-sm">
            {t("auth.reset_new_link")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F4FA] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="cursor-pointer">
            <CSLogo size="md" variant="dark" showText subtitle={t("auth.official_platform")} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0D1F3C] mb-3">{t("auth.reset_success_title")}</h2>
              <p className="text-[#6B7896] text-sm leading-relaxed mb-6">
                {t("auth.reset_success_desc")}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full bg-[#0D1F3C] hover:bg-[#162B52] text-white font-bold py-3.5 rounded-xl transition-all text-sm"
              >
                {t("auth.reset_success_login")}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-[#6B7896] text-sm hover:text-[#0D1F3C] transition-colors mb-5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("auth.reset_back")}
                </Link>
                <h1 className="text-2xl font-extrabold text-[#0D1F3C] mb-1">{t("auth.reset_title")}</h1>
                <p className="text-[#6B7896] text-sm">{t("auth.reset_subtitle")}</p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">{t("auth.reset_new_pwd")}</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm text-[#1A2235] placeholder-[#A0AABF] focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all pr-12"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AABF] hover:text-[#5B6580]">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && !isStrong && (
                    <p className="text-red-500 text-xs mt-1.5">{t("auth.reset_min_chars")}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">{t("auth.reset_confirm_pwd")}</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm text-[#1A2235] placeholder-[#A0AABF] focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all pr-12"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AABF] hover:text-[#5B6580]">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && !passwordsMatch && (
                    <p className="text-red-500 text-xs mt-1.5">{t("auth.reset_mismatch")}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isStrong || !passwordsMatch || !password || !confirm}
                  className="w-full bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#0D1F3C]/40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg active:scale-[0.98] mt-2"
                >
                  {loading ? t("auth.reset_saving") : t("auth.reset_submit")}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center">
          <span className="flex items-center gap-1.5 text-xs text-[#A0AABF]">
            <Shield className="w-3 h-3" /> {t("auth.reset_secure")}
          </span>
        </div>
      </div>
    </div>
  );
}
