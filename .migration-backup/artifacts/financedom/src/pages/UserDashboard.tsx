import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { UserLayout } from "@/components/layout/UserLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { FileText, AlertTriangle, MessageSquare, CreditCard, ChevronRight } from "lucide-react";

export default function UserDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <UserLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-4 gap-4"><div className="h-24 bg-gray-200 rounded-xl" /><div className="h-24 bg-gray-200 rounded-xl" /><div className="h-24 bg-gray-200 rounded-xl" /><div className="h-24 bg-gray-200 rounded-xl" /></div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </UserLayout>
    );
  }

  const dossier = stats?.dossierActif;

  return (
    <UserLayout>
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1a2f5e] mb-1">Tableau de bord</h2>
          <p className="text-gray-500 text-sm">Voici l'état de votre demande de financement non remboursable.</p>
        </div>
        {!dossier && (
          <Link href="/dossier" className="bg-[#1a2f5e] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0f1f3d] transition-colors">
            + Nouveau dossier
          </Link>
        )}
      </div>

      {stats?.fraisEnAttente ? (
        <div className="bg-[#fff8e8] border border-[#e8d9a0] rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-[#b8963e] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#7a5a2a] text-sm">Action requise — Frais d'instruction</div>
            <div className="text-[#7a5a2a]/80 text-sm mt-0.5">Des frais d'instruction ont été émis par l'administration. Veuillez procéder au paiement pour continuer le traitement.</div>
            <Link href="/paiement" className="inline-block mt-2 bg-[#b8963e] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#d4b96a] transition-colors">
              Voir et payer
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 font-medium">Dossiers</div>
            <FileText className="w-4 h-4 text-[#1a2f5e]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a2f5e]">{stats?.dossiersCount || 0}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 font-medium">Documents</div>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats?.documentsCount || 0}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 font-medium">Frais à payer</div>
            <CreditCard className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-extrabold text-orange-600">{stats?.fraisEnAttente || 0}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 font-medium">Messages non lus</div>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{stats?.messagesNonLus || 0}</div>
        </div>
      </div>

      {dossier ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-extrabold text-[#1a2f5e] text-lg">Dossier {dossier.reference || "En création"}</h3>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full">{dossier.statut}</span>
              </div>
              <p className="text-gray-500 text-sm">{dossier.titre} • {dossier.dispositif}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-[#1a2f5e]">{dossier.montantDemande.toLocaleString("fr-FR")} €</div>
              <div className="text-xs text-gray-400">Montant demandé</div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Progression du dossier</span>
              <span className="font-semibold text-[#1a2f5e]">Étape {dossier.progressionEtape} / {dossier.totalEtapes}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#1a2f5e] to-[#2e5db3] rounded-full transition-all" style={{ width: `${(dossier.progressionEtape / Math.max(dossier.totalEtapes, 1)) * 100}%` }} />
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dossier" className="text-sm text-white bg-[#1a2f5e] font-semibold px-4 py-2 rounded-lg hover:bg-[#0f1f3d] transition-colors">
              Voir le dossier
            </Link>
            <Link href="/suivi" className="text-sm text-gray-600 font-semibold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
              Suivi détaillé <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-[#1a2f5e] mb-2">Aucun dossier en cours</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Vous n'avez pas encore déposé de demande de financement. Créez votre premier dossier pour commencer.</p>
          <Link href="/dossier" className="bg-[#b8963e] text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-[#d4b96a] transition-colors shadow-sm">
            Déposer une demande
          </Link>
        </div>
      )}
    </UserLayout>
  );
}
