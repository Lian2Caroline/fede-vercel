import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, Shield, ArrowLeft, Check, Lock, TrendingUp, FileCheck, Users, AlertOctagon } from "lucide-react";
import { CSLogo } from "@/components/CSLogo";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

const CAP_KICK_MSG_KEY = "cap_kick_msg";
const CAP_KICK_TYPE_KEY = "cap_kick_type";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kickBanner, setKickBanner] = useState<{ msg: string; type: string } | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    const msg = sessionStorage.getItem(CAP_KICK_MSG_KEY);
    const type = sessionStorage.getItem(CAP_KICK_TYPE_KEY) ?? "suspended";
    if (msg) {
      setKickBanner({ msg, type });
      sessionStorage.removeItem(CAP_KICK_MSG_KEY);
      sessionStorage.removeItem(CAP_KICK_TYPE_KEY);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pwd) return;
    setError("");
    setLoading(true);
    try {
      await login({ email, password: pwd });
    } catch (err: any) {
      const d = (err?.data ?? {}) as Record<string, unknown>;
      if (typeof d.remainingAttempts === "number") {
        setError(d.remainingAttempts > 0
          ? t("login.error_invalid_creds", { count: d.remainingAttempts })
          : t("login.error_default"));
      } else if (d.lockedUntil || typeof d.minutesLeft === "number") {
        const mins = typeof d.minutesLeft === "number"
          ? d.minutesLeft
          : Math.max(1, Math.ceil((new Date(d.lockedUntil as string).getTime() - Date.now()) / 60000));
        setError(t("login.error_account_locked", { minutes: mins }));
      } else if (d.vpnDetected) {
        setError(t("login.error_vpn_detected"));
      } else if (d.accountSuspended) {
        setError(t("login.error_suspended"));
      } else {
        setError(err?.message ?? t("login.error_default"));
      }
    } finally {
      setLoading(false);
    }
  };

  const sideFeatures = [
    { icon: TrendingUp, label: t("login.feat1_label"), desc: t("login.feat1_desc") },
    { icon: FileCheck, label: t("login.feat2_label"), desc: t("login.feat2_desc") },
    { icon: Users, label: t("login.feat3_label"), desc: t("login.feat3_desc") },
    { icon: Shield, label: t("login.feat4_label"), desc: t("login.feat4_desc") },
  ];

  return (
    <div className="min-h-screen bg-[#F1F4FA] font-sans flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-gradient-to-br from-[#0D1F3C] to-[#162B52] p-12 text-white shrink-0">
        <div>
          <Link href="/" className="block mb-16 cursor-pointer">
            <CSLogo size="md" variant="light" showText subtitle={t("common.official_platform")} />
          </Link>
          <h2 className="text-3xl font-extrabold leading-tight mb-4">{t("login.side_title")}</h2>
          <p className="text-white/55 text-base leading-relaxed mb-10">{t("login.side_sub")}</p>
          <div className="space-y-3">
            {sideFeatures.map((f) => (
              <div key={f.label} className="flex items-start gap-3 bg-white/6 border border-white/10 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFD500]/25 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-[#FFD500]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{f.label}</div>
                  <div className="text-white/40 text-xs mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 text-white/20 text-xs">
          <span>© {new Date().getFullYear()} FEDE — {t("footer.copyright").split("—")[1]?.trim() || "Tous droits réservés"}</span>
          <span>{t("fees.legal_ref")}</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Top bar: back + language selector */}
          <div className="mb-4 sm:mb-5 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B7896] hover:text-[#0D1F3C] transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("login.back")}
            </Link>
            <LanguageSelector variant="light" />
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden mb-5 sm:mb-8 flex items-center gap-3">
            <CSLogo size="sm" variant="dark" showText subtitle={t("common.official_platform")} />
          </div>

          <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-xl p-5 sm:p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-[#0D1F3C] mb-1">{t("login.title")}</h1>
              <p className="text-[#6B7896] text-sm">{t("login.subtitle")}</p>
            </div>

            {kickBanner && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{kickBanner.msg}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">{t("login.email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm text-[#1A2235] placeholder-[#A0AABF] focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">{t("login.password")}</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm text-[#1A2235] placeholder-[#A0AABF] focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all pr-12"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AABF] hover:text-[#5B6580] transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end -mt-2">
                <Link href="/forgot-password" className="text-xs text-[#6B7896] hover:text-[#0D1F3C] transition-colors">
                  {t("login.forgot")}
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading || !email || !pwd}
                className="w-full bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#0D1F3C]/40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {loading ? t("login.loading") : t("login.submit")}
              </button>
            </form>

            <div className="relative my-6">
              <div className="border-t border-[#F1F4FA]" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[#A0AABF] text-xs">ou</span>
            </div>
            <p className="text-center text-sm text-[#6B7896]">
              {t("login.no_account")}{" "}
              <Link href="/register" className="text-[#0D1F3C] font-bold hover:underline">{t("login.create")}</Link>
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-5 text-xs text-[#A0AABF]">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> SSL 256 bits</span>
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> RGPD</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> 2FA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
