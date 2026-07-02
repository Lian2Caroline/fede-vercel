import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Users, Search, Shield, CheckCircle, XCircle, Mail, Globe, Building2, Monitor, AlertTriangle, LockKeyhole, UserX, UserCheck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.VITE_API_URL ?? "";

// French territories (métropole + DROM-COM) — connexion considérée normale.
const FRENCH_TERRITORY_CODES = new Set([
  "FR", "GP", "MQ", "GF", "RE", "YT", "PM", "BL", "MF", "NC", "PF", "WF", "TF",
]);

// Convertit un code ISO-3166 alpha-2 en drapeau emoji (offset Unicode standard).
function flagEmoji(code: string): string {
  if (!code || code === "XX") return "🌐";
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "🌐";
  const A = 0x1F1E6;
  const a = "A".charCodeAt(0);
  return String.fromCodePoint(A + (cc.charCodeAt(0) - a), A + (cc.charCodeAt(1) - a));
}

function formatRelativeFr(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 7) return `il y a ${j} j`;
  return `le ${d.toLocaleDateString("fr-FR")}`;
}

interface User {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  territoire: string;
  typePorteur: string;
  organisation: string | null;
  role: string;
  emailVerified: boolean;
  lastLoginIp: string | null;
  lastLoginCountry: string | null;
  lastLoginCountryCode: string | null;
  lastLoginAt: string | null;
  loginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
}

function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    fetch(`${BASE}/api/admin/users`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setUsers(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useState(() => { load(); });

  return { users, isLoading, reload: load };
}

export default function AdminUsers() {
  const { users, isLoading, reload } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "user" | "admin">("all");
  const { toast } = useToast();

  const filtered = users.filter(u => {
    const matchSearch = !search || `${u.prenom} ${u.nom} ${u.email} ${u.organisation ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.role === filter;
    return matchSearch && matchFilter;
  });

  const isSuspended = (u: User) => !!u.lockedUntil && new Date(u.lockedUntil) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  async function setSuspended(user: User, suspend: boolean) {
    const label = suspend ? `Suspendre le compte de ${user.prenom} ${user.nom} ?` : `Réactiver le compte de ${user.prenom} ${user.nom} ?`;
    if (!confirm(label)) return;
    const r = await fetch(`${BASE}/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ suspended: suspend }),
    });
    if (r.ok) {
      toast({ title: suspend ? "Compte suspendu" : "Compte réactivé", description: `${user.prenom} ${user.nom} ${suspend ? "ne peut plus se connecter." : "peut à nouveau se connecter."}` });
      reload();
    } else {
      const err = await r.json().catch(() => ({}));
      toast({ title: "Erreur", variant: "destructive", description: err.error ?? "Impossible de modifier le compte." });
    }
  }

  async function deleteUser(user: User) {
    if (!confirm(`Supprimer définitivement le compte de ${user.prenom} ${user.nom} ? Cette action est irréversible.`)) return;
    const r = await fetch(`${BASE}/api/admin/users/${user.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (r.ok) {
      toast({ title: "Compte supprimé", description: `${user.prenom} ${user.nom} a été supprimé.` });
      reload();
    } else {
      const err = await r.json().catch(() => ({}));
      toast({ title: "Erreur", variant: "destructive", description: err.error ?? "Impossible de supprimer le compte." });
    }
  }

  const totalUsers = users.filter(u => u.role === "user").length;
  const totalAdmins = users.filter(u => u.role === "admin").length;
  const verified = users.filter(u => u.emailVerified).length;
  const suspended = users.filter(u => isSuspended(u)).length;

  return (
    <AdminLayout>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-[#0f1f3d]">{totalUsers}</div>
          <div className="text-sm font-semibold text-[#0f1f3d] mt-1">Porteurs de projet</div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-purple-700">{totalAdmins}</div>
          <div className="text-sm font-semibold text-[#0f1f3d] mt-1">Conseillers</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-green-700">{verified}</div>
          <div className="text-sm font-semibold text-[#0f1f3d] mt-1">Emails vérifiés</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-extrabold text-red-600">{suspended}</div>
          <div className="text-sm font-semibold text-[#0f1f3d] mt-1">Suspendus</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#0f1f3d]" />
            <h2 className="font-bold text-[#0f1f3d]">Gestion des utilisateurs</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#f4f6fb] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none text-gray-700 w-40"
              />
            </div>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 outline-none"
            >
              <option value="all">Tous les rôles</option>
              <option value="user">Porteurs</option>
              <option value="admin">Conseillers</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(user => {
              const suspended = isSuspended(user);
              const isAdmin = user.role === "admin";
              return (
                <div key={user.id} className={`p-5 transition-colors flex items-center gap-4 ${suspended ? "bg-red-50/40 hover:bg-red-50/60" : "hover:bg-gray-50"}`}>
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm uppercase shrink-0 ${suspended ? "bg-red-100 border-red-200 text-red-600" : "bg-[#0D1F3C]/8 border-[#0D1F3C]/10 text-[#0D1F3C]"}`}>
                    {user.prenom[0]}{user.nom[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#0f1f3d] text-sm">{user.prenom} {user.nom}</span>
                      {isAdmin && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" /> Conseiller
                        </span>
                      )}
                      {suspended ? (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                          <UserX className="w-2.5 h-2.5" /> Suspendu
                        </span>
                      ) : user.emailVerified ? (
                        <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" /> Vérifié
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" /> Non vérifié
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Globe className="w-3 h-3" /> {user.territoire}</span>
                      {user.organisation && (
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Building2 className="w-3 h-3" /> {user.organisation}</span>
                      )}
                      <span className="text-xs text-gray-400">Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {user.lastLoginIp ? (
                        <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-gray-400" /> {user.lastLoginIp}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-300 font-mono flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-gray-300" /> Aucune connexion
                        </span>
                      )}
                      {user.lastLoginCountryCode && (
                        <span
                          className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                            FRENCH_TERRITORY_CODES.has(user.lastLoginCountryCode)
                              ? "bg-gray-50 border-gray-200 text-gray-600"
                              : "bg-orange-50 border-orange-200 text-orange-700"
                          }`}
                          title={
                            FRENCH_TERRITORY_CODES.has(user.lastLoginCountryCode)
                              ? user.lastLoginCountry ?? user.lastLoginCountryCode
                              : `Connexion hors territoire français : ${user.lastLoginCountry ?? user.lastLoginCountryCode}`
                          }
                        >
                          <span aria-hidden>{flagEmoji(user.lastLoginCountryCode)}</span>
                          {user.lastLoginCountry ?? user.lastLoginCountryCode}
                        </span>
                      )}
                      {user.lastLoginAt && (
                        <span className="text-[11px] text-gray-400">
                          Connecté {formatRelativeFr(user.lastLoginAt)}
                        </span>
                      )}
                      {!suspended && user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                        <span className="text-[10px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                          <LockKeyhole className="w-2.5 h-2.5" /> Verrouillé (tentatives)
                        </span>
                      )}
                      {user.loginAttempts >= 3 && !suspended && (
                        <span className="text-[10px] bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                          <AlertTriangle className="w-2.5 h-2.5" /> {user.loginAttempts} tentatives
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions — not shown for admin accounts */}
                  {!isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                      {suspended ? (
                        <button
                          onClick={() => setSuspended(user, false)}
                          title="Réactiver le compte"
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Réactiver
                        </button>
                      ) : (
                        <button
                          onClick={() => setSuspended(user, true)}
                          title="Suspendre le compte"
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5" /> Suspendre
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user)}
                        title="Supprimer le compte"
                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
