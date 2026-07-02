import { useState } from "react";

const TERRITORIES = [
  "Nouvelle-Calédonie", "Martinique", "Polynésie française", "Guadeloupe", "La Réunion"
];

export function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", tel: "", territoire: "", type: "", org: "", pwd: "", confirm: "", cgu: false });

  const up = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1a2f5e] to-[#2e5db3] flex items-center justify-center font-bold text-white text-sm">FD</div>
            <span className="font-extrabold text-[#1a2f5e] text-lg">FinanceDOM</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a2f5e] mb-1">Créer mon compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez des milliers de porteurs de projets bénéficiaires de subventions</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                step === s ? "bg-[#1a2f5e] text-white" : step > s ? "bg-[#1a2f5e]/10 text-[#1a2f5e]" : "bg-white border border-gray-200 text-gray-400"
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step > s ? "bg-green-500 text-white" : step === s ? "bg-white text-[#1a2f5e]" : "bg-gray-200 text-gray-400"}`}>
                  {step > s ? "✓" : s}
                </span>
                <span className="hidden sm:block">{["Identité", "Territoire & Projet", "Sécurité"][i]}</span>
              </div>
              {i < 2 && <div className={`h-px w-8 ${step > s ? "bg-[#1a2f5e]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#1a2f5e] mb-4">Vos informations personnelles</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Prénom *</label>
                  <input value={form.prenom} onChange={e => up("prenom", e.target.value)} placeholder="Marie" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Nom *</label>
                  <input value={form.nom} onChange={e => up("nom", e.target.value)} placeholder="Koutoua" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Adresse e-mail *</label>
                <input type="email" value={form.email} onChange={e => up("email", e.target.value)} placeholder="marie.koutoua@email.com" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Téléphone</label>
                <input type="tel" value={form.tel} onChange={e => up("tel", e.target.value)} placeholder="+596 696 00 00 00" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#1a2f5e] hover:bg-[#0f1f3d] text-white font-bold py-3.5 rounded-lg transition-colors text-sm mt-2">
                Continuer →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#1a2f5e] mb-4">Territoire et type de projet</h2>
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Territoire *</label>
                <select value={form.territoire} onChange={e => up("territoire", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] bg-white">
                  <option value="">Sélectionner votre territoire</option>
                  {TERRITORIES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Type de porteur de projet *</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Personne physique", "Micro-entreprise / Auto-entrepreneur", "PME / Société", "Association / ONG"].map(t => (
                    <button key={t} onClick={() => up("type", t)} className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${form.type === t ? "border-[#1a2f5e] bg-[#1a2f5e]/5 text-[#1a2f5e]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Nom de l'organisation (optionnel)</label>
                <input value={form.org} onChange={e => up("org", e.target.value)} placeholder="Nom de votre entreprise ou association" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50">← Retour</button>
                <button onClick={() => setStep(3)} className="flex-[2] bg-[#1a2f5e] hover:bg-[#0f1f3d] text-white font-bold py-3 rounded-lg transition-colors text-sm">Continuer →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#1a2f5e] mb-4">Sécurisation du compte</h2>
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Mot de passe *</label>
                <input type="password" value={form.pwd} onChange={e => up("pwd", e.target.value)} placeholder="Minimum 8 caractères" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? "bg-orange-400" : "bg-gray-200"}`} />)}
                </div>
                <p className="text-xs text-gray-400 mt-1">Force du mot de passe : Moyen</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Confirmer le mot de passe *</label>
                <input type="password" value={form.confirm} onChange={e => up("confirm", e.target.value)} placeholder="Répétez votre mot de passe" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
              </div>
              <div className="bg-[#f4f6fb] border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.cgu} onChange={e => up("cgu", e.target.checked)} className="mt-0.5 accent-[#1a2f5e]" />
                  <span className="text-sm text-gray-600">J'accepte les <a href="#" className="text-[#1a2f5e] font-semibold underline">Conditions Générales d'Utilisation</a> et la <a href="#" className="text-[#1a2f5e] font-semibold underline">Politique de confidentialité</a>. Je comprends que des frais d'instruction pourront être émis lors du traitement de mon dossier.</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50">← Retour</button>
                <button className="flex-[2] bg-[#b8963e] hover:bg-[#d4b96a] text-white font-bold py-3 rounded-lg transition-colors text-sm">Créer mon compte</button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà inscrit ? <a href="#" className="text-[#1a2f5e] font-bold hover:underline">Se connecter</a>
        </p>
      </div>
    </div>
  );
}
