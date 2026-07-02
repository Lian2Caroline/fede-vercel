import { useState } from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-gradient-to-br from-[#1a2f5e] to-[#0f1f3d] p-12 text-white shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#b8963e] to-[#d4b96a] flex items-center justify-center font-bold text-white text-sm">FD</div>
            <div>
              <div className="font-extrabold text-white text-lg">FinanceDOM</div>
              <div className="text-white/40 text-xs">Subventions non remboursables</div>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold leading-tight mb-4">Accédez à votre espace personnel</h2>
          <p className="text-white/60 text-base leading-relaxed">Suivez vos dossiers, téléchargez vos documents et recevez les notifications en temps réel.</p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          {[
            { icon: "🔒", label: "Espace sécurisé", desc: "Vos données sont chiffrées et protégées" },
            { icon: "📡", label: "Suivi en temps réel", desc: "Notifications à chaque étape du traitement" },
            { icon: "📎", label: "Dématérialisé", desc: "100% en ligne, aucun déplacement nécessaire" },
          ].map((f) => (
            <div key={f.label} className="flex items-start gap-3 bg-white/6 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-xl">{f.icon}</span>
              <div>
                <div className="text-white font-semibold text-sm">{f.label}</div>
                <div className="text-white/50 text-xs">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-white/25 text-xs">© 2024 FinanceDOM — Tous droits réservés</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1a2f5e] to-[#2e5db3] flex items-center justify-center font-bold text-white text-sm">FD</div>
            <span className="font-extrabold text-[#1a2f5e] text-lg">FinanceDOM</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-[#1a2f5e] mb-1">Connexion</h1>
              <p className="text-gray-500 text-sm">Accédez à votre espace de demande de financement</p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] transition-colors"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-[#1a2f5e]">Mot de passe</label>
                  <a href="#" className="text-xs text-[#2e5db3] hover:underline">Mot de passe oublié ?</a>
                </div>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] transition-colors pr-12"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">
                    {show ? "Cacher" : "Voir"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a2f5e] hover:bg-[#0f1f3d] text-white font-bold py-3.5 rounded-lg transition-colors text-sm"
              >
                Se connecter
              </button>
            </form>

            <div className="relative my-6">
              <div className="border-t border-gray-100" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-gray-400 text-xs">ou</span>
            </div>

            <p className="text-center text-sm text-gray-500">
              Pas encore de compte ?{" "}
              <a href="#" className="text-[#1a2f5e] font-bold hover:underline">Créer un compte</a>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>🔒 Connexion sécurisée SSL</span>
            <span>•</span>
            <a href="#" className="hover:text-gray-600">Mentions légales</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600">CGU</a>
          </div>
        </div>
      </div>
    </div>
  );
}
