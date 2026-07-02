import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Star, CheckCircle, XCircle, Trash2, Plus, Eye, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Review = {
  id: number;
  userId: number | null;
  name: string;
  territoire: string;
  typeProjet: string;
  note: number;
  texte: string;
  montant: string | null;
  dispositif: string | null;
  date: string;
  verified: boolean;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const TERRITORIES = ["Martinique", "Guadeloupe", "La Réunion", "Nouvelle-Calédonie", "Polynésie française"];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Approuvé", color: "bg-green-100 text-green-700 border-green-200" },
  rejected: { label: "Rejeté", color: "bg-red-100 text-red-700 border-red-200" },
};

function StarRow({ note, size = 14 }: { note: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`fill-current ${i <= note ? "text-[#B5872A]" : "text-gray-200"}`} style={{ width: size, height: size }} />
      ))}
    </span>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", territoire: "Martinique", typeProjet: "", note: 5,
    texte: "", montant: "", dispositif: "",
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/reviews");
      setReviews(data);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les avis.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      const updated = await apiFetch(`/admin/reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setReviews(prev => prev.map(r => r.id === id ? updated : r));
      toast({ title: status === "approved" ? "Avis approuvé ✓" : "Avis rejeté", description: "Mise à jour effectuée." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour.", variant: "destructive" });
    }
  }

  async function deleteReview(id: number) {
    if (!confirm("Supprimer cet avis définitivement ?")) return;
    try {
      await apiFetch(`/admin/reviews/${id}`, { method: "DELETE" });
      setReviews(prev => prev.filter(r => r.id !== id));
      toast({ title: "Supprimé", description: "L'avis a été supprimé." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer.", variant: "destructive" });
    }
  }

  async function addReview() {
    if (!form.name || !form.texte) {
      toast({ title: "Erreur", description: "Nom et texte requis.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const created = await apiFetch("/admin/reviews", {
        method: "POST",
        body: JSON.stringify({ ...form }),
      });
      setReviews(prev => [created, ...prev]);
      setShowAddForm(false);
      setForm({ name: "", territoire: "Martinique", typeProjet: "", note: 5, texte: "", montant: "", dispositif: "" });
      toast({ title: "Avis ajouté ✓", description: "L'avis est publié immédiatement." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ajouter l'avis.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = filter === "all" ? reviews : reviews.filter(r => r.status === filter);
  const counts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    rejected: reviews.filter(r => r.status === "rejected").length,
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0f1f3d] mb-1">Gestion des avis</h2>
          <p className="text-gray-500 text-sm">Modérez les avis déposés par les utilisateurs. Ajoutez des avis directement.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#0D1F3C] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162B52] transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter un avis
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-[#DDE2EC] rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-[#0D1F3C] mb-4">Nouvel avis (publié immédiatement)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nom complet *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Marie L." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Territoire *</label>
              <select value={form.territoire} onChange={e => setForm(f => ({ ...f, territoire: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20">
                {TERRITORIES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Type de projet</label>
              <input value={form.typeProjet} onChange={e => setForm(f => ({ ...f, typeProjet: e.target.value }))}
                placeholder="Ex: Commerce alimentaire" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Note (1–5) *</label>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, note: n }))}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${form.note >= n ? "bg-[#B5872A] text-white" : "bg-gray-100 text-gray-400"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Montant obtenu</label>
              <input value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
                placeholder="Ex: 28 000€" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Dispositif</label>
              <input value={form.dispositif} onChange={e => setForm(f => ({ ...f, dispositif: e.target.value }))}
                placeholder="Ex: FEDER Martinique" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Témoignage *</label>
            <textarea value={form.texte} onChange={e => setForm(f => ({ ...f, texte: e.target.value }))}
              rows={4} placeholder="Rédigez le témoignage..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={addReview} disabled={submitting}
              className="bg-[#B5872A] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#9a7020] transition-colors disabled:opacity-50">
              {submitting ? "Publication..." : "Publier l'avis"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {([["pending", "En attente"], ["approved", "Approuvés"], ["rejected", "Rejetés"], ["all", "Tous"]] as const).map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${filter === val ? "bg-[#0D1F3C] text-white border-[#0D1F3C]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
            {lbl} <span className="ml-1.5 text-xs opacity-70">{counts[val as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#DDE2EC] rounded-2xl p-12 text-center">
          <Eye className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Aucun avis dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <div key={review.id} className="bg-white border border-[#DDE2EC] rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-[#0D1F3C] text-sm">{review.name}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{review.territoire}</span>
                    {review.typeProjet && <span className="text-xs text-gray-400">· {review.typeProjet}</span>}
                    <StarRow note={review.note} size={12} />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[review.status]?.color}`}>
                      {STATUS_CONFIG[review.status]?.label}
                    </span>
                    {review.userId === null && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Admin</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.texte}</p>
                  {(review.montant || review.dispositif) && (
                    <div className="flex gap-3 mt-2">
                      {review.montant && <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">{review.montant}</span>}
                      {review.dispositif && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{review.dispositif}</span>}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 mt-2">
                    Reçu le {new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {review.date && ` · Date d'avis : ${review.date}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {review.status !== "approved" && (
                    <button onClick={() => updateStatus(review.id, "approved")}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Approuver
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button onClick={() => updateStatus(review.id, "rejected")}
                      className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Rejeter
                    </button>
                  )}
                  <button onClick={() => deleteReview(review.id)}
                    className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
