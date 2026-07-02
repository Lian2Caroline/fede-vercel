import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, Shield, Bell, ArrowRight, ArrowLeft, Check, Lock } from "lucide-react";
import { CSLogo } from "@/components/CSLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pwd) return;
    setError("");
    setLoading(true);
    try {
      await login({ email, password: pwd });
    } catch (err: any) {
      setError(err?.message ?? "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const sideFeatures = [
    { icon: Shield, label: "Espace 100% sécurisé", desc: "Données chiffrées, hébergement en France" },
    { icon: Lock, label: "Vérification en 2 étapes", desc: "Code envoyé par email à chaque connexion depuis un nouvel appareil" },
    { icon: Bell, label: "Notifications en temps réel", desc: "Alertes à chaque étape de votre dossier" },
    { icon: ArrowRight, label: "Processus entièrement en ligne", desc: "Sans déplacement, disponible 24h/24" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F4FA] font-sans flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-gradient-to-br from-[#0D1F3C] to-[#162B52] p-12 text-white shrink-0">
        <div>
          <Link href="/" className="block mb-16 cursor-pointer">
            <CSLogo size="md" variant="light" showText subtitle="Plateforme officielle" />
          </Link>
          <h2 className="text-3xl font-extrabold leading-tight mb-4">Accédez à votre espace personnel</h2>
          <p className="text-white/55 text-base leading-relaxed mb-10">
            Suivez vos dossiers de financement, téléchargez vos documents et recevez les notifications en temps réel.
          </p>
          <div className="space-y-3">
            {sideFeatures.map((f) => (
              <div key={f.label} className="flex items-start gap-3 bg-white/6 border border-white/10 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#B5872A]/25 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-[#D4A847]" />
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
          <span>© 2025 CapSubvention — Tous droits réservés</span>
          <span>Article L1611-2 CGCT — Données RGPD</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <div className="mb-5">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B7896] hover:text-[#0D1F3C] transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <CSLogo size="sm" variant="dark" showText subtitle="Plateforme officielle" />
          </div>

          <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-xl p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-[#0D1F3C] mb-1">Connexion</h1>
              <p className="text-[#6B7896] text-sm">Accédez à votre espace de demande de financement non remboursable.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Adresse e-mail</label>
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
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Mot de passe</label>
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
                  Mot de passe oublié ?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading || !email || !pwd}
                className="w-full bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#0D1F3C]/40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {loading ? "Vérification…" : "Se connecter à mon espace"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="border-t border-[#F1F4FA]" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[#A0AABF] text-xs">ou</span>
            </div>
            <p className="text-center text-sm text-[#6B7896]">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-[#0D1F3C] font-bold hover:underline">Créer un compte gratuit</Link>
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-5 text-xs text-[#A0AABF]">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> SSL 256 bits</span>
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> RGPD conforme</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> 2FA activé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
