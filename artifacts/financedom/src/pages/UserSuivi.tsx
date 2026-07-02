import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { UserLayout } from "@/components/layout/UserLayout";
import { useGetDashboardStats, useGetDossier } from "@workspace/api-client-react";
import { Check, Download, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { downloadUserDoc } from "@/lib/doc-download";

const BASE = import.meta.env.VITE_API_URL ?? "";

const TIMELINE_STEPS = [
  { phase: 1, titreKey: "suivi.step1_titre", descKey: "suivi.step1_desc", action: "accuser_reception" },
  { phase: 2, titreKey: "suivi.step2_titre", descKey: "suivi.step2_desc", action: "envoyer_eligibilite" },
  { phase: 3, titreKey: "suivi.step3_titre", descKey: "suivi.step3_desc", action: "envoyer_contrat" },
  { phase: 4, titreKey: "suivi.step4_titre", descKey: "suivi.step4_desc", action: "marquer_signe" },
  { phase: 5, titreKey: "suivi.step5_titre", descKey: "suivi.step5_desc", action: "marquer_favorable" },
  { phase: 6, titreKey: "suivi.step6_titre", descKey: "suivi.step6_desc", action: "confirmer_paiement" },
];

const DOCS_BY_ACTION: Record<string, { type: string; labelKey: string }[]> = {
  accuser_reception:   [{ type: "accuse_reception",    labelKey: "suivi.accuse" }],
  envoyer_eligibilite: [{ type: "rapport_eligibilite", labelKey: "suivi.rapport" }, { type: "fiche_collecte", labelKey: "suivi.fiche" }],
  envoyer_contrat:     [{ type: "contrat_mission",     labelKey: "suivi.contrat" }],
  marquer_favorable:   [{ type: "notification",        labelKey: "suivi.notification" }],
};

export default function UserSuivi() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: stats } = useGetDashboardStats();
  const dossierId = stats?.dossierActif?.id;

  const { data: dossier, isLoading: dossierLoading } = useGetDossier(dossierId as number, { query: { enabled: !!dossierId } });
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!dossierId) return;
    fetch(`${BASE}/api/dossiers/${dossierId}/events`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setEvents)
      .catch(() => {});
  }, [dossierId]);

  const executedActions = new Set(events.map((e: any) => e.action));
  const completedCount = TIMELINE_STEPS.filter(s => executedActions.has(s.action)).length;
  const progressPct = Math.round((completedCount / 6) * 100);

  async function openDoc(type: string) {
    if (!dossierId || !user) return;
    try {
      await downloadUserDoc(dossierId, type, user);
    } catch {
      /* silently ignore */
    }
  }

  if (!dossierId) {
    return (
      <UserLayout>
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-bold text-[#1a2f5e]">{t("suivi.no_dossier_title")}</h3>
          <p className="text-gray-500 text-sm mt-2">{t("suivi.no_dossier_desc")}</p>
        </div>
      </UserLayout>
    );
  }

  if (dossierLoading) {
    return <UserLayout><div className="animate-pulse h-96 bg-gray-100 rounded-xl" /></UserLayout>;
  }

  return (
    <UserLayout>
      <div className="bg-[#0D1F3C] rounded-xl p-5 text-white mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-white/50 text-xs uppercase tracking-widest mb-1">{t("suivi.real_time")}</div>
            <div className="font-extrabold text-xl">{dossier?.titre}</div>
            <div className="text-white/60 text-sm mt-0.5">{t("suivi.dossier_ref")} {dossier?.reference} · {dossier?.territoire}</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-left md:text-right shrink-0">
              <div className="text-white/50 text-xs mb-1">{t("suivi.progress")}</div>
              <div className="text-4xl font-extrabold text-[#d4b96a]">{progressPct}%</div>
              <div className="text-white/40 text-xs">{completedCount} / 6</div>
            </div>
            <button
              onClick={() => navigate("/messages")}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-white/20 shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              {t("suivi.messages_link")}
            </button>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FFD500] to-[#d4b96a] rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-[#0D1F3C] text-base mb-6">{t("suivi.title")}</h3>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, i) => {
              const isDone = executedActions.has(step.action);
              const isCurrent = !isDone && (i === 0 || executedActions.has(TIMELINE_STEPS[i - 1]?.action));
              const event = events.find((e: any) => e.action === step.action);
              const docs = DOCS_BY_ACTION[step.action] ?? [];

              return (
                <div key={step.phase} className="relative flex gap-4 pb-7">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isDone ? "bg-[#0D1F3C] border-[#0D1F3C]" :
                    isCurrent ? "bg-white border-[#FFD500] shadow-sm" :
                    "bg-white border-gray-200"
                  }`}>
                    {isDone ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFD500] animate-pulse" />
                    ) : (
                      <span className="text-xs font-bold text-gray-300">{step.phase}</span>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${isDone ? "text-[#0D1F3C]" : isCurrent ? "text-[#FFD500]" : "text-gray-400"}`}>
                        {t(step.titreKey)}
                      </span>
                      {isDone && event && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] bg-[#FFD500]/10 text-[#FFD500] font-semibold px-2 py-0.5 rounded-full border border-[#FFD500]/20">
                          {t("suivi.pending")}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${isDone ? "text-gray-500" : "text-gray-400"}`}>
                      {isDone && event?.note ? event.note : t(step.descKey)}
                    </p>
                    {isDone && docs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {docs.map(d => (
                          <button key={d.type} onClick={() => openDoc(d.type)}
                            className="flex items-center gap-1.5 text-xs text-[#0D1F3C] font-semibold border border-[#0D1F3C]/20 bg-[#0D1F3C]/5 px-3 py-1.5 rounded-lg hover:bg-[#0D1F3C]/10 transition-colors">
                            <Download className="w-3 h-3" /> {t(d.labelKey)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
