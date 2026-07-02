import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Paperclip, Search, CreditCard, LogOut, Globe, MessageSquare, Banknote, PlayCircle, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CSLogo } from "@/components/CSLogo";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";

export function UserLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: stats } = useGetDashboardStats();
  const messagesNonLus = stats?.messagesNonLus ?? 0;
  const documentsRejetes = stats?.documentsRejetes ?? 0;
  const documentsOfficielsDisponibles = stats?.documentsOfficielsDisponibles ?? 0;

  // Badge documents : visible uniquement si nouveaux docs depuis dernière visite
  const seenOfficials = parseInt(localStorage.getItem("docs_seen_officials") ?? "0", 10);
  const seenRejected = parseInt(localStorage.getItem("docs_seen_rejected") ?? "0", 10);
  const newOfficials = Math.max(0, documentsOfficielsDisponibles - seenOfficials);
  const newRejected = Math.max(0, documentsRejetes - seenRejected);
  const documentsBadge = newRejected > 0 ? newRejected : newOfficials;
  const documentsBadgeColor = newRejected > 0 ? "red" : "blue";
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { id: "dashboard", href: "/dashboard", icon: LayoutDashboard, label: t("userlayout.nav_dashboard") },
    { id: "dossier", href: "/dossier", icon: FileText, label: t("userlayout.nav_dossier") },
    { id: "documents", href: "/documents", icon: Paperclip, label: t("userlayout.nav_documents") },
    { id: "suivi", href: "/suivi", icon: Search, label: t("userlayout.nav_suivi") },
    { id: "messages", href: "/messages", icon: MessageSquare, label: t("userlayout.nav_messages") },
    { id: "paiement", href: "/paiement", icon: CreditCard, label: t("userlayout.nav_paiement") },
    { id: "transfert", href: "/transfert", icon: Banknote, label: t("userlayout.nav_fonds"), verseOnly: true },
    { id: "parametres", href: "/parametres", icon: Settings, label: t("userlayout.nav_parametres") },
  ];

  return (
    <div className="flex h-screen bg-[#F1F4FA] font-sans text-slate-800 overflow-hidden">
      <aside className="w-64 bg-[#0D1F3C] flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="cursor-pointer">
            <CSLogo size="sm" variant="light" showText subtitle={t("userlayout.space_title")} />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const statut = stats?.dossierActif?.statut;
            const isVerse = statut === "verse";
            const isTransfertAccessible = statut === "verse" || statut === "transfert_effectue";
            if ((item as any).verseOnly && !isTransfertAccessible) return null;
            const active = location === item.href;
            const Icon = item.icon;
            const showMessageBadge = item.id === "messages" && messagesNonLus > 0;
            const showDocBadge = item.id === "documents" && documentsBadge > 0;
            const isFonds = item.id === "transfert";
            const docBadgeBg = documentsBadgeColor === "red" ? "bg-red-500 text-white" : "bg-blue-500 text-white";
            const docDotBg = documentsBadgeColor === "red" ? "bg-red-500" : "bg-blue-500";
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  active
                    ? "bg-white/15 text-white shadow-sm"
                    : isFonds
                    ? "text-[#FFD500]/90 hover:bg-[#FFD500]/10 hover:text-[#FFD500]"
                    : "text-white/55 hover:bg-white/8 hover:text-white/85"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <div className="relative shrink-0">
                  <Icon className={`w-5 h-5 ${active ? 'text-[#FFD500]' : isFonds ? 'text-[#FFD500]' : ''}`} />
                  {showMessageBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0D1F3C]" />
                  )}
                  {showDocBadge && !active && (
                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${docDotBg} rounded-full border border-[#0D1F3C]`} />
                  )}
                  {isFonds && !active && isVerse && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFD500] rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {showMessageBadge && !active && (
                  <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                    {messagesNonLus > 9 ? "9+" : messagesNonLus}
                  </span>
                )}
                {showDocBadge && !active && (
                  <span className={`text-[10px] font-bold ${docBadgeBg} rounded-full px-1.5 py-0.5 leading-none`}>
                    {documentsBadge > 9 ? "9+" : documentsBadge}
                  </span>
                )}
                {isFonds && !active && isVerse && (
                  <span className="text-[10px] font-bold bg-[#FFD500] text-[#0D1F3C] rounded-full px-1.5 py-0.5 leading-none">
                    {t("userlayout.available_badge")}
                  </span>
                )}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD500]" />}
              </Link>
            );
          })}

          <a
            href="/video/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-white/55 hover:bg-white/8 hover:text-white/85"
            data-testid="nav-video"
          >
            <PlayCircle className="w-5 h-5" />
            <span className="text-sm font-medium flex-1">{t("userlayout.nav_video")}</span>
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FFD500]/15 border border-[#FFD500]/30 flex items-center justify-center text-[#FFD500] font-bold text-sm uppercase shrink-0 overflow-hidden">
                {(user as any)?.avatarDataUrl ? (
                  <img src={(user as any).avatarDataUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <>{user?.prenom?.[0]}{user?.nom?.[0]}</>
                )}
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
            <LogOut className="w-4 h-4" /> {t("userlayout.disconnect")}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#DDE2EC] px-8 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <div className="text-[10px] text-[#8B9BB4] uppercase tracking-widest font-bold mb-0.5">{t("userlayout.personal_space")}</div>
            <h1 className="text-lg font-bold text-[#0D1F3C]">
              {NAV_ITEMS.find((n) => n.href === location)?.label || t("userlayout.nav_dashboard")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {t("userlayout.secure_connection")}
            </span>
            <div className="w-9 h-9 rounded-full bg-[#0D1F3C]/8 border border-[#DDE2EC] flex items-center justify-center text-[#0D1F3C] font-bold text-sm uppercase overflow-hidden">
              {(user as any)?.avatarDataUrl ? (
                <img src={(user as any).avatarDataUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <>{user?.prenom?.[0]}{user?.nom?.[0]}</>
              )}
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
