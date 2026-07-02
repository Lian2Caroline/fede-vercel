import { useState } from "react";
import { UserLayout } from "../shared/UserLayout";

const TERRITORIES = [
  { name: "Martinique", flag: "🇲🇶", fonds: ["FEDER 2021–2027", "FSE+ Emploi & Formation", "LEADER Agriculture & Rural", "BPI France Outre-Mer", "Subvention CTM"] },
  { name: "Guadeloupe", flag: "🇬🇵", fonds: ["FEDER Guadeloupe", "FSE+", "Plan de Relance", "Subvention Région", "ADIE Microfinancement"] },
  { name: "La Réunion", flag: "🇷🇪", fonds: ["FEDER Réunion", "Aide Région Réunion", "FSE+", "NACRE", "DEETS Cohésion"] },
  { name: "Nouvelle-Calédonie", flag: "🇳🇨", fonds: ["FIDES", "ACE Entrepreneuriat", "Subvention Agricole", "DEFI Jeunes", "Formation Pro"] },
  { name: "Polynésie française", flag: "🇵🇫", fonds: ["SEFI", "FDA Archipels", "Tourisme Durable", "ALS Logement", "FSP Solidarité"] },
];

const SECTEURS = ["Création d'entreprise", "Innovation & Numérique", "Agriculture & Pêche", "Environnement & Énergie", "Tourisme", "Logement social", "Formation & Emploi", "Culture & Sport", "Santé & Social", "Autre"];

export function UserDossier() {
  const [step, setStep] = useState(1);
  const [terr, setTerr] = useState<string | null>(null);
  const [fond, setFond] = useState<string | null>(null);
  const [secteur, setSecteur] = useState("");
  const [form, setForm] = useState({ titre: "", desc: "", montant: "", apport: "", debut: "", duree: "" });

  const territory = TERRITORIES.find(t => t.name === terr);
  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <UserLayout active="dossier">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {["Territoire & Dispositif", "Présentation du projet", "Plan financier", "Validation & Envoi"].map((s, i) => (
          <div key={s} className="flex items-center shrink-0">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              step === i + 1 ? "bg-[#1a2f5e] text-white" :
              step > i + 1 ? "bg-green-100 text-green-700" :
              "bg-gray-100 text-gray-400"
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                step > i + 1 ? "bg-green-500 text-white" :
                step === i + 1 ? "bg-white text-[#1a2f5e]" :
                "bg-gray-300 text-gray-500"
              }`}>
                {step > i + 1 ? "✓" : i + 1}
              </span>
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < 3 && <div className={`h-px w-6 shrink-0 ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-extrabold text-[#1a2f5e]">Sélectionnez votre territoire et le dispositif souhaité</h2>
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">Votre territoire *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TERRITORIES.map(t => (
                      <button key={t.name} onClick={() => { setTerr(t.name); setFond(null); }} className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-colors ${terr === t.name ? "border-[#1a2f5e] bg-[#1a2f5e]/5 text-[#1a2f5e]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        <span className="text-xl">{t.flag}</span>
                        <span className="leading-tight text-xs">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {territory && (
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">Dispositif de financement *</label>
                    <div className="space-y-2">
                      {territory.fonds.map(f => (
                        <button key={f} onClick={() => setFond(f)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${fond === f ? "border-[#1a2f5e] bg-[#1a2f5e]/5 text-[#1a2f5e] font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {fond && (
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">Secteur d'activité *</label>
                    <select value={secteur} onChange={e => setSecteur(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]">
                      <option value="">Choisir un secteur</option>
                      {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <button onClick={() => terr && fond && secteur && setStep(2)} disabled={!terr || !fond || !secteur} className="w-full bg-[#1a2f5e] hover:bg-[#0f1f3d] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-lg transition-colors text-sm">
                  Continuer → Présenter le projet
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-extrabold text-[#1a2f5e]">Présentation du projet</h2>
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Intitulé du projet *</label>
                  <input value={form.titre} onChange={e => up("titre", e.target.value)} placeholder="Ex : Création d'un restaurant traditionnel martiniquais" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Description détaillée du projet *</label>
                  <textarea value={form.desc} onChange={e => up("desc", e.target.value)} rows={6} placeholder="Décrivez votre projet en précisant : ses objectifs, son impact économique ou social, le public cible, et les emplois créés si applicable..." className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] resize-none" />
                  <div className="text-right text-xs text-gray-400 mt-1">{form.desc.length} / 2000 caractères recommandés</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Date de début prévue *</label>
                    <input type="date" value={form.debut} onChange={e => up("debut", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Durée du projet</label>
                    <select value={form.duree} onChange={e => up("duree", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]">
                      <option value="">Sélectionner</option>
                      {["6 mois", "12 mois", "18 mois", "24 mois", "36 mois", "+ 36 mois"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50">← Retour</button>
                  <button onClick={() => setStep(3)} className="flex-[2] bg-[#1a2f5e] hover:bg-[#0f1f3d] text-white font-bold py-3 rounded-lg transition-colors text-sm">Continuer →</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-extrabold text-[#1a2f5e]">Plan de financement prévisionnel</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Coût total du projet (€) *</label>
                    <input type="number" value={form.montant} onChange={e => up("montant", e.target.value)} placeholder="100 000" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Apport personnel (€) *</label>
                    <input type="number" value={form.apport} onChange={e => up("apport", e.target.value)} placeholder="15 000" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
                  </div>
                </div>
                {form.montant && (
                  <div className="bg-[#f4f6fb] border border-gray-200 rounded-xl p-4 text-sm">
                    <div className="font-semibold text-[#1a2f5e] mb-2">Estimation du financement demandé</div>
                    <div className="flex justify-between text-gray-600"><span>Coût total :</span><span className="font-bold">{parseInt(form.montant || "0").toLocaleString("fr-FR")} €</span></div>
                    <div className="flex justify-between text-gray-600"><span>Apport personnel :</span><span className="font-bold">- {parseInt(form.apport || "0").toLocaleString("fr-FR")} €</span></div>
                    <div className="flex justify-between text-[#1a2f5e] font-extrabold border-t border-gray-200 mt-2 pt-2"><span>Subvention demandée :</span><span>{(parseInt(form.montant || "0") - parseInt(form.apport || "0")).toLocaleString("fr-FR")} €</span></div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Justification budgétaire</label>
                  <textarea rows={4} placeholder="Détaillez l'utilisation des fonds : équipements, travaux, charges salariales, fonds de roulement..." className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50">← Retour</button>
                  <button onClick={() => setStep(4)} className="flex-[2] bg-[#1a2f5e] hover:bg-[#0f1f3d] text-white font-bold py-3 rounded-lg transition-colors text-sm">Vérifier et soumettre →</button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-lg font-extrabold text-[#1a2f5e]">Récapitulatif et envoi</h2>
                <div className="space-y-3">
                  {[
                    { label: "Territoire", val: terr || "—" },
                    { label: "Dispositif", val: fond || "—" },
                    { label: "Secteur", val: secteur || "—" },
                    { label: "Intitulé", val: form.titre || "—" },
                    { label: "Montant demandé", val: form.montant ? `${parseInt(form.montant).toLocaleString("fr-FR")} €` : "—" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center py-2.5 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{r.label}</span>
                      <span className="text-sm font-semibold text-[#1a2f5e]">{r.val}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#fff8e8] border border-[#e8d9a0] rounded-xl p-4 text-sm">
                  <div className="font-bold text-[#7a5a2a] mb-1">⚠ Information sur les frais d'instruction</div>
                  <p className="text-[#7a5a2a]/80 leading-relaxed">Après soumission, votre dossier sera pris en charge par un expert agréé. Des frais d'instruction réglementaires seront émis par l'administration pour couvrir l'expertise technique et la certification de votre demande. Vous en serez informé par e-mail.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50">← Retour</button>
                  <button className="flex-[2] bg-[#b8963e] hover:bg-[#d4b96a] text-white font-bold py-3 rounded-lg transition-colors text-sm">✉ Soumettre le dossier</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: help */}
        <div className="col-span-4 space-y-4">
          <div className="bg-[#1a2f5e] rounded-xl p-5 text-white">
            <div className="font-bold text-base mb-1">Besoin d'aide ?</div>
            <p className="text-white/60 text-sm mb-4">Notre équipe est disponible pour vous accompagner dans la constitution de votre dossier.</p>
            <button className="w-full bg-white/10 border border-white/20 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-white/20 transition-colors">✉ Contacter un conseiller</button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="font-bold text-[#1a2f5e] text-sm mb-3">Documents requis</div>
            <div className="space-y-2 text-sm text-gray-600">
              {["Pièce d'identité valide", "Justificatif de domicile", "Description du projet", "Plan de financement", "RIB bancaire", "Statuts / Kbis (si société)"].map(d => (
                <div key={d} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-400">○</span>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
