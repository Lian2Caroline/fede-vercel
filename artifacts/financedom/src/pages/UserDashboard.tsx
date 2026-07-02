import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { UserLayout } from "@/components/layout/UserLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { FileText, AlertTriangle, MessageSquare, CreditCard, ChevronRight, Paperclip, Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UserDashboard() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useGetDashboardStats();

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

  if (isLoading) {
    return (
      <UserLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><div className="h-24 bg-gray-200 rounded-xl" /><div className="h-24 bg-gray-200 rounded-xl" /><div className="h-24 bg-gray-200 rounded-xl" /><div className="h-24 bg-gray-200 rounded-xl" /></div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </UserLayout>
    );
  }

  const dossier = stats?.dossierActif;
  const statutLabel = dossier ? (STATUS_LABELS[dossier.statut] ?? dossier.statut) : "";

  return (
    <UserLayout>
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1a2f5e] mb-1">{t("dashboard.title")}</h2>
          <p className="text-gray-500 text-sm">{t("dashboard.sub")}</p>
        </div>
        {!dossier && (
          <Link href="/dossier" className="bg-[#1a2f5e] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0f1f3d] transition-colors">
            {t("dashboard.new_dossier")}
          </Link>
        )}
      </div>

      {dossier?.statut === "verse" && (
        <Link href="/transfert" className="flex items-center gap-4 bg-gradient-to-r from-[#065F46] to-[#047857] rounded-xl px-5 py-4 mb-6 border border-green-600/30 hover:border-green-400/60 transition-all group cursor-pointer no-underline">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
            <Banknote className="w-7 h-7 text-[#FFD500]" />
          </div>
          <div className="flex-1">
            <div className="text-white font-extrabold text-sm mb-0.5">🎉 {t("dashboard.funds_available")}</div>
            <div className="text-white/70 text-xs">{t("dashboard.funds_sub")}</div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#FFD500] transition-colors shrink-0" />
        </Link>
      )}

      {stats?.fraisEnAttente ? (
        <div className="bg-[#fff8e8] border border-[#FFD500] rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-[#b8963e] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#7a5a2a] text-sm">{t("dashboard.frais_action")}</div>
            <div className="text-[#7a5a2a]/80 text-sm mt-0.5">{t("dashboard.frais_desc")}</div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link href="/dossier" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#1a2f5e]/30 transition-all group block">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 font-medium">{t("dashboard.stat_dossiers")}</div>
            <FileText className="w-4 h-4 text-[#1a2f5e] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a2f5e]">{stats?.dossiersCount || 0}</div>
        </Link>
        <Link href="/documents" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group block">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 font-medium">{t("dashboard.stat_documents")}</div>
            <Paperclip className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats?.documentsCount || 0}</div>
        </Link>
        <Link href="/paiement" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group block">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 font-medium">{t("dashboard.stat_frais")}</div>
            <CreditCard className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-orange-600">{stats?.fraisEnAttente || 0}</div>
        </Link>
        <Link href="/messages" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group block relative">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 font-medium">{t("dashboard.stat_messages")}</div>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              {(stats?.messagesNonLus ?? 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </div>
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{stats?.messagesNonLus || 0}</div>
        </Link>
      </div>

      {dossier ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-extrabold text-[#1a2f5e] text-lg">{t("dashboard.dossier_ref")} {dossier.reference || t("dashboard.en_creation")}</h3>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full">{statutLabel}</span>
              </div>
              <p className="text-gray-500 text-sm">{dossier.titre} • {dossier.dispositif}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-[#1a2f5e]">{dossier.montantDemande.toLocaleString("fr-FR")} €</div>
              <div className="text-xs text-gray-400">{t("dashboard.montant_demande")}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{t("dashboard.progression")}</span>
              <span className="font-semibold text-[#1a2f5e]">{t("dashboard.etape")} {Math.min(dossier.progressionEtape, dossier.totalEtapes)} / {dossier.totalEtapes}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#1a2f5e] to-[#2e5db3] rounded-full transition-all" style={{ width: `${(Math.min(dossier.progressionEtape, dossier.totalEtapes) / Math.max(dossier.totalEtapes, 1)) * 100}%` }} />
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dossier" className="text-sm text-white bg-[#1a2f5e] font-semibold px-4 py-2 rounded-lg hover:bg-[#0f1f3d] transition-colors">
              {t("dashboard.voir_dossier")}
            </Link>
            <Link href="/suivi" className="text-sm text-gray-600 font-semibold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
              {t("dashboard.suivi")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-[#1a2f5e] mb-2">{t("dashboard.no_dossier_title")}</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">{t("dashboard.no_dossier_desc")}</p>
          <Link href="/dossier" className="bg-[#b8963e] text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-[#d4b96a] transition-colors shadow-sm">
            {t("dashboard.no_dossier_cta")}
          </Link>
        </div>
      )}

    </UserLayout>
  );
}
