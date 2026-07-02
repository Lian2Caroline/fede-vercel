import { ReactNode } from "react";

type Page = "dashboard" | "dossier" | "documents" | "suivi" | "paiement" | "profil";

const NAV_ITEMS: { id: Page; icon: string; label: string; badge?: number }[] = [
  { id: "dashboard", icon: "⊞", label: "Tableau de bord" },
  { id: "dossier", icon: "📄", label: "Mon dossier" },
  { id: "documents", icon: "📎", label: "Mes documents", badge: 2 },
  { id: "suivi", icon: "🔍", label: "Suivi de dossier" },
  { id: "paiement", icon: "💳", label: "Paiement", badge: 1 },
  { id: "profil", icon: "👤", label: "Mon profil" },
];

export function UserLayout({ children, active }: { children: ReactNode; active: Page }) {
  return (
    <div className="flex h-screen bg-[#f4f6fb] font-sans text-[#1e293b] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a2f5e] flex flex-col h-full shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#b8963e] to-[#d4b96a] flex items-center justify-center font-bold text-white text-sm">FD</div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">FinanceDOM</div>
              <div className="text-white/40 text-xs">Espace utilisateur</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                active === item.id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/8 hover:text-white/90"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-[#b8963e] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#b8963e]/30 flex items-center justify-center text-[#b8963e] font-bold text-sm">MK</div>
            <div>
              <div className="text-white text-xs font-semibold">Marie Koutoua</div>
              <div className="text-white/40 text-xs">Martinique</div>
            </div>
          </div>
          <button className="w-full text-left text-white/50 hover:text-white text-xs flex items-center gap-2 px-1 transition-colors">
            <span>→</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Espace utilisateur</div>
            <h1 className="text-lg font-bold text-[#1a2f5e]">
              {NAV_ITEMS.find((n) => n.id === active)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#b8963e] rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1a2f5e]/10 flex items-center justify-center text-[#1a2f5e] font-bold text-sm">MK</div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
