import { useState } from "react";
import { UserLayout } from "../shared/UserLayout";

export function UserPaiement() {
  const [step, setStep] = useState<"facture" | "paiement" | "confirmation">("facture");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", nom: "" });
  const up = (k: string, v: string) => setCard(c => ({ ...c, [k]: v }));

  return (
    <UserLayout active="paiement">
      {/* Alert */}
      <div className="bg-[#fff8e8] border border-[#e8d9a0] rounded-xl p-4 flex items-start gap-3 mb-6">
        <span className="text-[#b8963e] text-xl shrink-0 mt-0.5">⚠</span>
        <div>
          <div className="font-bold text-[#7a5a2a] text-sm">Paiement des frais d'instruction requis</div>
          <p className="text-[#7a5a2a]/80 text-sm mt-0.5">Le traitement de votre dossier <strong>DOS-2024-0127</strong> est suspendu dans l'attente du paiement des frais d'instruction. Une fois réglés, l'instruction reprendra sous 48h ouvrées.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          {step === "facture" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Invoice header */}
              <div className="bg-[#1a2f5e] px-8 py-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded bg-[#b8963e] flex items-center justify-center font-bold text-sm">FD</div>
                      <span className="font-extrabold text-white text-lg">FinanceDOM</span>
                    </div>
                    <div className="text-white/50 text-xs">Service d'instruction et d'expertise</div>
                    <div className="text-white/50 text-xs">subventions@financedom.fr</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Avis de frais</div>
                    <div className="font-extrabold text-2xl">N° AF-2024-0127</div>
                    <div className="text-white/50 text-xs mt-1">Émis le 22/01/2024</div>
                    <div className="text-white/50 text-xs">Échéance : 05/02/2024</div>
                  </div>
                </div>
              </div>

              {/* Recipient */}
              <div className="px-8 py-5 border-b border-gray-100 bg-[#f4f6fb]">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Destinataire</div>
                    <div className="font-bold text-[#1a2f5e] text-sm">Mme Marie Koutoua</div>
                    <div className="text-gray-500 text-xs">Martinique, France</div>
                    <div className="text-gray-500 text-xs">Dossier : DOS-2024-0127</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Objet</div>
                    <div className="font-bold text-[#1a2f5e] text-sm">FEDER Martinique 2021–2027</div>
                    <div className="text-gray-500 text-xs">Création d'un restaurant traditionnel</div>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="px-8 py-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-2 pr-4 font-semibold">Désignation</th>
                      <th className="text-right text-xs text-gray-400 uppercase tracking-wide py-2 font-semibold">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { label: "Frais d'instruction administrative du dossier\nÉtude de recevabilité et vérification de conformité réglementaire des pièces justificatives au regard des critères d'éligibilité FEDER.", montant: "120,00 €" },
                      { label: "Expertise technique et financière du projet\nAnalyse approfondie de la viabilité économique, de la cohérence du plan de financement et de l'impact du projet par un expert agréé par l'organisme gestionnaire.", montant: "180,00 €" },
                      { label: "Frais de certification et de montage du dossier\nCertification de la conformité du dossier, formalisation du rapport d'expertise et accompagnement à la préparation des documents de soumission auprès de la Collectivité Territoriale de Martinique.", montant: "80,00 €" },
                    ].map((item, i) => (
                      <tr key={i} className="py-3">
                        <td className="py-3 pr-4 text-gray-700 text-xs leading-relaxed whitespace-pre-line">{item.label}</td>
                        <td className="py-3 text-right font-semibold text-[#1a2f5e] whitespace-nowrap">{item.montant}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-8 py-5 border-t border-gray-200 bg-[#f4f6fb]">
                <div className="flex justify-end">
                  <div className="w-56 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Sous-total HT</span><span className="font-semibold">380,00 €</span></div>
                    <div className="flex justify-between text-gray-600"><span>TVA 20%</span><span className="font-semibold">76,00 €</span></div>
                    <div className="flex justify-between text-[#1a2f5e] font-extrabold text-base border-t-2 border-[#1a2f5e]/20 pt-2">
                      <span>TOTAL TTC</span>
                      <span className="text-[#b8963e]">456,00 €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal note */}
              <div className="px-8 py-4 border-t border-gray-100 bg-white">
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong>Base légale :</strong> Ces frais d'instruction sont fondés sur l'article L1611-2 du Code Général des Collectivités Territoriales et les décrets encadrant la procédure d'instruction des demandes de subventions publiques. Ils correspondent aux coûts réels d'expertise et d'accompagnement administratif engagés dans le traitement de votre dossier de demande de financement européen.
                </p>
              </div>

              <div className="px-8 pb-6">
                <button onClick={() => setStep("paiement")} className="w-full bg-[#b8963e] hover:bg-[#d4b96a] text-white font-bold py-3.5 rounded-xl text-sm transition-colors mt-2">
                  Procéder au paiement — 456,00 €
                </button>
              </div>
            </div>
          )}

          {step === "paiement" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("facture")} className="text-gray-400 hover:text-gray-600 text-sm">← Retour</button>
                <h2 className="text-lg font-extrabold text-[#1a2f5e]">Paiement sécurisé</h2>
                <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-semibold"><span>🔒</span> SSL Sécurisé</span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Numéro de carte *</label>
                  <input value={card.num} onChange={e => up("num", e.target.value)} placeholder="0000 0000 0000 0000" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] tracking-widest" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Date d'expiration *</label>
                    <input value={card.exp} onChange={e => up("exp", e.target.value)} placeholder="MM/AA" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Cryptogramme *</label>
                    <input value={card.cvv} onChange={e => up("cvv", e.target.value)} placeholder="CVV" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Nom du titulaire *</label>
                  <input value={card.nom} onChange={e => up("nom", e.target.value)} placeholder="NOM PRÉNOM" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] uppercase" />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <div className="flex-1 bg-[#f4f6fb] rounded-xl px-5 py-4 border border-gray-100">
                  <div className="text-xs text-gray-400 mb-0.5">Montant à régler</div>
                  <div className="text-xl font-extrabold text-[#b8963e]">456,00 €</div>
                  <div className="text-xs text-gray-400 mt-0.5">Frais d'instruction N° AF-2024-0127</div>
                </div>
              </div>

              <button onClick={() => setStep("confirmation")} className="w-full bg-[#1a2f5e] hover:bg-[#0f1f3d] text-white font-bold py-4 rounded-xl text-sm transition-colors mt-6">
                🔒 Confirmer le paiement de 456,00 €
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Paiement 100% sécurisé — Vos données bancaires sont chiffrées et ne sont jamais stockées.</p>
            </div>
          )}

          {step === "confirmation" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-5">✓</div>
              <h2 className="text-2xl font-extrabold text-[#1a2f5e] mb-2">Paiement confirmé</h2>
              <p className="text-gray-500 text-sm mb-6">Votre paiement de <strong>456,00 €</strong> a bien été enregistré. Un reçu vous a été envoyé par e-mail. L'instruction de votre dossier reprend sous <strong>48h ouvrées</strong>.</p>
              <div className="bg-[#f4f6fb] border border-gray-200 rounded-xl p-4 text-left mb-6 text-sm">
                <div className="flex justify-between mb-1"><span className="text-gray-500">Référence paiement</span><span className="font-bold text-[#1a2f5e]">PAY-2024-01220</span></div>
                <div className="flex justify-between mb-1"><span className="text-gray-500">Date</span><span className="font-semibold">23/01/2024 à 15h04</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Montant</span><span className="font-bold text-green-600">456,00 €</span></div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50">Télécharger le reçu</button>
                <button className="flex-[2] bg-[#1a2f5e] text-white font-bold py-3 rounded-lg text-sm hover:bg-[#0f1f3d]">Voir mon dossier →</button>
              </div>
            </div>
          )}
        </div>

        {/* Right info */}
        <div className="col-span-5 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-[#1a2f5e] text-sm mb-3">Pourquoi ces frais ?</h3>
            <p className="text-gray-600 text-xs leading-relaxed mb-3">
              Les frais d'instruction sont une pratique réglementée et encadrée par le droit français dans le cadre de l'instruction des demandes de financement public. Ils couvrent trois types de prestations obligatoires :
            </p>
            <div className="space-y-3">
              {[
                { titre: "Étude de recevabilité", desc: "Vérification que votre dossier répond aux critères d'éligibilité du dispositif choisi." },
                { titre: "Expertise technique agréée", desc: "Analyse par un expert certifié de la viabilité de votre projet et de la cohérence de son plan financier." },
                { titre: "Certification et montage", desc: "Formalisation du rapport d'expertise et préparation de la soumission officielle auprès de l'organisme financeur." },
              ].map(item => (
                <div key={item.titre} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1a2f5e]/10 text-[#1a2f5e] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <div>
                    <div className="font-semibold text-[#1a2f5e] text-xs">{item.titre}</div>
                    <div className="text-gray-500 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f4f6fb] border border-gray-200 rounded-xl p-5 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-500 text-base">🔒</span>
              <span className="font-bold text-[#1a2f5e] text-sm">Paiement sécurisé</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">Votre paiement est protégé par un chiffrement SSL 256 bits. Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="font-bold text-[#1a2f5e] text-sm mb-2">Besoin d'aide ?</div>
            <p className="text-gray-500 text-xs mb-3">Pour toute question concernant ces frais d'instruction, contactez notre service administratif.</p>
            <div className="text-xs text-gray-600 space-y-1">
              <div>✉ support@financedom.fr</div>
              <div>📞 0800 000 XXX (numéro gratuit)</div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
