import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Smartphone, AlertTriangle, Lock } from "lucide-react";
import { CSLogo } from "@/components/CSLogo";

interface Props {
  userId: number;
  email: string;
  message: string;
  onSuccess: (data: { user: any; token: string }) => void;
}

export default function VerifyTotp({ userId, email, message, onSuccess }: Props) {
  const { clearPending } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const apiBase = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    codeRefs.current[0]?.focus();
  }, []);

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
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/admin/verify-totp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, totp: fullCode }),
      });
      const data = await res.json();
      if (res.status === 423) {
        setLockedUntil(data.lockedUntil ?? null);
        setError(data.error ?? "Compte verrouillé.");
        setCode(["", "", "", "", "", ""]);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Code incorrect");
      onSuccess(data);
    } catch (err: any) {
      setError(err.message ?? "Code incorrect ou expiré.");
      setCode(["", "", "", "", "", ""]);
      codeRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const remainingLockMin = lockedUntil
    ? Math.max(0, Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 60000))
    : 0;

  return (
    <div className="min-h-screen bg-[#F1F4FA] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <CSLogo size="md" variant="dark" showText subtitle="Espace Administration" />
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#0D1F3C]/5 border-2 border-[#0D1F3C]/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-[#0D1F3C]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3C] mb-2">Vérification TOTP</h1>
            <p className="text-[#6B7896] text-sm leading-relaxed">
              Ouvrez votre application d'authentification (Google Authenticator, Authy…) et saisissez le code à 6 chiffres pour{" "}
              <span className="font-semibold text-[#0D1F3C]">{email}</span>.
            </p>
            {message && (
              <p className="mt-2 text-xs text-[#8B9BB4] leading-relaxed">{message}</p>
            )}
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-2 bg-[#F0F4FF] border border-[#CBD5E8] rounded-xl px-4 py-3 mb-5">
            <Lock className="w-4 h-4 text-[#0D1F3C] shrink-0" />
            <p className="text-xs text-[#1A2235] leading-relaxed">
              Ce code se renouvelle toutes les <span className="font-semibold">30 secondes</span>. Ne jamais partager ce code.
            </p>
          </div>

          {/* Account locked */}
          {lockedUntil && (
            <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-700">Compte temporairement verrouillé</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Réessayez dans {remainingLockMin} minute{remainingLockMin > 1 ? "s" : ""}.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !lockedUntil && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 6 digit inputs */}
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
                disabled={loading || !!lockedUntil}
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 transition-all
                  ${digit ? "border-[#0D1F3C] bg-[#F0F4FF] text-[#0D1F3C]" : "border-[#DDE2EC] bg-[#F8F9FC] text-[#0D1F3C]"}
                  disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-200`}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={() => submitCode()}
            disabled={loading || code.join("").length < 6 || !!lockedUntil}
            className="w-full bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#0D1F3C]/40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md mb-4"
          >
            {loading ? "Vérification en cours…" : "Confirmer l'accès administrateur →"}
          </button>

          {/* Hint box */}
          <div className="flex items-start gap-2 bg-[#FFF8F0] border border-[#F0D9A8] rounded-xl px-4 py-3 mb-4">
            <Smartphone className="w-4 h-4 text-[#FFD500] shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E] leading-relaxed">
              Applications compatibles : <span className="font-semibold">Google Authenticator</span>, <span className="font-semibold">Authy</span>, <span className="font-semibold">Microsoft Authenticator</span>, <span className="font-semibold">1Password</span>.
            </p>
          </div>

          <button
            onClick={clearPending}
            className="w-full text-sm text-[#6B7896] hover:text-[#0D1F3C] transition-colors py-2"
          >
            ← Revenir à la connexion
          </button>
        </div>

        <p className="text-center text-xs text-[#A0AABF] mt-5">
          Accès réservé aux administrateurs · Toutes les connexions sont journalisées
        </p>
      </div>
    </div>
  );
}
