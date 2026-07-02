import { useState, useEffect } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { useListFrais, usePayFrais, useGetDashboardStats } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, Copy, Download, ChevronLeft, Building2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const BASE = import.meta.env.VITE_API_URL ?? "";

interface CoordonneesBancaires {
  beneficiaire: string;
  iban: string;
  bic: string;
  banque: string;
  domiciliation: string;
  libelleVirement: string;
}

function useCoordonneesBancaires() {
  const [data, setData] = useState<CoordonneesBancaires | null>(null);
  useEffect(() => {
    fetch(`${BASE}/api/coordonnees-bancaires`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => {});
  }, []);
  return data;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast({ title: t("paiement.copy_toast"), description: t("paiement.copy_toast_desc", { label }) });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center justify-between bg-[#f4f6fb] border border-gray-200 rounded-lg px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="font-mono font-semibold text-[#1a2f5e] text-sm break-all">{value}</div>
      </div>
      <button
        onClick={copy}
        className="ml-3 p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 hover:text-[#1a2f5e] shrink-0"
        title={t("paiement.copier")}
      >
        {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function UserPaiement() {
  const { t } = useTranslation();
  const { data: stats } = useGetDashboardStats();
  const dossierId = stats?.dossierActif?.id;
  const coordonnees = useCoordonneesBancaires();

  const { data: fraisList = [], isLoading } = useListFrais(dossierId as number, { query: { enabled: !!dossierId } });
  const pendingFrais = fraisList.find(f => f.statut === "en_attente");
  const paidFrais = fraisList.filter(f => f.statut === "paye");

  const [step, setStep] = useState<"facture" | "virement" | "confirmation">("facture");
  const payFraisMutation = usePayFrais();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!pendingFrais || !dossierId) return;
    try {
      await payFraisMutation.mutateAsync({
        id: pendingFrais.id,
        data: { virementConfirme: true },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dossiers", dossierId, "frais"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setStep("confirmation");
    } catch {
      toast({ title: t("paiement.err"), description: t("paiement.err_desc"), variant: "destructive" });
    }
  };

  if (!dossierId) {
    return (
      <UserLayout>
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-bold text-[#1a2f5e]">{t("paiement.no_dossier_title")}</h3>
          <p className="text-gray-500 text-sm">{t("paiement.no_dossier_desc")}</p>
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
        <div className="bg-[#fff8e8] border border-[#FFD500] rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-[#b8963e] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#7a5a2a] text-sm">{t("paiement.frais_action")}</div>
            <p className="text-[#7a5a2a]/80 text-sm mt-0.5">
              {t("paiement.frais_desc", { ref: stats?.dossierActif?.reference ?? "" })}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">

          {!pendingFrais && paidFrais.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#1a2f5e] mb-2">{t("paiement.no_frais_title")}</h3>
              <p className="text-gray-500 text-sm">{t("paiement.no_frais_desc")}</p>
            </div>
          )}

          {pendingFrais && step === "facture" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#1a2f5e] px-4 sm:px-8 py-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded bg-[#FFD500] flex items-center justify-center font-bold text-sm text-[#0A1628]">F</div>
                      <span className="font-extrabold text-white text-lg">FEDE</span>
                    </div>
                    <div className="text-white/50 text-xs">{t("paiement.facture_service")}</div>
                    <div className="text-white/50 text-xs">support@fede-financement.com</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-xs uppercase tracking-widest mb-1">{t("paiement.facture_avis")}</div>
                    <div className="font-extrabold text-xl">{pendingFrais.reference}</div>
                    <div className="text-white/50 text-xs mt-1">{t("paiement.facture_emis")} {new Date(pendingFrais.createdAt).toLocaleDateString()}</div>
                    <div className="text-white/50 text-xs">{t("paiement.facture_echeance")} {new Date(pendingFrais.echeance).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-8 py-5 border-b border-gray-100 bg-[#f4f6fb]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{t("paiement.facture_destinataire")}</div>
                    <div className="font-bold text-[#1a2f5e] text-sm">{t("paiement.facture_porteur")}</div>
                    <div className="text-gray-500 text-xs">{t("paiement.facture_dossier")} {stats?.dossierActif?.reference}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{t("paiement.facture_objet")}</div>
                    <div className="font-bold text-[#1a2f5e] text-sm">{stats?.dossierActif?.dispositif}</div>
                    <div className="text-gray-500 text-xs">{stats?.dossierActif?.titre}</div>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-8 py-5 overflow-x-auto">
                <table className="w-full text-sm min-w-[320px]">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-2 pr-4 font-semibold">{t("paiement.facture_designation")}</th>
                      <th className="text-right text-xs text-gray-400 uppercase tracking-wide py-2 font-semibold">{t("paiement.facture_ht")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="py-3 pr-4 text-gray-700 text-xs leading-relaxed">{t("paiement.facture_line1")}</td>
                      <td className="py-3 text-right font-semibold text-[#1a2f5e] whitespace-nowrap">120,00 €</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-gray-700 text-xs leading-relaxed">{t("paiement.facture_line2")}</td>
                      <td className="py-3 text-right font-semibold text-[#1a2f5e] whitespace-nowrap">180,00 €</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-gray-700 text-xs leading-relaxed">{t("paiement.facture_line3")}</td>
                      <td className="py-3 text-right font-semibold text-[#1a2f5e] whitespace-nowrap">80,00 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-8 py-5 border-t border-gray-200 bg-[#f4f6fb]">
                <div className="flex justify-end">
                  <div className="w-56 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>{t("paiement.sous_total")}</span><span className="font-semibold">{pendingFrais.montantHT.toFixed(2)} €</span></div>
                    <div className="flex justify-between text-gray-600"><span>{t("paiement.tva")}</span><span className="font-semibold">{pendingFrais.montantTVA.toFixed(2)} €</span></div>
                    <div className="flex justify-between text-[#1a2f5e] font-extrabold text-base border-t-2 border-[#1a2f5e]/20 pt-2">
                      <span>{t("paiement.total_ttc")}</span>
                      <span className="text-[#b8963e]">{pendingFrais.montantTTC.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-6 pt-2">
                <button
                  onClick={() => setStep("virement")}
                  className="w-full bg-[#b8963e] hover:bg-[#c9a84c] text-white font-bold py-3.5 rounded-xl text-sm transition-colors mt-2 flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  {t("paiement.voir_virement")}
                </button>
              </div>
            </div>
          )}

          {pendingFrais && step === "virement" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("facture")} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> {t("paiement.voir_dossier") === "Voir mon dossier →" ? "Retour" : t("dossier.retour")}
                </button>
                <h2 className="text-lg font-extrabold text-[#1a2f5e] ml-auto mr-auto">{t("paiement.virement_title")}</h2>
              </div>

              <div className="bg-[#fff8e8] border border-[#FFD500] rounded-xl p-4 flex items-start gap-2 mb-6">
                <Info className="w-4 h-4 text-[#b8963e] shrink-0 mt-0.5" />
                <p className="text-[#7a5a2a] text-xs leading-relaxed">
                  {t("paiement.virement_info", { amount: `${pendingFrais.montantTTC.toFixed(2)} €` })}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {coordonnees ? (
                  <>
                    <CopyField label={t("paiement.beneficiaire")} value={coordonnees.beneficiaire} />
                    <CopyField label={t("paiement.iban")} value={coordonnees.iban} />
                    <CopyField label={t("paiement.bic")} value={coordonnees.bic} />
                    <CopyField label={t("paiement.banque")} value={coordonnees.banque} />
                    <CopyField label={t("paiement.domiciliation")} value={coordonnees.domiciliation} />
                  </>
                ) : (
                  <div className="animate-pulse space-y-3">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
                  </div>
                )}
                <div className="flex items-center justify-between bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-4 py-3">
                  <div>
                    <div className="text-xs text-[#1E40AF] uppercase tracking-wider font-bold mb-0.5">{t("paiement.libelle_label")}</div>
                    <div className="font-mono font-bold text-[#1a2f5e] text-sm">{pendingFrais.reference} — {stats?.dossierActif?.reference}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${pendingFrais.reference} — ${stats?.dossierActif?.reference}`)}
                    className="ml-3 p-2 rounded-lg hover:bg-blue-100 transition-colors text-[#1E40AF] shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#f4f6fb] border border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t("paiement.montant_virer")}</span>
                  <span className="text-2xl font-extrabold text-[#b8963e]">{pendingFrais.montantTTC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">{t("paiement.ref_frais")}</span>
                  <span className="text-xs font-mono text-gray-600">{pendingFrais.reference}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">{t("paiement.echeance")}</span>
                  <span className="text-xs font-semibold text-red-600">{new Date(pendingFrais.echeance).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={payFraisMutation.isPending}
                className="w-full bg-[#1a2f5e] hover:bg-[#0f1f3d] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {payFraisMutation.isPending ? t("paiement.confirmer_loading") : t("paiement.confirmer")}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                {t("paiement.confirmer_note")}
              </p>
            </div>
          )}

          {step === "confirmation" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#1a2f5e] mb-2">{t("paiement.confirmed_title")}</h2>
              <p className="text-gray-500 text-sm mb-6">{t("paiement.confirmed_desc")}</p>
              <Link href="/suivi" className="inline-block bg-[#1a2f5e] text-white font-bold py-3 px-8 rounded-lg text-sm hover:bg-[#0f1f3d] transition-colors">
                {t("paiement.voir_dossier")}
              </Link>
            </div>
          )}

          {paidFrais.length > 0 && !pendingFrais && step === "facture" && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
              <h3 className="font-bold text-[#1a2f5e] text-base mb-4">{t("paiement.historique")}</h3>
              <div className="space-y-3">
                {paidFrais.map(f => (
                  <div key={f.id} className="border border-gray-100 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#1a2f5e] text-sm">{f.reference}</div>
                      <div className="text-xs text-gray-500">{t("paiement.regle_le")} {new Date(f.paidAt || f.updatedAt || f.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm">{f.montantTTC.toFixed(2)} €</div>
                      <div className="text-xs text-green-500 font-semibold mt-0.5 flex items-center gap-1 justify-end">
                        <CheckCircle className="w-3 h-3" /> {t("paiement.virement_confirme")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-[#1a2f5e] text-sm mb-3">{t("paiement.sidebar_why")}</h3>
            <p className="text-gray-600 text-xs leading-relaxed mb-3">{t("paiement.sidebar_why_desc")}</p>
            <div className="space-y-3">
              {[
                { titre: t("paiement.sidebar_step1"), desc: t("paiement.sidebar_step1_desc") },
                { titre: t("paiement.sidebar_step2"), desc: t("paiement.sidebar_step2_desc") },
                { titre: t("paiement.sidebar_step3"), desc: t("paiement.sidebar_step3_desc") },
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

          <div className="bg-[#f4f6fb] border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-[#1a2f5e]" />
              <span className="font-bold text-[#1a2f5e] text-sm">{t("paiement.sidebar_virement_title")}</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">{t("paiement.sidebar_virement_desc")}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h4 className="font-bold text-[#1a2f5e] text-sm mb-2">{t("paiement.sidebar_delai")}</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex gap-2"><span className="text-[#b8963e] font-bold shrink-0">J+0</span><span>{t("paiement.sidebar_j0")}</span></div>
              <div className="flex gap-2"><span className="text-[#b8963e] font-bold shrink-0">J+1/3</span><span>{t("paiement.sidebar_j13")}</span></div>
              <div className="flex gap-2"><span className="text-[#b8963e] font-bold shrink-0">J+1</span><span>{t("paiement.sidebar_j1")}</span></div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
