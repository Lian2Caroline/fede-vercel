import { useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { useListFrais, usePayFrais, useGetDashboardStats } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Lock, Download, ChevronLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function UserPaiement() {
  const { data: stats } = useGetDashboardStats();
  const dossierId = stats?.dossierActif?.id;

  const { data: fraisList = [], isLoading } = useListFrais(dossierId as number, { query: { enabled: !!dossierId } });
  const pendingFrais = fraisList.find(f => f.statut === "en_attente");
  const paidFrais = fraisList.filter(f => f.statut === "paye");
  
  const [step, setStep] = useState<"facture" | "paiement" | "confirmation">("facture");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", nom: "" });
  const payFraisMutation = usePayFrais();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!pendingFrais || !dossierId) return;
    try {
      await payFraisMutation.mutateAsync({
        id: pendingFrais.id,
        data: {
          cardNumber: card.num,
          cardExpiry: card.exp,
          cardCvv: card.cvv,
          cardName: card.nom
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dossiers", dossierId, "frais"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setStep("confirmation");
    } catch (err) {
      toast({ title: "Erreur", description: "Le paiement a échoué.", variant: "destructive" });
    }
  };

  if (!dossierId) {
    return (
      <UserLayout>
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-bold text-[#1a2f5e]">Aucun dossier actif</h3>
          <p className="text-gray-500 text-sm">Créez un dossier pour gérer vos paiements.</p>
        </div>
      </UserLayout>
    );
  }

  if (isLoading) {
    return <UserLayout><div className="animate-pulse h-96 bg-gray-200 rounded-xl" /></UserLayout>;
  }

  return (
    <UserLayout>
      {pendingFrais && step !== "confirmation" && (
        <div className="bg-[#fff8e8] border border-[#e8d9a0] rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-[#b8963e] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#7a5a2a] text-sm">Paiement des frais d'instruction requis</div>
            <p className="text-[#7a5a2a]/80 text-sm mt-0.5">Le traitement de votre dossier {stats?.dossierActif?.reference} est suspendu dans l'attente du paiement des frais d'instruction. Une fois réglés, l'instruction reprendra sous 48h ouvrées.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          {!pendingFrais && paidFrais.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#1a2f5e] mb-2">Aucun frais à payer</h3>
              <p className="text-gray-500 text-sm">Vous n'avez aucun avis de frais en attente de paiement.</p>
            </div>
          )}

          {pendingFrais && step === "facture" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#1a2f5e] px-8 py-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded bg-[#B5872A] flex items-center justify-center font-bold text-sm text-white">CS</div>
                      <span className="font-extrabold text-white text-lg">CapSubvention</span>
                    </div>
                    <div className="text-white/50 text-xs">Service d'instruction et d'expertise</div>
                    <div className="text-white/50 text-xs">support@capsubvention.com</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Avis de frais</div>
                    <div className="font-extrabold text-xl">{pendingFrais.reference}</div>
                    <div className="text-white/50 text-xs mt-1">Émis le {new Date(pendingFrais.createdAt).toLocaleDateString("fr-FR")}</div>
                    <div className="text-white/50 text-xs">Échéance : {new Date(pendingFrais.echeance).toLocaleDateString("fr-FR")}</div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 border-b border-gray-100 bg-[#f4f6fb]">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Destinataire</div>
                    <div className="font-bold text-[#1a2f5e] text-sm">Porteur de projet</div>
                    <div className="text-gray-500 text-xs">Dossier : {stats?.dossierActif?.reference}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Objet</div>
                    <div className="font-bold text-[#1a2f5e] text-sm">{stats?.dossierActif?.dispositif}</div>
                    <div className="text-gray-500 text-xs">{stats?.dossierActif?.titre}</div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-2 pr-4 font-semibold">Désignation</th>
                      <th className="text-right text-xs text-gray-400 uppercase tracking-wide py-2 font-semibold">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="py-3">
                      <td className="py-3 pr-4 text-gray-700 text-xs leading-relaxed whitespace-pre-line">
                        Frais d'instruction administrative du dossier{"\n"}
                        Étude de recevabilité et vérification de conformité.
                      </td>
                      <td className="py-3 text-right font-semibold text-[#1a2f5e] whitespace-nowrap">120,00 €</td>
                    </tr>
                    <tr className="py-3">
                      <td className="py-3 pr-4 text-gray-700 text-xs leading-relaxed whitespace-pre-line">
                        Expertise technique et financière du projet{"\n"}
                        Analyse approfondie de la viabilité économique.
                      </td>
                      <td className="py-3 text-right font-semibold text-[#1a2f5e] whitespace-nowrap">180,00 €</td>
                    </tr>
                    <tr className="py-3">
                      <td className="py-3 pr-4 text-gray-700 text-xs leading-relaxed whitespace-pre-line">
                        Frais de certification et de montage du dossier{"\n"}
                        Certification de la conformité du dossier.
                      </td>
                      <td className="py-3 text-right font-semibold text-[#1a2f5e] whitespace-nowrap">80,00 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-8 py-5 border-t border-gray-200 bg-[#f4f6fb]">
                <div className="flex justify-end">
                  <div className="w-56 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Sous-total HT</span><span className="font-semibold">{pendingFrais.montantHT.toFixed(2)} €</span></div>
                    <div className="flex justify-between text-gray-600"><span>TVA 20%</span><span className="font-semibold">{pendingFrais.montantTVA.toFixed(2)} €</span></div>
                    <div className="flex justify-between text-[#1a2f5e] font-extrabold text-base border-t-2 border-[#1a2f5e]/20 pt-2">
                      <span>TOTAL TTC</span>
                      <span className="text-[#b8963e]">{pendingFrais.montantTTC.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-6">
                <button onClick={() => setStep("paiement")} className="w-full bg-[#b8963e] hover:bg-[#d4b96a] text-white font-bold py-3.5 rounded-xl text-sm transition-colors mt-4">
                  Procéder au paiement — {pendingFrais.montantTTC.toFixed(2)} €
                </button>
              </div>
            </div>
          )}

          {pendingFrais && step === "paiement" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("facture")} className="text-gray-400 hover:text-gray-600 text-sm flex items-center">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <h2 className="text-lg font-extrabold text-[#1a2f5e] ml-auto mr-auto">Paiement sécurisé</h2>
                <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><Lock className="w-3 h-3" /> SSL</span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Numéro de carte *</label>
                  <input 
                    value={card.num} 
                    onChange={e => setCard(c => ({...c, num: e.target.value}))} 
                    placeholder="0000 0000 0000 0000" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] tracking-widest" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Date d'expiration *</label>
                    <input 
                      value={card.exp} 
                      onChange={e => setCard(c => ({...c, exp: e.target.value}))} 
                      placeholder="MM/AA" 
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Cryptogramme *</label>
                    <input 
                      value={card.cvv} 
                      onChange={e => setCard(c => ({...c, cvv: e.target.value}))} 
                      placeholder="CVV" 
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Nom du titulaire *</label>
                  <input 
                    value={card.nom} 
                    onChange={e => setCard(c => ({...c, nom: e.target.value}))} 
                    placeholder="NOM PRÉNOM" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] uppercase" 
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <div className="flex-1 bg-[#f4f6fb] rounded-xl px-5 py-4 border border-gray-100">
                  <div className="text-xs text-gray-400 mb-0.5">Montant à régler</div>
                  <div className="text-xl font-extrabold text-[#b8963e]">{pendingFrais.montantTTC.toFixed(2)} €</div>
                  <div className="text-xs text-gray-400 mt-0.5">Frais d'instruction N° {pendingFrais.reference}</div>
                </div>
              </div>

              <button 
                onClick={handlePayment} 
                disabled={payFraisMutation.isPending || !card.num || !card.exp || !card.cvv || !card.nom}
                className="w-full bg-[#1a2f5e] hover:bg-[#0f1f3d] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl text-sm transition-colors mt-6 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> {payFraisMutation.isPending ? "Traitement..." : `Confirmer le paiement de ${pendingFrais.montantTTC.toFixed(2)} €`}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Paiement 100% sécurisé — Vos données bancaires sont chiffrées et ne sont jamais stockées.</p>
            </div>
          )}

          {step === "confirmation" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#1a2f5e] mb-2">Paiement confirmé</h2>
              <p className="text-gray-500 text-sm mb-6">Votre paiement a bien été enregistré. Un reçu vous a été envoyé par e-mail. L'instruction de votre dossier reprend sous <strong>48h ouvrées</strong>.</p>
              
              <div className="flex gap-3">
                <button className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Télécharger le reçu
                </button>
                <Link href="/suivi" className="flex-[2] bg-[#1a2f5e] text-white font-bold py-3 rounded-lg text-sm hover:bg-[#0f1f3d] block">
                  Voir mon dossier →
                </Link>
              </div>
            </div>
          )}

          {paidFrais.length > 0 && !pendingFrais && step === "facture" && (
             <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
               <h3 className="font-bold text-[#1a2f5e] text-base mb-4">Historique des paiements</h3>
               <div className="space-y-3">
                 {paidFrais.map(f => (
                   <div key={f.id} className="border border-gray-100 rounded-lg p-4 flex items-center justify-between">
                     <div>
                       <div className="font-semibold text-[#1a2f5e] text-sm">{f.reference}</div>
                       <div className="text-xs text-gray-500">Payé le {new Date(f.paidAt || f.updatedAt || f.createdAt).toLocaleDateString("fr-FR")}</div>
                     </div>
                     <div className="text-right">
                       <div className="font-bold text-green-600 text-sm">{f.montantTTC.toFixed(2)} €</div>
                       <button className="text-xs text-[#2e5db3] hover:underline mt-1">Télécharger reçu</button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-[#1a2f5e] text-sm mb-3">Pourquoi ces frais ?</h3>
            <p className="text-gray-600 text-xs leading-relaxed mb-3">
              Les frais d'instruction sont une pratique réglementée et encadrée par le droit français (Article L1611-2 CGCT) dans le cadre de l'instruction des demandes de financement public.
            </p>
            <div className="space-y-3">
              {[
                { titre: "Étude de recevabilité", desc: "Vérification que votre dossier répond aux critères d'éligibilité." },
                { titre: "Expertise technique agréée", desc: "Analyse par un expert certifié de la viabilité de votre projet." },
                { titre: "Certification et montage", desc: "Formalisation du rapport d'expertise et préparation de la soumission." },
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
              <Lock className="w-4 h-4 text-green-500" />
              <span className="font-bold text-[#1a2f5e] text-sm">Paiement sécurisé</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">Votre paiement est protégé par un chiffrement SSL 256 bits. Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs.</p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
