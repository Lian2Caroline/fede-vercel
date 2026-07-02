import { useState, useEffect } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { useGetDashboardStats, useCreateDossier, useUpdateDossier, useSubmitDossier, CreateDossierBody } from "@workspace/api-client-react";
import { TERRITORIES, SECTEURS } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";

export default function UserDossier() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const dossier = stats?.dossierActif;
  
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
    if (dossier) {
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
      if (dossier.statut !== "Brouillon") {
        setStep(4); // Readonly view
      } else {
        setStep(1);
      }
    }
  }, [dossier]);

  const territoryInfo = TERRITORIES.find(t => t.name === form.territoire);

  const handleSaveStep = async (nextStep: number) => {
    if (dossier?.statut !== "Brouillon" && dossier) {
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
            titre: form.titre || "Nouveau dossier",
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
      toast({ title: "Erreur", description: "Erreur lors de la sauvegarde.", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!dossier) return;
    try {
      await submitMutation.mutateAsync({ id: dossier.id });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dossiers"] });
      toast({ title: "Succès", description: "Dossier soumis avec succès." });
      setStep(4);
    } catch (err) {
      toast({ title: "Erreur", description: "Erreur lors de la soumission.", variant: "destructive" });
    }
  };

  const isReadonly = dossier && dossier.statut !== "Brouillon";

  if (statsLoading) {
    return <UserLayout><div className="animate-pulse h-96 bg-gray-200 rounded-xl" /></UserLayout>;
  }

  return (
    <UserLayout>
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {["Informations générales", "Budget", "Validation", "Envoyé"].map((s, i) => (
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
              <h2 className="text-lg font-extrabold text-[#1a2f5e]">Informations générales</h2>
              
              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">Titre du projet *</label>
                <input 
                  value={form.titre || ""} 
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} 
                  disabled={isReadonly}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" 
                />
              </div>

              {!dossier && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">Votre territoire *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {TERRITORIES.map(t => (
                        <button 
                          key={t.name} 
                          onClick={() => setForm(f => ({ ...f, territoire: t.name, dispositif: "" }))} 
                          className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-colors ${form.territoire === t.name ? "border-[#1a2f5e] bg-[#1a2f5e]/5 text-[#1a2f5e]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                        >
                          <span className="text-xl font-bold text-[#d4b96a]">{t.flag}</span>
                          <span className="leading-tight text-xs">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {territoryInfo && (
                    <div>
                      <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">Dispositif de financement *</label>
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
                      <label className="block text-sm font-semibold text-[#1a2f5e] mb-3">Secteur d'activité *</label>
                      <select 
                        value={form.secteur || ""} 
                        onChange={e => setForm(f => ({ ...f, secteur: e.target.value }))} 
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]"
                      >
                        <option value="">Choisir un secteur</option>
                        {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              {dossier && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Territoire</label>
                    <input value={form.territoire || ""} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Dispositif</label>
                    <input value={form.dispositif || ""} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Description détaillée du projet *</label>
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
                  Continuer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-extrabold text-[#1a2f5e]">Budget et financement</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Montant demandé (€) *</label>
                  <input 
                    type="number" 
                    value={form.montantDemande || ""} 
                    onChange={e => setForm(f => ({ ...f, montantDemande: Number(e.target.value) }))} 
                    disabled={isReadonly}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Apport personnel (€)</label>
                  <input 
                    type="number" 
                    value={form.montantApport || ""} 
                    onChange={e => setForm(f => ({ ...f, montantApport: Number(e.target.value) }))} 
                    disabled={isReadonly}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a2f5e] mb-2">Justification budgétaire *</label>
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
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <button 
                  onClick={() => handleSaveStep(3)} 
                  disabled={!form.montantDemande || updateMutation.isPending}
                  className="bg-[#1a2f5e] hover:bg-[#0f1f3d] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  Continuer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-extrabold text-[#1a2f5e]">Validation</h2>
              
              <div className="space-y-3">
                {[
                  { label: "Titre", val: form.titre },
                  { label: "Territoire", val: form.territoire },
                  { label: "Dispositif", val: form.dispositif },
                  { label: "Montant demandé", val: form.montantDemande ? `${form.montantDemande.toLocaleString("fr-FR")} €` : "—" },
                  { label: "Apport", val: form.montantApport ? `${form.montantApport.toLocaleString("fr-FR")} €` : "0 €" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{r.label}</span>
                    <span className="text-sm font-semibold text-[#1a2f5e]">{r.val}</span>
                  </div>
                ))}
              </div>

              {!isReadonly && (
                <div className="bg-[#fff8e8] border border-[#e8d9a0] rounded-xl p-4 text-sm">
                  <div className="font-bold text-[#7a5a2a] mb-1">⚠ Information sur les frais d'instruction</div>
                  <p className="text-[#7a5a2a]/80 leading-relaxed">Après soumission, votre dossier sera analysé par un expert agréé. Les frais d'instruction de 456€ TTC ne seront émis qu'une fois votre financement formellement confirmé — jamais avant.</p>
                </div>
              )}

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep(2)}
                  className="border border-gray-200 text-gray-600 font-semibold py-3 px-6 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                {!isReadonly && (
                  <button 
                    onClick={handleSubmit} 
                    disabled={submitMutation.isPending}
                    className="bg-[#b8963e] hover:bg-[#d4b96a] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm"
                  >
                    {submitMutation.isPending ? "Soumission..." : "Soumettre le dossier"}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#1a2f5e] mb-2">Dossier en cours de traitement</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">Votre dossier {dossier?.reference} est actuellement au statut : <strong>{dossier?.statut}</strong>.</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(1)} className="border border-gray-200 text-gray-600 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-50">Voir les détails</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
