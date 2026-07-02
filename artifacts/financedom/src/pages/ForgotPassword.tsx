import { useState } from "react";
import { Link } from "wouter";
import { Shield, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { CSLogo } from "@/components/CSLogo";
import { useTranslation } from "react-i18next";

const BASE = import.meta.env.VITE_API_URL ?? "";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t("auth.forgot_error"));
      }
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? t("auth.forgot_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F4FA] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="cursor-pointer">
            <CSLogo size="md" variant="dark" showText subtitle={t("auth.official_platform")} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0D1F3C] mb-3">{t("auth.forgot_sent_title")}</h2>
              <p className="text-[#6B7896] text-sm leading-relaxed mb-6">
                {t("auth.forgot_sent_desc", { email })}
              </p>
              <p className="text-[#8B9BB4] text-xs mb-6">
                {t("auth.forgot_spam")}
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-[#0D1F3C] font-semibold text-sm hover:underline">
                <ArrowLeft className="w-4 h-4" />
                {t("auth.forgot_back")}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-[#6B7896] text-sm hover:text-[#0D1F3C] transition-colors mb-5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("auth.forgot_back")}
                </Link>
                <h1 className="text-2xl font-extrabold text-[#0D1F3C] mb-1">{t("auth.forgot_title")}</h1>
                <p className="text-[#6B7896] text-sm leading-relaxed">
                  {t("auth.forgot_subtitle")}
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">{t("auth.forgot_email_label")}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AABF]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="w-full border border-[#DDE2EC] rounded-xl pl-11 pr-4 py-3 text-sm text-[#1A2235] placeholder-[#A0AABF] focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#0D1F3C]/40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  {loading ? t("auth.forgot_sending") : t("auth.forgot_submit")}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-5 text-xs text-[#A0AABF]">
          <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> SSL 256 bits</span>
          <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> @fede-financement.com</span>
        </div>
      </div>
    </div>
  );
}
