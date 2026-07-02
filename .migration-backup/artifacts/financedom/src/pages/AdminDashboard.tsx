import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminStats } from "@workspace/api-client-react";
import { FolderOpen, AlertTriangle, CreditCard, CheckCircle, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-28 bg-gray-200 rounded-xl" />
            <div className="h-28 bg-gray-200 rounded-xl" />
            <div className="h-28 bg-gray-200 rounded-xl" />
            <div className="h-28 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-[#0f1f3d] mb-1">{stats?.totalDossiers || 0}</div>
          <div className="text-sm font-semibold text-[#0f1f3d]">Dossiers en cours</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-amber-600 mb-1">{stats?.enInstruction || 0}</div>
          <div className="text-sm font-semibold text-[#0f1f3d]">En instruction</div>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-orange-600 mb-1">{stats?.fraisEnAttente || 0}</div>
          <div className="text-sm font-semibold text-[#0f1f3d]">Frais en attente</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-green-600 mb-1">{stats?.validesThisMois || 0}</div>
          <div className="text-sm font-semibold text-[#0f1f3d]">Validés ce mois</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#0f1f3d] text-base mb-4">Répartition par statut</h3>
            <div className="space-y-4">
              {stats?.byStatut?.map(s => {
                const total = stats.totalDossiers || 1;
                const percentage = (s.count / total) * 100;
                return (
                  <div key={s.statut}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{s.statut}</span>
                      <span className="font-bold text-[#0f1f3d]">{s.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#1a2f5e] to-[#2e5db3] rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
              {(!stats?.byStatut || stats.byStatut.length === 0) && (
                <div className="text-sm text-gray-500 py-4 text-center">Aucun dossier</div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#0f1f3d] text-base mb-4">Par territoire</h3>
            <div className="space-y-4">
              {stats?.byTerritoire?.map(t => {
                const total = stats.totalDossiers || 1;
                const percentage = (t.count / total) * 100;
                return (
                  <div key={t.territoire}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{t.territoire}</span>
                      <span className="font-bold text-[#0f1f3d]">{t.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#b8963e] rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
              {(!stats?.byTerritoire || stats.byTerritoire.length === 0) && (
                <div className="text-sm text-gray-500 py-2 text-center">Aucun dossier</div>
              )}
            </div>
          </div>

          <div className="bg-[#0f1f3d] rounded-xl p-5 text-white shadow-sm">
            <div className="font-bold text-sm mb-3">Actions rapides</div>
            <div className="space-y-2">
              <Link href="/admin/frais" className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-between transition-colors">
                <span>Émettre des frais d'instruction</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/admin/dossiers" className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-between transition-colors">
                <span>Voir tous les dossiers</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
