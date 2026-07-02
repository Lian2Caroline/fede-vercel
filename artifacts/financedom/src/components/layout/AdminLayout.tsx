import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FolderOpen, CreditCard, Star, LogOut, Briefcase, Users, Banknote, BookOpen, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CSLogo } from "@/components/CSLogo";

const BASE = import.meta.env.VITE_API_URL ?? "";

const NAV_ITEMS = [
  { id: "dashboard", href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { id: "dossiers", href: "/admin/dossiers", icon: FolderOpen, label: "Dossiers & Messagerie" },
  { id: "frais", href: "/admin/frais", icon: CreditCard, label: "Frais d'instruction" },
  { id: "virements", href: "/admin/virements", icon: Banknote, label: "Virements des fonds" },
  { id: "users", href: "/admin/users", icon: Users, label: "Utilisateurs" },
  { id: "reviews", href: "/admin/avis", icon: Star, label: "Modération des avis" },
  { id: "guide", href: "/admin/guide", icon: BookOpen, label: "Guide d'utilisation" },
  { id: "parametres", href: "/admin/parametres", icon: Settings, label: "Paramètres" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const r = await fetch(`${BASE}/api/admin/messages/unread-count`, { credentials: "include" });
        if (!r.ok) return;
        const data = await r.json();
        if (!cancelled) setUnreadMsgs(Number(data?.count ?? 0));
      } catch {
        // Silent: badge is non-critical.
      }
    }
    refresh();
    const id = window.setInterval(refresh, 30000);
    const onFocus = () => refresh();
    const onCustom = () => refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("admin-messages-read", onCustom);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("admin-messages-read", onCustom);
    };
  }, [location]);

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
            const showBadge = item.id === "dossiers" && unreadMsgs > 0;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  active ? "bg-white/15 text-white shadow-sm" : "text-white/55 hover:bg-white/8 hover:text-white/85"
                }`}
                data-testid={`admin-nav-${item.id}`}
              >
                <div className="relative shrink-0">
                  <Icon className={`w-5 h-5 ${active ? 'text-[#FFD500]' : ''}`} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0D1F3C]" />
                  )}
                </div>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {showBadge && !active && (
                  <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                    {unreadMsgs > 9 ? "9+" : unreadMsgs}
                  </span>
                )}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD500]" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FFD500]/15 border border-[#FFD500]/30 flex items-center justify-center text-[#FFD500] font-bold text-xs uppercase shrink-0">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{user?.prenom} {user?.nom}</div>
                <div className="text-[#FFD500]/70 text-[10px] flex items-center gap-1">
                  <Briefcase className="w-2.5 h-2.5" /> Conseiller FEDE
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
            <div className="text-[10px] text-[#FFD500] uppercase tracking-widest font-bold mb-0.5">FEDE · Espace Conseillers</div>
            <h1 className="text-lg font-bold text-[#0D1F3C]">
              {NAV_ITEMS.find((n) => location === n.href || (location.startsWith(n.href) && n.href !== "/admin"))?.label || "Tableau de bord"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-[#FFFBDB] text-[#FFD500] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#FFD500]/40">
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
