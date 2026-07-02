import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Paperclip, Search, CreditCard, LogOut, Globe, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CSLogo } from "@/components/CSLogo";

const NAV_ITEMS = [
  { id: "dashboard", href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { id: "dossier", href: "/dossier", icon: FileText, label: "Mon dossier" },
  { id: "documents", href: "/documents", icon: Paperclip, label: "Mes documents" },
  { id: "suivi", href: "/suivi", icon: Search, label: "Suivi de dossier" },
  { id: "messages", href: "/messages", icon: MessageSquare, label: "Messagerie" },
  { id: "paiement", href: "/paiement", icon: CreditCard, label: "Paiement" },
];

export function UserLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#F1F4FA] font-sans text-slate-800 overflow-hidden">
      <aside className="w-64 bg-[#0D1F3C] flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="cursor-pointer">
            <CSLogo size="sm" variant="light" showText subtitle="Espace utilisateur" />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  active
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/55 hover:bg-white/8 hover:text-white/85"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#D4A847]' : ''}`} />
                <span className="text-sm font-medium">{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4A847]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#B5872A]/25 border border-[#B5872A]/30 flex items-center justify-center text-[#D4A847] font-bold text-sm uppercase shrink-0">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{user?.prenom} {user?.nom}</div>
                <div className="text-white/35 text-[10px] truncate flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> {user?.territoire}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full text-left text-white/40 hover:text-white/70 text-xs flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            data-testid="btn-logout"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#DDE2EC] px-8 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <div className="text-[10px] text-[#8B9BB4] uppercase tracking-widest font-bold mb-0.5">CapSubvention · Espace personnel</div>
            <h1 className="text-lg font-bold text-[#0D1F3C]">
              {NAV_ITEMS.find((n) => n.href === location)?.label || "Tableau de bord"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Connexion sécurisée
            </span>
            <div className="w-9 h-9 rounded-full bg-[#0D1F3C]/8 border border-[#DDE2EC] flex items-center justify-center text-[#0D1F3C] font-bold text-sm uppercase">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
