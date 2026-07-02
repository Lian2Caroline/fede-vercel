import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FolderOpen, CreditCard, Star, LogOut, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CSLogo } from "@/components/CSLogo";

const NAV_ITEMS = [
  { id: "dashboard", href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { id: "dossiers", href: "/admin/dossiers", icon: FolderOpen, label: "Dossiers & Messagerie" },
  { id: "frais", href: "/admin/frais", icon: CreditCard, label: "Frais d'instruction" },
  { id: "reviews", href: "/admin/avis", icon: Star, label: "Modération des avis" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#F1F4FA] font-sans text-slate-800 overflow-hidden">
      <aside className="w-64 bg-[#0D1F3C] flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="cursor-pointer">
            <CSLogo size="sm" variant="light" showText subtitle="Espace Conseillers" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href || (location.startsWith(item.href) && item.href !== "/admin");
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  active ? "bg-white/15 text-white shadow-sm" : "text-white/55 hover:bg-white/8 hover:text-white/85"
                }`}
                data-testid={`admin-nav-${item.id}`}
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
              <div className="w-9 h-9 rounded-full bg-[#B5872A]/25 border border-[#B5872A]/30 flex items-center justify-center text-[#D4A847] font-bold text-xs uppercase shrink-0">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{user?.prenom} {user?.nom}</div>
                <div className="text-[#B5872A]/70 text-[10px] flex items-center gap-1">
                  <Briefcase className="w-2.5 h-2.5" /> Conseiller CapSubvention
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full text-left text-white/40 hover:text-white/70 text-xs flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            data-testid="admin-btn-logout"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#DDE2EC] px-8 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <div className="text-[10px] text-[#B5872A] uppercase tracking-widest font-bold mb-0.5">CapSubvention · Espace Conseillers</div>
            <h1 className="text-lg font-bold text-[#0D1F3C]">
              {NAV_ITEMS.find((n) => location === n.href || (location.startsWith(n.href) && n.href !== "/admin"))?.label || "Tableau de bord"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-[#FBF5E0] text-[#B5872A] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#e8d9a0]">
              <Briefcase className="w-3 h-3" /> Session conseiller sécurisée
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
