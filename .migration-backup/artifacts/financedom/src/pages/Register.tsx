import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, Shield, Check, ArrowLeft } from "lucide-react";
import { TERRITORIES, TYPES_PORTEURS } from "@/lib/constants";

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", tel: "", territoire: "", type: "", org: "", pwd: "", confirm: "", cgu: false });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const up = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.prenom || !form.nom || !form.email || !form.territoire || !form.type || !form.pwd) return;
    if (form.pwd !== form.confirm) return;
    if (!form.cgu) return;
    setLoading(true);
    try {
      await register({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        password: form.pwd,
        telephone: form.tel,
        territoire: form.territoire,
        typePorteur: form.type,
        organisation: form.org
      });
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Identité", "Territoire & Projet", "Sécurité"];

  return (
    <div className="min-h-screen bg-[#F1F4FA] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B7896] hover:text-[#0D1F3C] transition-colors font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à l'accueil
          </Link>
        </div>

        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-3 mb-5 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D1F3C] to-[#265494] flex items-center justify-center font-bold text-white text-xs shadow-lg">CS</div>
            <div className="text-left">
              <div className="font-extrabold text-[#0D1F3C] text-lg leading-tight">CapSubvention</div>
              <div className="text-[#6B7896] text-[10px]">Plateforme officielle</div>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0D1F3C] mb-1">Créer mon espace personnel</h1>
          <p className="text-[#6B7896] text-sm">Rejoignez des milliers de porteurs de projets bénéficiaires de subventions non remboursables</p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                step === i + 1 ? "bg-[#0D1F3C] text-white shadow-md" : step > i + 1 ? "bg-[#0D1F3C]/10 text-[#0D1F3C]" : "bg-white border border-[#DDE2EC] text-[#A0AABF]"
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-white text-[#0D1F3C]" : "bg-[#DDE2EC] text-[#A0AABF]"
                }`}>
                  {step > i + 1 ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-8 transition-all ${step > i + 1 ? "bg-[#0D1F3C]" : "bg-[#DDE2EC]"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#0D1F3C] mb-4">Vos informations personnelles</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Prénom *</label>
                  <input value={form.prenom} onChange={e => up("prenom", e.target.value)} placeholder="Marie" className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Nom *</label>
                  <input value={form.nom} onChange={e => up("nom", e.target.value)} placeholder="Beaumont" className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Adresse e-mail *</label>
                <input type="email" value={form.email} onChange={e => up("email", e.target.value)} placeholder="marie.beaumont@email.com" className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Téléphone <span className="text-[#A0AABF] font-normal">(optionnel)</span></label>
                <input type="tel" value={form.tel} onChange={e => up("tel", e.target.value)} placeholder="+596 696 00 00 00" className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
              </div>
              <button
                onClick={() => { if(form.prenom && form.nom && form.email) setStep(2) }}
                disabled={!form.prenom || !form.nom || !form.email}
                className="w-full bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#DDE2EC] disabled:text-[#A0AABF] text-white font-bold py-3.5 rounded-xl transition-all text-sm mt-2 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Continuer →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#0D1F3C] mb-4">Territoire et type de projet</h2>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Territoire *</label>
                <select value={form.territoire} onChange={e => up("territoire", e.target.value)} className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all bg-white text-[#1A2235]">
                  <option value="">Sélectionner votre territoire</option>
                  {TERRITORIES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Type de porteur de projet *</label>
                <div className="grid grid-cols-2 gap-3">
                  {TYPES_PORTEURS.map(t => (
                    <button key={t} onClick={() => up("type", t)} className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${form.type === t ? "border-[#0D1F3C] bg-[#0D1F3C]/5 text-[#0D1F3C] shadow-sm" : "border-[#DDE2EC] text-[#4B5574] hover:border-[#0D1F3C]/30 hover:text-[#0D1F3C]"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Nom de l'organisation <span className="text-[#A0AABF] font-normal">(optionnel)</span></label>
                <input value={form.org} onChange={e => up("org", e.target.value)} placeholder="Nom de votre entreprise ou association" className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#DDE2EC] text-[#4B5574] font-semibold py-3 rounded-xl text-sm hover:bg-[#F1F4FA] transition-all">← Retour</button>
                <button
                  onClick={() => { if(form.territoire && form.type) setStep(3) }}
                  disabled={!form.territoire || !form.type}
                  className="flex-[2] bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#DDE2EC] disabled:text-[#A0AABF] text-white font-bold py-3 rounded-xl transition-all text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#0D1F3C] mb-4">Sécurisation du compte</h2>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Mot de passe *</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} value={form.pwd} onChange={e => up("pwd", e.target.value)} placeholder="Minimum 8 caractères" className="w-full border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all pr-12" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AABF] hover:text-[#5B6580]">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0D1F3C] mb-2">Confirmer le mot de passe *</label>
                <input type={show ? "text" : "password"} value={form.confirm} onChange={e => up("confirm", e.target.value)} placeholder="Répétez votre mot de passe" className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${form.confirm && form.pwd !== form.confirm ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-[#DDE2EC] focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C]'}`} />
                {form.confirm && form.pwd !== form.confirm && (
                  <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              <div className="bg-[#F8F9FC] border border-[#DDE2EC] rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.cgu} onChange={e => up("cgu", e.target.checked)} className="mt-0.5 accent-[#0D1F3C] w-4 h-4 shrink-0" />
                  <span className="text-sm text-[#5B6580] leading-relaxed">
                    J'accepte les <span className="text-[#0D1F3C] font-semibold cursor-pointer hover:underline">Conditions Générales d'Utilisation</span> et la <span className="text-[#0D1F3C] font-semibold cursor-pointer hover:underline">Politique de confidentialité</span>. Je comprends que des frais d'instruction de <strong className="text-[#0D1F3C]">456€ TTC</strong> seront émis uniquement en confirmation d'un accord de financement obtenu — je ne paie qu'une fois ma subvention formellement confirmée, conformément à l'Article L1611-2 CGCT.
                  </span>
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} disabled={loading} className="flex-1 border border-[#DDE2EC] text-[#4B5574] font-semibold py-3 rounded-xl text-sm hover:bg-[#F1F4FA] disabled:opacity-50 transition-all">← Retour</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !form.pwd || form.pwd !== form.confirm || !form.cgu}
                  className="flex-[2] bg-[#B5872A] hover:bg-[#C99A30] disabled:bg-[#DDE2EC] disabled:text-[#A0AABF] text-white font-bold py-3 rounded-xl transition-all text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  {loading ? "Création en cours..." : "Créer mon compte"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[#6B7896] mt-6 flex items-center justify-center gap-4">
          <span>Déjà inscrit ? <Link href="/login" className="text-[#0D1F3C] font-bold hover:underline">Se connecter</Link></span>
          <span className="flex items-center gap-1 text-[#A0AABF] text-xs"><Shield className="w-3 h-3" /> Inscription 100% gratuite</span>
        </p>
      </div>
    </div>
  );
}
