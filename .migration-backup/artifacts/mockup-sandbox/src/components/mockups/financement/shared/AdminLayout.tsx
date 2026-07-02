import { ReactNode } from "react";

type AdminPage = "dashboard" | "dossiers" | "frais" | "utilisateurs" | "stats" | "parametres";

const NAV_ITEMS: { id: AdminPage; icon: string; label: string; badge?: number }[] = [
  { id: "dashboard", icon: "⊞", label: "Tableau de bord" },
  { id: "dossiers", icon: "📁", label: "Dossiers", badge: 8 },
  { id: "frais", icon: "📨", label: "Émettre des frais" },
  { id: "utilisateurs", icon: "👥", label: "Utilisateurs" },
  { id: "stats", icon: "📊", label: "Statistiques" },
  { id: "parametres", icon: "⚙️", label: "Paramètres" },
];

export function AdminLayout({ children, active }: { children: ReactNode; active: AdminPage }) {
  return (
    <div className="flex h-screen bg-[#f4f6fb] font-sans text-[#1e293b] overflow-hidden">
      <aside className="w-64 bg-[#0f1f3d] flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-white text-xs">ADM</div>
            <div>
              <div className="text-white font-bold text-sm">FinanceDOM</div>
              <div className="text-red-400 text-xs font-semibold uppercase tracking-wide">Administration</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                active === item.id ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/8 hover:text-white/90"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">AD</div>
            <div>
              <div className="text-white text-xs font-semibold">Administrateur</div>
              <div className="text-white/40 text-xs">Accès complet</div>
            </div>
          </div>
          <button className="w-full text-left text-white/50 hover:text-white text-xs flex items-center gap-2 px-1 transition-colors">
            <span>→</span> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs text-red-500 uppercase tracking-wide font-semibold mb-0.5">Administration</div>
            <h1 className="text-lg font-bold text-[#0f1f3d]">
              {NAV_ITEMS.find((n) => n.id === active)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-100">Session sécurisée</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
