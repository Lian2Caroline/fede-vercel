import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  FolderOpen, AlertTriangle, CreditCard, CheckCircle2, ChevronRight,
  Users, Banknote, TrendingUp, Clock, Activity, ArrowUpRight,
  FileText, MapPin, Star, Inbox, BookOpen, Rocket,
} from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.VITE_API_URL ?? "";

const STATUT_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  soumis: "Soumis",
  en_instruction: "En instruction",
  expertise: "En expertise",
  contrat_envoye: "Contrat envoyé",
  valide: "Validé",
  rejete: "Refusé",
  verse: "Versé",
};

const STATUT_COLORS: Record<string, string> = {
  brouillon: "#94A3B8",
  soumis: "#3B82F6",
  en_instruction: "#F59E0B",
  expertise: "#8B5CF6",
  contrat_envoye: "#6366F1",
  valide: "#10B981",
  rejete: "#EF4444",
  verse: "#059669",
};

interface AdminStats {
  totalDossiers: number;
  enInstruction: number;
  fraisEnAttente: number;
  validesThisMois: number;
  totalFraisPercu: number;
  byStatut: { statut: string; count: number }[];
  byTerritoire: { territoire: string; count: number }[];
}

interface AdminVirement {
  id: number;
  statut: string;
  etapeCourante: number;
  montant: number;
  emailCodeValidatedAt1: string | null;
  user: { prenom: string; nom: string } | null;
  dossier: { reference: string } | null;
}

interface AdminDossier {
  id: number;
  reference: string;
  titre: string;
  statut: string;
  territoire: string;
  montantDemande: number;
  createdAt: string;
  user?: { prenom: string; nom: string; email: string } | null;
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 7) return `il y a ${j} j`;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [virements, setVirements] = useState<AdminVirement[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [dossiers, setDossiers] = useState<AdminDossier[]>([]);
  const [reviewsPending, setReviewsPending] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/api/admin/stats`, { credentials: "include" }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${BASE}/api/admin/virements`, { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${BASE}/api/admin/users`, { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${BASE}/api/admin/dossiers`, { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${BASE}/api/admin/reviews`, { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([s, v, u, d, r]) => {
      setStats(s);
      setVirements(Array.isArray(v) ? v : []);
      setUsersCount(Array.isArray(u) ? u.length : 0);
      setDossiers(Array.isArray(d) ? d : []);
      setReviewsPending(Array.isArray(r) ? r.filter((x: any) => x.status === "pending").length : 0);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const virementsEnCours = virements.filter(v => v.statut === "en_cours").length;
  const virementsAttente = virements.filter(v => {
    if (v.statut !== "en_cours") return false;
    return !!v[`emailCodeValidatedAt${v.etapeCourante}` as keyof AdminVirement];
  }).length;
  const totalFondsEnCours = virements
    .filter(v => v.statut === "en_cours")
    .reduce((s, v) => s + Number(v.montant || 0), 0);

  const recentDossiers = useMemo(() => {
    return [...dossiers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [dossiers]);

  const totalActions = virementsAttente + (stats?.fraisEnAttente ?? 0) + reviewsPending;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 h-80 bg-gray-200 rounded-2xl" />
            <div className="col-span-4 h-80 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* ── EN-TÊTE ── */}
      <div className="bg-gradient-to-br from-[#0f1f3d] via-[#172a52] to-[#0f1f3d] rounded-2xl px-7 py-6 mb-6 shadow-sm border border-[#0f1f3d]/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD500]/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] font-semibold text-[#FFD500] uppercase tracking-[0.18em] mb-1.5">
              Espace Conseillers · {today}
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Tableau de bord</h1>
            <p className="text-sm text-white/60 mt-1">Pilotez l'instruction, les frais et les virements en un coup d'œil.</p>
          </div>
          <div className="flex items-center gap-3">
            {totalActions > 0 ? (
              <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-400/30 px-4 py-2 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span className="text-amber-100 text-sm font-semibold">
                  {totalActions} action{totalActions > 1 ? "s" : ""} requise{totalActions > 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-4 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-100 text-sm font-semibold">Aucune action en attente</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BANNIÈRE GUIDE ── */}
      <Link href="/admin/guide">
        <div className="mb-6 rounded-2xl overflow-hidden cursor-pointer group relative"
          style={{ background: "linear-gradient(135deg, #B5872A 0%, #FFD500 50%, #B5872A 100%)" }}>
          <div className="absolute inset-0 bg-[#0D1F3C]/10 group-hover:bg-[#0D1F3C]/0 transition-colors" />
          <div className="relative flex items-center justify-between px-7 py-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-[#0D1F3C]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Rocket className="w-3.5 h-3.5 text-[#0D1F3C]/70" />
                  <span className="text-[10px] font-bold text-[#0D1F3C]/70 uppercase tracking-widest">Première connexion ?</span>
                </div>
                <p className="font-extrabold text-[#0D1F3C] text-base leading-tight">
                  Consultez le guide d'utilisation avant de commencer
                </p>
                <p className="text-[#0D1F3C]/70 text-xs mt-0.5">
                  Paramétrage, workflow complet des dossiers, frais, virements — tout est expliqué étape par étape.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-[#0D1F3C] text-[#FFD500] text-sm font-bold px-5 py-2.5 rounded-xl group-hover:bg-[#162B52] transition-colors shadow-md whitespace-nowrap">
              Ouvrir le guide <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>

      {/* ── KPI principaux ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<FolderOpen className="w-5 h-5" />}
          label="Dossiers"
          sublabel="Portefeuille total"
          value={stats?.totalDossiers ?? 0}
          accent="navy"
          href="/admin/dossiers"
        />
        <KpiCard
          icon={<Clock className="w-5 h-5" />}
          label="En instruction"
          sublabel="À traiter"
          value={stats?.enInstruction ?? 0}
          accent="amber"
          href="/admin/dossiers"
        />
        <KpiCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Frais en attente"
          sublabel="Paiements à confirmer"
          value={stats?.fraisEnAttente ?? 0}
          accent="orange"
          href="/admin/frais"
          alert={(stats?.fraisEnAttente ?? 0) > 0}
        />
        <KpiCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Validés ce mois"
          sublabel="Décisions favorables"
          value={stats?.validesThisMois ?? 0}
          accent="green"
          href="/admin/dossiers"
        />
      </div>

      {/* ── KPI financiers ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <FinanceCard
          icon={<Banknote className="w-4 h-4" />}
          label="Virements en cours"
          value={virementsEnCours.toString()}
          hint={virementsAttente > 0 ? `${virementsAttente} action(s) requise(s)` : "Tout est à jour"}
          alert={virementsAttente > 0}
          href="/admin/virements"
        />
        <FinanceCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Fonds en transit"
          value={totalFondsEnCours.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
          hint="Montant cumulé en cours"
          href="/admin/virements"
        />
        <FinanceCard
          icon={<CreditCard className="w-4 h-4" />}
          label="Frais perçus"
          value={(stats?.totalFraisPercu ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
          hint="Encaissements confirmés"
          href="/admin/frais"
        />
        <FinanceCard
          icon={<Users className="w-4 h-4" />}
          label="Inscrits"
          value={usersCount.toString()}
          hint="Comptes utilisateurs"
          href="/admin/users"
        />
      </div>

      {/* ── GRILLE PRINCIPALE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-8 space-y-6">
          {/* Répartition par statut */}
          <Section
            title="Répartition par statut"
            icon={<Activity className="w-4 h-4" />}
            action={<Link href="/admin/dossiers" className="text-xs font-semibold text-[#0f1f3d] hover:text-[#FFD500] flex items-center gap-1">Voir tout <ChevronRight className="w-3.5 h-3.5" /></Link>}
          >
            <div className="space-y-3.5">
              {stats?.byStatut?.length ? stats.byStatut.map(s => {
                const total = stats.totalDossiers || 1;
                const pct = (s.count / total) * 100;
                const color = STATUT_COLORS[s.statut] ?? "#6B7280";
                return (
                  <div key={s.statut}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
                        {STATUT_LABELS[s.statut] ?? s.statut}
                      </span>
                      <span className="font-bold text-[#0f1f3d] tabular-nums">
                        {s.count}<span className="text-gray-400 font-normal text-xs ml-1">({Math.round(pct)}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              }) : <EmptyState icon={<Inbox className="w-5 h-5" />} text="Aucun dossier enregistré" />}
            </div>
          </Section>

          {/* Activité récente */}
          <Section
            title="Activité récente"
            icon={<FileText className="w-4 h-4" />}
            action={<Link href="/admin/dossiers" className="text-xs font-semibold text-[#0f1f3d] hover:text-[#FFD500] flex items-center gap-1">Tous les dossiers <ChevronRight className="w-3.5 h-3.5" /></Link>}
          >
            {recentDossiers.length === 0 ? (
              <EmptyState icon={<Inbox className="w-5 h-5" />} text="Aucun dossier récent" />
            ) : (
              <div className="divide-y divide-gray-100 -mx-1">
                {recentDossiers.map(d => {
                  const color = STATUT_COLORS[d.statut] ?? "#6B7280";
                  return (
                    <Link
                      key={d.id}
                      href="/admin/dossiers"
                      className="flex items-center gap-4 py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#f4f6fb] flex items-center justify-center text-[11px] font-bold text-[#0f1f3d] shrink-0">
                        {(d.user?.prenom?.[0] ?? "?")}{(d.user?.nom?.[0] ?? "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#0f1f3d] text-sm truncate">
                            {d.user?.prenom} {d.user?.nom}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">{d.reference}</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-2 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" /> {d.territoire}
                          <span className="text-gray-300">·</span>
                          <span>{formatRelative(d.createdAt)}</span>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md whitespace-nowrap"
                        style={{ backgroundColor: `${color}1a`, color }}
                      >
                        {STATUT_LABELS[d.statut] ?? d.statut}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFD500] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Virements en attente d'action */}
          {virementsAttente > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Virements — code financier requis
                </h3>
                <Link href="/admin/virements" className="text-xs text-amber-800 font-semibold hover:underline flex items-center gap-1">
                  Voir tout <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {virements
                  .filter(v => v.statut === "en_cours" && !!v[`emailCodeValidatedAt${v.etapeCourante}` as keyof AdminVirement])
                  .slice(0, 3)
                  .map(v => (
                    <Link
                      key={v.id}
                      href="/admin/virements"
                      className="bg-white border border-amber-200/60 rounded-xl px-4 py-3 flex items-center justify-between hover:border-amber-300 hover:shadow-sm transition-all"
                    >
                      <div>
                        <div className="font-semibold text-[#0f1f3d] text-sm">{v.user?.prenom} {v.user?.nom}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{v.dossier?.reference} · {Number(v.montant).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">Étape {v.etapeCourante}</span>
                        <ArrowUpRight className="w-4 h-4 text-amber-700" />
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-4 space-y-6">
          {/* Par territoire */}
          <Section title="Répartition par territoire" icon={<MapPin className="w-4 h-4" />}>
            <div className="space-y-3">
              {stats?.byTerritoire?.length ? stats.byTerritoire.map(t => {
                const total = stats.totalDossiers || 1;
                const pct = (t.count / total) * 100;
                return (
                  <div key={t.territoire}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{t.territoire}</span>
                      <span className="font-bold text-[#0f1f3d] tabular-nums">{t.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#FFD500] to-[#FFC900] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              }) : <EmptyState icon={<MapPin className="w-5 h-5" />} text="Aucune donnée" />}
            </div>
          </Section>

          {/* Actions rapides */}
          <div className="bg-gradient-to-br from-[#0f1f3d] to-[#172a52] rounded-2xl p-5 text-white shadow-sm border border-[#0f1f3d]/10">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFD500] mb-3">Accès rapides</div>
            <div className="space-y-2">
              <QuickLink href="/admin/virements" label="Virements des fonds" badge={virementsAttente > 0 ? virementsAttente : undefined} primary />
              <QuickLink href="/admin/frais" label="Frais d'instruction" badge={(stats?.fraisEnAttente ?? 0) > 0 ? stats!.fraisEnAttente : undefined} />
              <QuickLink href="/admin/dossiers" label="Tous les dossiers" />
              <QuickLink href="/admin/users" label="Utilisateurs" hint={usersCount.toString()} />
              <QuickLink href="/admin/reviews" label="Modération des avis" badge={reviewsPending > 0 ? reviewsPending : undefined} icon={<Star className="w-3.5 h-3.5" />} />
              <QuickLink href="/admin/guide" label="Guide d'utilisation" icon={<BookOpen className="w-3.5 h-3.5" />} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ── Composants ──────────────────────────────────────────────────────────── */

function KpiCard({
  icon, label, sublabel, value, accent, href, alert,
}: {
  icon: React.ReactNode; label: string; sublabel: string;
  value: number | string; accent: "navy" | "amber" | "orange" | "green";
  href: string; alert?: boolean;
}) {
  const styles: Record<string, { bg: string; border: string; iconWrap: string; valueColor: string }> = {
    navy:   { bg: "bg-white",       border: "border-gray-200",     iconWrap: "bg-[#0f1f3d]/5 text-[#0f1f3d]",  valueColor: "text-[#0f1f3d]" },
    amber:  { bg: "bg-amber-50/60", border: "border-amber-100",    iconWrap: "bg-amber-100 text-amber-700",    valueColor: "text-amber-700" },
    orange: { bg: "bg-orange-50/60",border: "border-orange-100",   iconWrap: "bg-orange-100 text-orange-700",  valueColor: "text-orange-700" },
    green:  { bg: "bg-emerald-50/60",border: "border-emerald-100", iconWrap: "bg-emerald-100 text-emerald-700",valueColor: "text-emerald-700" },
  };
  const s = styles[accent];
  return (
    <Link
      href={href}
      className={`group ${s.bg} border ${s.border} rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${s.iconWrap} flex items-center justify-center`}>{icon}</div>
        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFD500] transition-colors" />
      </div>
      <div className={`text-3xl font-extrabold tabular-nums ${s.valueColor} leading-none mb-1.5`}>
        {value}{alert && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse align-middle" />}
      </div>
      <div className="text-sm font-bold text-[#0f1f3d]">{label}</div>
      <div className="text-[11px] text-gray-500 mt-0.5">{sublabel}</div>
    </Link>
  );
}

function FinanceCard({
  icon, label, value, hint, alert, href,
}: {
  icon: React.ReactNode; label: string; value: string; hint: string;
  alert?: boolean; href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#FFD500]/30 transition-all"
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
        <span className="text-[#FFD500]">{icon}</span>
        {label}
      </div>
      <div className="text-xl font-extrabold text-[#0f1f3d] tabular-nums">{value}</div>
      <div className={`text-[11px] mt-1 ${alert ? "text-amber-600 font-semibold" : "text-gray-400"}`}>{hint}</div>
    </Link>
  );
}

function Section({
  title, icon, action, children,
}: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-[#0f1f3d] text-sm flex items-center gap-2">
          <span className="text-[#FFD500]">{icon}</span> {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">{icon}</div>
      <div className="text-sm">{text}</div>
    </div>
  );
}

function QuickLink({
  href, label, badge, hint, primary, icon,
}: { href: string; label: string; badge?: number; hint?: string; primary?: boolean; icon?: React.ReactNode }) {
  const base = primary
    ? "bg-[#FFD500]/20 hover:bg-[#FFD500]/30 border-[#FFD500]/30 text-[#FFD500]"
    : "bg-white/5 hover:bg-white/10 border-white/10 text-white";
  return (
    <Link
      href={href}
      className={`w-full ${base} border text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-between transition-colors`}
    >
      <span className="flex items-center gap-2">{icon}{label}</span>
      {badge !== undefined ? (
        <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      ) : hint ? (
        <span className="text-white/40 text-[10px]">{hint}</span>
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
    </Link>
  );
}
