import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Mail, RefreshCw, CheckCircle, Lock } from "lucide-react";
import { CSLogo } from "@/components/CSLogo";
import { useTranslation } from "react-i18next";

interface Props {
  userId: number;
  email: string;
  prenom: string;
  message: string;
  type: "email" | "2fa";
  endpoint: string;
  expiresAt?: string;
  onSuccess: (data: { user: any; token: string }) => void;
}

export default function VerifyEmail({ userId, email, prenom, message, type, endpoint, expiresAt, onSuccess }: Props) {
  const { t } = useTranslation();
  const { clearPending } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const submittingRef = useRef(false);

  const getInitialSeconds = () => {
    if (expiresAt) {
      const secs = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      return Math.max(0, secs);
    }
    return type === "email" ? 600 : 300;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialSeconds);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    codeRefs.current[0]?.focus();
    return () => clearInterval(timerRef.current!);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleInput = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
    if (next.every((c) => c !== "")) submitCode(next.join(""));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setCode(paste.split(""));
      codeRefs.current[5]?.focus();
      setTimeout(() => submitCode(paste), 50);
    }
  };

  const submitCode = async (codeStr?: string) => {
    const fullCode = codeStr ?? code.join("");
    if (fullCode.length < 6) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("auth.error_invalid_code"));
      onSuccess(data);
    } catch (err: any) {
      setError(err.message ?? t("auth.error_invalid_code"));
      setCode(["", "", "", "", "", ""]);
      codeRefs.current[0]?.focus();
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (type === "2fa") return;
    setResending(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setResent(true);
        setTimeLeft(600);
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => setResent(false), 4000);
      }
    } catch {}
    finally { setResending(false); }
  };

  const isEmail = type === "email";
  const Icon = isEmail ? Mail : Lock;
  const title = isEmail ? t("auth.verify_email_title") : t("auth.verify_2fa_title");
  const subtitle = isEmail
    ? t("auth.verify_email_subtitle", { name: prenom })
    : t("auth.verify_2fa_subtitle");
  const instruction = isEmail
    ? t("auth.verify_email_instruction")
    : t("auth.verify_2fa_instruction");

  return (
    <div className="min-h-screen bg-[#F1F4FA] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <CSLogo size="md" variant="dark" showText subtitle={t("auth.official_platform")} />
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#F8F9FC] border-2 border-[#DDE2EC] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-[#0D1F3C]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3C] mb-2">{title}</h1>
            <p className="text-[#6B7896] text-sm leading-relaxed">
              {subtitle}<span className="font-semibold text-[#0D1F3C]">{email}</span>.{" "}
              {instruction}
            </p>
            {message && (
              <p className="mt-2 text-xs text-[#8B9BB4] leading-relaxed">{message}</p>
            )}
          </div>

          <div className={`flex items-center justify-center gap-2 text-sm font-semibold mb-5 ${timeLeft <= 60 ? "text-red-500" : "text-[#0D1F3C]"}`}>
            <div className={`w-2 h-2 rounded-full ${timeLeft > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {timeLeft > 0
              ? t("auth.verify_timer_valid", { time: formatTime(timeLeft) })
              : t("auth.verify_timer_expired")}
          </div>

          {resent && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {t("auth.verify_resent", { email })}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { codeRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={timeLeft === 0 || loading}
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 transition-all
                  ${digit ? "border-[#0D1F3C] bg-[#F0F4FF] text-[#0D1F3C]" : "border-[#DDE2EC] bg-[#F8F9FC] text-[#0D1F3C]"}
                  disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-200`}
              />
            ))}
          </div>

          <button
            onClick={() => submitCode()}
            disabled={loading || code.join("").length < 6 || timeLeft === 0}
            className="w-full bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#0D1F3C]/40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md mb-4"
          >
            {loading
              ? t("auth.verify_checking")
              : isEmail
                ? t("auth.verify_submit_email")
                : t("auth.verify_submit_2fa")}
          </button>

          <div className="flex items-start gap-2 bg-[#FFF8F0] border border-[#F0D9A8] rounded-xl px-4 py-3 mb-4">
            <Shield className="w-4 h-4 text-[#FFD500] shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E] leading-relaxed">
              {t("auth.verify_spam")}{" "}
              {t("auth.verify_spam_from")}
            </p>
          </div>

          {isEmail ? (
            <button
              onClick={resendCode}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#6B7896] hover:text-[#0D1F3C] transition-colors py-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              {resending ? t("auth.verify_resending") : t("auth.verify_resend")}
            </button>
          ) : (
            <button
              onClick={clearPending}
              className="w-full text-sm text-[#6B7896] hover:text-[#0D1F3C] transition-colors py-2"
            >
              {t("auth.verify_back_login")}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-[#A0AABF] mt-5">
          {t("auth.verify_legal")}
        </p>
      </div>
    </div>
  );
}
