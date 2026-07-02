import { useState } from "react";
import { AdminLayout } from "../shared/AdminLayout";

const DOSSIERS_ELIGIBLES = [
  { id: "DOS-2024-0131", user: "Paul Tehotu", territoire: "Polynésie française", dispositif: "SEFI Polynésie", montant: "750 000 XPF" },
  { id: "DOS-2024-0128", user: "Amina Moussana", territoire: "Nouvelle-Calédonie", dispositif: "ACE Entrepreneuriat", montant: "300 000 XPF" },
  { id: "DOS-2024-0127", user: "Marie Koutoua", territoire: "Martinique", dispositif: "FEDER Martinique", montant: "85 000 €" },
];

const FRAIS_EMIS = [
  { id: "AF-2024-0125", dossier: "DOS-2024-0126", user: "Thomas Rivière", montant: "400,00 €", emis: "17/01/2024", statut: "Non payé", echeance: "31/01/2024" },
  { id: "AF-2024-0124", dossier: "DOS-2024-0130", user: "Sarah Blandin", montant: "456,00 €", emis: "22/01/2024", statut: "Non payé", echeance: "05/02/2024" },
  { id: "AF-2024-0123", dossier: "DOS-2024-0129", user: "Jean-Marc Céleste", montant: "512,00 €", emis: "21/01/2024", statut: "Payé", echeance: "04/02/2024" },
  { id: "AF-2024-0122", dossier: "DOS-2024-0125", user: "Claire Beaumont", montant: "380,00 €", emis: "12/01/2024", statut: "Payé", echeance: "26/01/2024" },
];

const BASE_ITEMS = [
  { id: "instruction", label: "Frais d'instruction administrative", desc: "Étude de recevabilité et vérification de conformité réglementaire des pièces justificatives au regard des critères d'éligibilité.", ht: 120 },
  { id: "expertise", label: "Expertise technique et financière", desc: "Analyse approfondie de la viabilité économique, de la cohérence du plan de financement et de l'impact du projet par un expert agréé.", ht: 180 },
  { id: "certification", label: "Frais de certification et de montage du dossier", desc: "Certification de la conformité du dossier, formalisation du rapport d'expertise et accompagnement à la préparation des documents de soumission.", ht: 80 },
];

export function AdminFrais() {
  const [selectedDossier, setSelectedDossier] = useState<string | null>(null);
  const [items, setItems] = useState(BASE_ITEMS.map(i => ({ ...i, selected: true, custom: i.ht })));
  const [sent, setSent] = useState(false);

  const dossier = DOSSIERS_ELIGIBLES.find(d => d.id === selectedDossier);
  const totalHT = items.filter(i => i.selected).reduce((acc, i) => acc + i.custom, 0);
  const tva = Math.round(totalHT * 0.2);
  const totalTTC = totalHT + tva;

  if (sent) {
    return (
      <AdminLayout active="frais">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-5">✓</div>
            <h2 className="text-2xl font-extrabold text-[#0f1f3d] mb-2">Avis de frais émis</h2>
            <p className="text-gray-500 text-sm mb-2">L'avis de frais a été envoyé à <strong>{dossier?.user}</strong> par e-mail.</p>
            <p className="text-gray-400 text-xs mb-6">L'utilisateur peut désormais procéder au paiement depuis son espace personnel.</p>
            <button onClick={() => { setSent(false); setSelectedDossier(null); }} className="bg-[#0f1f3d] text-white font-bold px-6 py-3 rounded-lg text-sm hover:bg-[#1a2f5e] transition-colors">
              ← Émettre un autre avis
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="frais">
      <div className="grid grid-cols-12 gap-6">
        {/* Form */}
        <div className="col-span-8 space-y-5">
          {/* Select dossier */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#0f1f3d] text-base mb-4">1. Sélectionner le dossier</h3>
            <div className="space-y-3">
              {DOSSIERS_ELIGIBLES.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDossier(d.id)}
                  className={`w-full text-left px-4 py-4 rounded-xl border transition-colors ${selectedDossier === d.id ? "border-[#0f1f3d] bg-[#0f1f3d]/5" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#0f1f3d] text-sm">{d.id}</div>
                      <div className="text-gray-600 text-xs mt-0.5">{d.user} — {d.territoire}</div>
                      <div className="text-gray-400 text-xs">{d.dispositif}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#0f1f3d] font-extrabold text-sm">{d.montant}</div>
                      <div className="text-xs text-gray-400">Montant demandé</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configure items */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#0f1f3d] text-base mb-1">2. Configurer les postes de frais</h3>
            <p className="text-gray-400 text-xs mb-5">Sélectionnez et ajustez les postes à inclure dans l'avis de frais. Les montants sont en euros HT.</p>
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={item.id} className={`border rounded-xl p-4 transition-colors ${item.selected ? "border-[#0f1f3d]/20 bg-[#f4f6fb]" : "border-gray-100 bg-white opacity-60"}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={e => {
                        const updated = [...items];
                        updated[i] = { ...item, selected: e.target.checked };
                        setItems(updated);
                      }}
                      className="mt-1 accent-[#0f1f3d] w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-[#0f1f3d] text-sm mb-0.5">{item.label}</div>
                      <p className="text-gray-500 text-xs leading-relaxed mb-3">{item.desc}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Montant HT :</span>
                        <input
                          type="number"
                          value={item.custom}
                          disabled={!item.selected}
                          onChange={e => {
                            const updated = [...items];
                            updated[i] = { ...item, custom: parseInt(e.target.value) || 0 };
                            setItems(updated);
                          }}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-24 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 disabled:bg-gray-50 disabled:text-gray-300"
                        />
                        <span className="text-xs text-gray-400">€</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Send button */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#0f1f3d] text-base mb-4">3. Confirmer et envoyer</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm">
              <div className="font-bold text-amber-700 mb-1">⚠ Vérification avant envoi</div>
              <p className="text-amber-700/80 text-xs leading-relaxed">
                L'avis de frais sera envoyé par e-mail à {dossier ? <strong>{dossier.user}</strong> : "l'utilisateur sélectionné"} et sera visible dans son espace personnel. Le traitement du dossier sera suspendu jusqu'au paiement.
              </p>
            </div>
            <button
              onClick={() => dossier && setSent(true)}
              disabled={!selectedDossier}
              className="w-full bg-[#0f1f3d] hover:bg-[#1a2f5e] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
            >
              📨 Émettre et envoyer l'avis de frais
            </button>
          </div>
        </div>

        {/* Preview + historique */}
        <div className="col-span-4 space-y-4">
          {/* Preview */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="font-bold text-[#0f1f3d] text-sm mb-4">Aperçu de la facture</div>
            <div className="space-y-2 text-sm">
              {items.filter(i => i.selected).map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-gray-600 flex-1 pr-2 leading-tight">{item.label}</span>
                  <span className="font-semibold text-[#0f1f3d] whitespace-nowrap">{item.custom.toFixed(2)} €</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-xs text-gray-500"><span>Sous-total HT</span><span className="font-semibold">{totalHT.toFixed(2)} €</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span>TVA 20%</span><span className="font-semibold">{tva.toFixed(2)} €</span></div>
                <div className="flex justify-between text-sm font-extrabold text-[#0f1f3d] border-t border-gray-200 pt-1.5 mt-1">
                  <span>TOTAL TTC</span>
                  <span className="text-[#b8963e]">{totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="font-bold text-[#0f1f3d] text-sm mb-4">Avis de frais émis</div>
            <div className="space-y-3">
              {FRAIS_EMIS.map(f => (
                <div key={f.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs font-bold text-[#0f1f3d]">{f.id}</div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${f.statut === "Payé" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                      {f.statut}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">{f.user} — {f.dossier}</div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400">Émis : {f.emis}</span>
                    <span className="text-xs font-bold text-[#0f1f3d]">{f.montant}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
