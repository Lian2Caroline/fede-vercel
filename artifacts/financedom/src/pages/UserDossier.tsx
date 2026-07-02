import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { UserLayout } from "@/components/layout/UserLayout";
import { useGetDashboardStats, useCreateDossier, useUpdateDossier, useSubmitDossier, CreateDossierBody } from "@workspace/api-client-react";
import { TERRITORIES } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";

const SECTEUR_KEYS = [
  "secteur_creation", "secteur_innovation", "secteur_agriculture",
  "secteur_environnement", "secteur_tourisme", "secteur_logement",
  "secteur_formation", "secteur_culture", "secteur_sante", "secteur_autre",
];
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Check, ChevronRight, ChevronLeft, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UserDossier() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const dossier = stats?.dossierActif;
  const profileTerritoire = user?.territoire ?? "";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<CreateDossierBody>>({
    titre: "",
    territoire: "",
    dispositif: "",
    secteur: "",
    description: "",
    montantDemande: 0,
    montantApport: 0,
    justificationBudget: "",
  });

  const createMutation = useCreateDossier();
  const updateMutation = useUpdateDossier();
  const submitMutation = useSubmitDossier();

  useEffect(() => {
    if (dossier) return;
    if (!profileTerritoire) return;
    setForm(f => (f.territoire ? f : { ...f, territoire: profileTerritoire }));
  }, [dossier, profileTerritoire]);

  const initializedRef = useRef(false);
  const lastStatutRef = useRef<string | null>(null);
  useEffect(() => {
    if (!dossier) return;
    setForm({
      titre: dossier.titre,
      territoire: dossier.territoire,
      dispositif: dossier.dispositif,
      secteur: dossier.secteur,
      description: (dossier as any).description || "",
      montantDemande: dossier.montantDemande,
      montantApport: dossier.montantApport || 0,
      justificationBudget: (dossier as any).justificationBudget || "",
    });
    if (!initializedRef.current || lastStatutRef.current !== dossier.statut) {
      initializedRef.current = true;
      lastStatutRef.current = dossier.statut;
      if (dossier.statut !== "brouillon") {
        setStep(4);
      }
    }
  }, [dossier]);

  const lockedToProfile = !dossier && !!profileTerritoire;
  const territoryInfo = TERRITORIES.find(ter => ter.name === (lockedToProfile ? profileTerritoire : form.territoire));

  const handleSaveStep = async (nextStep: number) => {
    if (dossier?.statut !== "brouillon" && dossier) {
      setStep(nextStep);
      return;
    }

    try {
      if (dossier) {
        await updateMutation.mutateAsync({
          id: dossier.id,
          data: {
            titre: form.titre,
            description: form.description,
            montantDemande: Number(form.montantDemande),
            montantApport: Number(form.montantApport),
            justificationBudget: form.justificationBudget,
          }
        });
      } else if (step === 1 && nextStep === 2) {
        await createMutation.mutateAsync({
          data: {
            titre: form.titre || t("dashboard.new_dossier"),
            territoire: form.territoire || "",
            dispositif: form.dispositif || "",
            secteur: form.secteur || "",
            description: form.description,
            montantDemande: Number(form.montantDemande) || 0,
            montantApport: Number(form.montantApport) || 0,
            justificationBudget: form.justificationBudget,
          }
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dossiers"] });
      setStep(nextStep);
    } catch (err) {
      toast({ title: t("common.error"), description: t("dossier.err_save"), variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!dossier) return;
    try {
      await submitMutation.mutateAsync({ id: dossier.id });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dossiers"] });
      toast({ title: t("common.success"), description: t("dossier.ok_submit") });
      setStep(4);
    } catch (err) {
      toast({ title: t("common.error"), description: t("dossier.err_submit"), variant: "destructive" });
    }
  };

  const isReadonly = dossier && dossier.statut !== "brouillon";

  const STATUS_LABELS: Record<string, string> = {
    brouillon:      t("dashboard.status_brouillon"),
    soumis:         t("dashboard.status_soumis"),
    en_instruction: t("dashboard.status_en_instruction"),
    expertise:      t("dashboard.status_expertise"),
    contrat_envoye: t("dashboard.status_contrat_envoye"),
    en_attente:     t("dashboard.status_en_attente"),
    valide:         t("dashboard.status_valide"),
    verse:          t("dashboard.status_verse"),
    rejete:         t("dashboard.status_rejete"),
  };

  if (statsLoading) {
    return <UserLayout><div className="animate-pulse h-96 bg-gray-200 rounded-xl" /></UserLayout>;
  }

  const STEPS = [
    t("dossier.step_info"),
    t("dossier.step_budget"),
    t("dossier.step_validation"),
    t("dossier.step_sent"),
  ];

  return (
    <UserLayout>
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
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
                {step > i + 1 ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < 3 && <div className={`h-px w-6 shrink-0 ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-extrabold text-[#1a2f5e]">{t("dossier.title_info")}</h2>
              
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">{t("dossier.projet_titre")}</label>
                <input 
                  value={form.titre || ""} 
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} 
                  disabled={isReadonly}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" 
                />
              </div>

              {!dossier && (
                <>
                  {lockedToProfile ? (
                    <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl">
                      <BadgeCheck className="w-4 h-4" />
                      {profileTerritoire}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">{t("dossier.territoire")}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {TERRITORIES.map(ter => (
                          <button 
                            key={ter.name} 
                            onClick={() => setForm(f => ({ ...f, territoire: ter.name, dispositif: "" }))} 
                            className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-colors ${form.territoire === ter.name ? "border-[#1a2f5e] bg-[#1a2f5e]/5 text-[#1a2f5e]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                          >
                            <span className="text-xl font-bold text-[#d4b96a]">{ter.flag}</span>
                            <span className="leading-tight text-xs">{ter.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {territoryInfo && (
                    <div>
                      <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">{t("dossier.dispositif")}</label>
                      <div className="space-y-2">
                        {territoryInfo.fonds.map(f => (
                          <button 
                            key={f} 
                            onClick={() => setForm(fm => ({ ...fm, dispositif: f }))} 
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${form.dispositif === f ? "border-[#1a2f5e] bg-[#1a2f5e]/5 text-[#1a2f5e] font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.dispositif && (
                    <div>
                      <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">{t("dossier.secteur")}</label>
                      <select 
                        value={form.secteur || ""} 
                        onChange={e => setForm(f => ({ ...f, secteur: e.target.value }))} 
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]"
                      >
                        <option value="">{t("dossier.secteur_placeholder")}</option>
                        {SECTEUR_KEYS.map(key => <option key={key} value={t(`dossier.${key}`)}>{t(`dossier.${key}`)}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              {dossier && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">{t("dossier.territoire_label")}</label>
                    <input value={form.territoire || ""} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">{t("dossier.dispositif_label")}</label>
                    <input value={form.dispositif || ""} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-1">{t("dossier.description")}</label>
                <p className="text-xs text-gray-400 mb-2">{t("dossier.description_hint")}</p>
                <textarea 
                  value={form.description || ""} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  disabled={isReadonly}
                  rows={6} 
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] resize-none" 
                />
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => handleSaveStep(2)} 
                  disabled={!form.titre || !form.territoire || !form.dispositif || !form.secteur || !form.description || createMutation.isPending || updateMutation.isPending}
                  className="bg-[#1a2f5e] hover:bg-[#0f1f3d] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  {t("dossier.continuer")} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-extrabold text-[#1a2f5e]">{t("dossier.title_budget")}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">{t("dossier.montant_demande")}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.montantDemande || ""}
                    onChange={e => {
                      const parsed = parseInt(e.target.value.replace(/[\s.,]/g, ""), 10);
                      setForm(f => ({ ...f, montantDemande: isNaN(parsed) ? 0 : parsed }));
                    }}
                    disabled={isReadonly}
                    placeholder="Ex : 150000"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]"
                  />
                  {(form.montantDemande ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">
                      = {(form.montantDemande as number).toLocaleString("fr-FR")} €
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">{t("dossier.apport")}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.montantApport || ""}
                    onChange={e => {
                      const parsed = parseInt(e.target.value.replace(/[\s.,]/g, ""), 10);
                      setForm(f => ({ ...f, montantApport: isNaN(parsed) ? 0 : parsed }));
                    }}
                    disabled={isReadonly}
                    placeholder="Ex : 50000"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]"
                  />
                  {(form.montantApport ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">
                      = {(form.montantApport as number).toLocaleString("fr-FR")} €
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-1">{t("dossier.justification")}</label>
                <p className="text-xs text-gray-400 mb-2">{t("dossier.justification_hint")}</p>
                <textarea 
                  value={form.justificationBudget || ""} 
                  onChange={e => setForm(f => ({ ...f, justificationBudget: e.target.value }))} 
                  disabled={isReadonly}
                  rows={4} 
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] resize-none" 
                />
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep(1)}
                  className="border border-gray-200 text-gray-600 font-semibold py-3 px-6 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> {t("dossier.retour")}
                </button>
                <button 
                  onClick={() => handleSaveStep(3)} 
                  disabled={!form.montantDemande || !form.justificationBudget || updateMutation.isPending}
                  className="bg-[#1a2f5e] hover:bg-[#0f1f3d] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  {t("dossier.continuer")} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-extrabold text-[#1a2f5e]">{t("dossier.title_validation")}</h2>
              
              <DossierRecap form={form} t={t} />

              {!isReadonly && (
                <div className="bg-[#fff8e8] border border-[#FFD500] rounded-xl p-4 text-sm">
                  <div className="font-bold text-[#7a5a2a] mb-1">{t("dossier.frais_info_title")}</div>
                  <p className="text-[#7a5a2a]/80 leading-relaxed">{t("dossier.frais_info_desc")}</p>
                </div>
              )}

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep(2)}
                  className="border border-gray-200 text-gray-600 font-semibold py-3 px-6 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> {t("dossier.retour")}
                </button>
                {!isReadonly && (
                  <button 
                    onClick={handleSubmit} 
                    disabled={submitMutation.isPending}
                    className="bg-[#b8963e] hover:bg-[#d4b96a] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm"
                  >
                    {submitMutation.isPending ? t("dossier.soumission") : t("dossier.soumettre")}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-extrabold text-[#1a2f5e] mb-1">{t("dossier.sent_title")}</h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
                  {t("dossier.sent_desc", { ref: dossier?.reference ?? "" })}{" "}
                  <strong>{dossier?.statut ? (STATUS_LABELS[dossier.statut] ?? dossier.statut) : "—"}</strong>.
                </p>
                <p className="text-sm text-[#FFD500] font-medium mb-4">{t("dossier.sent_next")}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => navigate("/documents")} className="bg-[#FFD500] hover:bg-[#FFC900] text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors">
                    {t("dossier.sent_docs")}
                  </button>
                  <button onClick={() => navigate("/suivi")} className="bg-[#1a2f5e] hover:bg-[#0f1f3d] text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors">
                    {t("dossier.sent_suivi")}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-[#1a2f5e] mb-3 uppercase tracking-wide">{t("dossier.summary_heading")}</h3>
                <DossierRecap form={form} t={t} />
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

function DossierRecap({ form, t }: { form: any; t: (k: string) => string }) {
  const rows = [
    { label: t("dossier.summary_titre"),      val: form.titre },
    { label: t("dossier.summary_territoire"),  val: form.territoire },
    { label: t("dossier.summary_dispositif"),  val: form.dispositif },
    { label: t("dossier.summary_secteur"),     val: form.secteur },
    { label: t("dossier.summary_montant"),     val: form.montantDemande ? `${(form.montantDemande as number).toLocaleString("fr-FR")} €` : "—" },
    { label: t("dossier.summary_apport"),      val: form.montantApport ? `${(form.montantApport as number).toLocaleString("fr-FR")} €` : "0 €" },
  ];

  return (
    <div className="space-y-0">
      {rows.map(r => r.val ? (
        <div key={r.label} className="flex justify-between items-center py-2.5 border-b border-gray-100">
          <span className="text-sm text-gray-500">{r.label}</span>
          <span className="text-sm font-semibold text-[#1a2f5e] text-right max-w-[60%]">{r.val}</span>
        </div>
      ) : null)}
      {form.description && (
        <div className="py-2.5 border-b border-gray-100">
          <span className="text-sm text-gray-500 block mb-1">{t("dossier.summary_description")}</span>
          <span className="text-sm font-semibold text-[#1a2f5e] leading-relaxed whitespace-pre-wrap">{form.description}</span>
        </div>
      )}
      {form.justificationBudget && (
        <div className="py-2.5 border-b border-gray-100">
          <span className="text-sm text-gray-500 block mb-1">{t("dossier.summary_justification")}</span>
          <span className="text-sm font-semibold text-[#1a2f5e] leading-relaxed whitespace-pre-wrap">{form.justificationBudget}</span>
        </div>
      )}
    </div>
  );
}
