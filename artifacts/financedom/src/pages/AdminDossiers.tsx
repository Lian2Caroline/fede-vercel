import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminDossiers, useUpdateDossierStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, Mail, CheckCircle, XCircle, MessageSquare, Info, Settings, Send, FileText, Download, Clock, AlertCircle, Zap, FolderOpen, Paperclip, ShieldCheck, ShieldX, Eye } from "lucide-react";
import { STATUS_COLORS, TERRITORIES } from "@/lib/constants";
import { Link } from "wouter";
import { downloadAdminDoc } from "@/lib/doc-download";

type Message = {
  id: number;
  dossierId: number;
  expediteur: string;
  expediteurRole: string;
  contenu: string;
  lu: boolean;
  createdAt: string;
};

const BASE = import.meta.env.VITE_API_URL ?? "";

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const contentType = res.headers.get("content-type") ?? "";
  // Guard: if the response is HTML (e.g. CDN cache returning the SPA), treat it as
  // a server error rather than silently returning null from a failed JSON.parse.
  if (contentType.includes("text/html")) {
    throw new Error(`Erreur ${res.status}: réponse inattendue du serveur`);
  }
  const raw = await res.text();
  let body: any = null;
  if (raw) {
    try { body = JSON.parse(raw); } catch { body = null; }
  }
  if (!res.ok) {
    const msg = body?.error || body?.message || (raw && !raw.trim().startsWith("<") ? raw : null) || `Erreur ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

const STATUTS = [
  { value: "soumis", label: "Soumis" },
  { value: "en_instruction", label: "En instruction" },
  { value: "expertise", label: "Expertise" },
  { value: "contrat_envoye", label: "Contrat envoyé" },
  { value: "valide", label: "Validé" },
  { value: "rejete", label: "Rejeté" },
  { value: "verse", label: "Versé" },
  { value: "transfert_effectue", label: "Transfert effectué" },
];

const PHASE_ACTIONS = [
  {
    action: "accuser_reception",
    phase: 1,
    label: "Phase 1 — Prise en charge",
    cta: "Accuser réception et prendre en charge",
    desc: "Envoie l'accusé de réception officiel au porteur et démarre l'instruction.",
    docs: [{ type: "accuse_reception", label: "Accusé de réception" }],
    color: "blue",
  },
  {
    action: "envoyer_eligibilite",
    phase: 2,
    label: "Phase 2 — Analyse d'éligibilité",
    cta: "Envoyer le rapport d'éligibilité",
    desc: "Envoie le rapport d'éligibilité favorable + la fiche de renseignements complémentaires.",
    docs: [
      { type: "rapport_eligibilite", label: "Rapport d'éligibilité" },
      { type: "fiche_collecte", label: "Fiche de renseignements" },
    ],
    color: "indigo",
  },
  {
    action: "envoyer_contrat",
    phase: 3,
    label: "Phase 3 — Contractualisation",
    cta: "Envoyer le contrat de mission",
    desc: "Envoie le contrat de mission de conseil en financement public au porteur.",
    docs: [{ type: "contrat_mission", label: "Contrat de mission" }],
    color: "violet",
  },
  {
    action: "marquer_signe",
    phase: 4,
    label: "Phase 4 — Constitution du dossier",
    cta: "Marquer le contrat signé — débuter la constitution",
    desc: "Confirme la réception du contrat signé. La constitution du dossier peut débuter.",
    docs: [],
    color: "amber",
  },
  {
    action: "marquer_favorable",
    phase: 5,
    label: "Phase 5 — Décision favorable",
    cta: "Notifier la décision favorable",
    desc: "Envoie la notification d'attribution au porteur et déclenche la demande de paiement des frais (456 € TTC).",
    docs: [{ type: "notification", label: "Notification d'attribution" }],
    color: "green",
  },
  {
    action: "confirmer_paiement",
    phase: 6,
    label: "Phase 6 — Clôture",
    cta: "Confirmer le paiement — Clôturer le dossier",
    desc: "Confirme le règlement des frais d'instruction et clôture définitivement le dossier.",
    docs: [],
    color: "emerald",
  },
];

export default function AdminDossiers() {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterTerr, setFilterTerr] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"infos" | "pieces" | "messages" | "actions">("infos");
  const [adminDocs, setAdminDocs] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [rejectMotifByDoc, setRejectMotifByDoc] = useState<Record<number, string>>({});
  const [rejectingDocId, setRejectingDocId] = useState<number | null>(null);
  const [docActionLoading, setDocActionLoading] = useState<number | null>(null);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const [newStatut, setNewStatut] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [expertDesigne, setExpertDesigne] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [phaseLoading, setPhaseLoading] = useState<string | null>(null);
  const [phaseNote, setPhaseNote] = useState("");
  const [confirmPaiementOpen, setConfirmPaiementOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: dossiers = [], isLoading } = useListAdminDossiers({
    statut: filterStatut || undefined,
    territoire: filterTerr || undefined,
    search: search || undefined,
  });

  const updateStatusMutation = useUpdateDossierStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const selected = dossiers.find(d => d.id === selectedId);

  useEffect(() => {
    if (activeTab === "messages" && selectedId) {
      fetchMessages(selectedId);
      pollingRef.current = window.setInterval(() => fetchMessages(selectedId), 3000);
      return () => { if (pollingRef.current) window.clearInterval(pollingRef.current); };
    } else {
      if (pollingRef.current) { window.clearInterval(pollingRef.current); pollingRef.current = null; }
    }
  }, [activeTab, selectedId]);

  useEffect(() => {
    if (activeTab === "actions" && selectedId) fetchEvents(selectedId);
  }, [activeTab, selectedId]);

  useEffect(() => {
    if (activeTab === "pieces" && selectedId) fetchAdminDocs(selectedId);
  }, [activeTab, selectedId]);

  useEffect(() => {
    setRejectMotifByDoc({});
    setRejectingDocId(null);
    setMessages([]);
  }, [selectedId]);

  async function fetchAdminDocs(dossierId: number) {
    setDocsLoading(true);
    setDocsError(null);
    try {
      const data = await apiFetch(`/admin/dossiers/${dossierId}/documents`);
      setAdminDocs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg = err?.message || "Impossible de charger les pièces.";
      setDocsError(msg);
      toast({ title: "Chargement des pièces impossible", description: msg, variant: "destructive" });
    } finally {
      setDocsLoading(false);
    }
  }

  async function reviewDocument(docId: number, statut: "valide" | "rejete", motif?: string) {
    if (!selectedId) return;
    setDocActionLoading(docId);
    try {
      await apiFetch(`/admin/dossiers/${selectedId}/documents/${docId}`, {
        method: "PATCH",
        body: JSON.stringify({ statut, motif }),
      });
      await fetchAdminDocs(selectedId);
      setRejectingDocId(null);
      setRejectMotifByDoc(prev => { const n = { ...prev }; delete n[docId]; return n; });
      toast({
        title: statut === "valide" ? "Pièce validée ✓" : "Pièce rejetée",
        description: statut === "valide" ? "La pièce est marquée comme conforme." : "Email automatique envoyé à l'usager avec le motif.",
      });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Action impossible.", variant: "destructive" });
    } finally {
      setDocActionLoading(null);
    }
  }

  useEffect(() => {
    if (selectedId) { setEvents([]); setPhaseNote(""); }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selected) {
      setNewStatut(selected.statut || "");
      setExpertDesigne(selected.expertDesigne || "");
    }
  }, [selected]);

  async function fetchMessages(dossierId: number) {
    try {
      const data = await apiFetch(`/admin/dossiers/${dossierId}/messages`);
      if (!Array.isArray(data)) return;
      // Préserve les messages optimistes (id négatif, pas encore confirmés par le serveur).
      setMessages(prev => {
        const optimistic = prev.filter(m => m.id < 0);
        return [...data, ...optimistic];
      });
      window.dispatchEvent(new Event("admin-messages-read"));
    } catch {}
  }

  async function fetchEvents(dossierId: number) {
    try {
      const data = await apiFetch(`/admin/dossiers/${dossierId}/events`);
      setEvents(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function executePhaseAction(action: string) {
    if (!selectedId || phaseLoading) return;
    if (action === "confirmer_paiement") {
      setConfirmPaiementOpen(true);
      return;
    }
    setPhaseLoading(action);
    try {
      await apiFetch(`/admin/dossiers/${selectedId}/phase-action`, {
        method: "POST",
        body: JSON.stringify({ action, note: phaseNote || undefined }),
      });
      await fetchEvents(selectedId);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dossiers"] });
      setPhaseNote("");
      toast({ title: "Action exécutée ✓", description: PHASE_ACTIONS.find(p => p.action === action)?.label ?? action });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'exécuter l'action.", variant: "destructive" });
    } finally {
      setPhaseLoading(null);
    }
  }

  async function openPdf(dossierId: number, type: string) {
    setPdfLoading(type);
    try {
      await downloadAdminDoc(dossierId, type);
    } catch {
      toast({ title: "Erreur", description: "Impossible de générer le PDF", variant: "destructive" });
    } finally {
      setPdfLoading(null);
    }
  }

  async function sendMessage() {
    if (!msgInput.trim() || !selectedId) return;
    const contenu = msgInput.trim();
    const dossierId = selectedId;

    // ── Optimistic update : on affiche immédiatement le message avec un id négatif ──
    const tempId = -Date.now();
    const optimistic: Message = {
      id: tempId,
      dossierId,
      expediteur: "FEDE — Conseillers",
      expediteurRole: "admin",
      contenu,
      lu: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setMsgInput("");
    setSending(true);

    try {
      const serverMsg = await apiFetch(`/admin/dossiers/${dossierId}/messages`, {
        method: "POST",
        body: JSON.stringify({ contenu }),
      });
      // Remplace l'optimiste par la version serveur (avec vrai id positif).
      if (serverMsg && typeof serverMsg === "object" && typeof serverMsg.id === "number") {
        setMessages(prev => prev.map(m => (m.id === tempId ? serverMsg : m)));
      }
    } catch (err: any) {
      // Échec → on enlève l'optimiste et on restaure le texte saisi.
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setMsgInput(contenu);
      toast({
        title: "Échec de l'envoi",
        description: err?.message || "Impossible d'envoyer le message. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  const handleUpdateStatus = async () => {
    if (!selected || !newStatut) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selected.id,
        data: { statut: newStatut, expertDesigne: expertDesigne || undefined, commentaire: commentaire || undefined },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dossiers"] });
      setCommentaire("");
      toast({ title: "Succès ✓", description: `Statut mis à jour : ${newStatut}` });
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    }
  };

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-48 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un dossier ou porteur..."
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] bg-white"
          />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20">
          <option value="">Tous les statuts</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterTerr} onChange={e => setFilterTerr(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20">
          <option value="">Tous les territoires</option>
          {TERRITORIES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
        </select>
        <span className="text-xs text-gray-400">{dossiers.length} dossier(s)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className={selected ? "md:col-span-7" : "md:col-span-12"}>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[#f4f6fb] border-b border-gray-200">
                <tr>
                  {["N° Dossier", "Porteur", "Territoire / Dispositif", "Montant", "Statut", "Date"].map(h => (
                    <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wide px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-500">Chargement...</td></tr>
                ) : dossiers.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-500">Aucun dossier trouvé</td></tr>
                ) : dossiers.map(d => (
                  <tr
                    key={d.id}
                    onClick={() => { setSelectedId(selectedId === d.id ? null : d.id); setActiveTab("infos"); }}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedId === d.id ? "bg-[#1a2f5e]/5" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold text-[#1a2f5e] text-xs">{d.reference}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-800">{d.user?.prenom} {d.user?.nom}</div>
                      <div className="text-xs text-gray-400">{d.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-gray-700">{d.territoire}</div>
                      <div className="text-xs text-gray-400">{d.dispositif}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#0f1f3d] text-xs">{d.montantDemande.toLocaleString("fr-FR")} €</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[d.statut] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {d.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(d.createdAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="md:col-span-5">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-0 flex flex-col" style={{ maxHeight: "calc(100vh - 180px)" }}>
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <div className="font-extrabold text-[#0f1f3d] text-sm">{selected.reference}</div>
                  <div className={`mt-1 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[selected.statut] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {selected.statut}
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>

              <div className="flex border-b border-gray-100 shrink-0">
                {[
                  { key: "infos" as const, icon: Info, label: "Infos" },
                  { key: "pieces" as const, icon: FolderOpen, label: "Pièces" },
                  { key: "messages" as const, icon: MessageSquare, label: "Messages" },
                  { key: "actions" as const, icon: Settings, label: "Actions" },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${activeTab === tab.key ? "text-[#0D1F3C] border-b-2 border-[#0D1F3C]" : "text-gray-400 hover:text-gray-600"}`}>
                    <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "infos" && (
                <div className="p-5 space-y-2.5 text-sm overflow-y-auto">
                  {[
                    { l: "Porteur", v: `${selected.user?.prenom} ${selected.user?.nom}` },
                    { l: "Email", v: selected.user?.email },
                    { l: "Téléphone", v: selected.user?.telephone },
                    { l: "Territoire", v: selected.territoire },
                    { l: "Dispositif", v: selected.dispositif },
                    { l: "Secteur", v: selected.secteur },
                    { l: "Montant demandé", v: `${selected.montantDemande?.toLocaleString("fr-FR")} €` },
                    { l: "Apport personnel", v: `${selected.montantApport?.toLocaleString("fr-FR")} €` },
                    { l: "Conseiller assigné", v: selected.expertDesigne || "Non assigné" },
                    { l: "Soumis le", v: new Date(selected.createdAt).toLocaleDateString("fr-FR") },
                  ].map(r => (
                    <div key={r.l} className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-400 shrink-0">{r.l}</span>
                      <span className="text-xs font-semibold text-[#0f1f3d] text-right max-w-[55%] truncate" title={r.v}>{r.v || "—"}</span>
                    </div>
                  ))}
                  {selected.description && (
                    <div className="border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-400 block mb-1">Description du projet</span>
                      <span className="text-xs font-semibold text-[#0f1f3d] leading-relaxed whitespace-pre-wrap">{selected.description}</span>
                    </div>
                  )}
                  {selected.justificationBudget && (
                    <div className="border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-400 block mb-1">Justification budgétaire</span>
                      <span className="text-xs font-semibold text-[#0f1f3d] leading-relaxed whitespace-pre-wrap">{selected.justificationBudget}</span>
                    </div>
                  )}

                  {selected.frais && selected.frais.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-bold text-[#0D1F3C] mb-2">Frais d'instruction</div>
                      {selected.frais.map((f: any) => (
                        <div key={f.id} className="bg-[#FBF5E0] border border-[#e8d9a0] rounded-lg p-3">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-[#7a5a2a]">{f.reference}</span>
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${f.statut === "paye" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{f.statut}</span>
                          </div>
                          <div className="text-[#7a5a2a]/80 text-xs mt-1">{f.montantTTC} € TTC</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "pieces" && (
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-[#FFD500]" /> Pièces déposées par l'usager
                    </div>
                    <button onClick={() => fetchAdminDocs(selected.id)} disabled={docsLoading}
                      className="text-[10px] text-gray-400 hover:text-[#0D1F3C] underline">
                      {docsLoading ? "Actualisation…" : "Actualiser"}
                    </button>
                  </div>

                  {docsError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[11px] text-red-800">
                      <div className="font-bold mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Impossible de charger les pièces
                      </div>
                      <div>{docsError}</div>
                      <button onClick={() => fetchAdminDocs(selected.id)}
                        className="mt-2 text-[11px] underline text-red-700 hover:text-red-900">
                        Réessayer
                      </button>
                    </div>
                  )}

                  {docsLoading && adminDocs.length === 0 && !docsError && (
                    <div className="text-center text-xs text-gray-400 py-6">Chargement…</div>
                  )}

                  {!docsLoading && !docsError && adminDocs.length === 0 && (
                    <div className="text-center py-8">
                      <FolderOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs">Aucune pièce déposée pour l'instant.</p>
                    </div>
                  )}

                  {adminDocs.map(doc => {
                    const isRejecting = rejectingDocId === doc.id;
                    const motif = rejectMotifByDoc[doc.id] ?? "";
                    const cfg = (() => {
                      switch (doc.statut) {
                        case "valide":     return { color: "bg-green-50 text-green-700 border-green-200",  label: "Validé" };
                        case "envoye":     return { color: "bg-blue-50 text-blue-700 border-blue-200",     label: "Transmis par email" };
                        case "en_attente": return { color: "bg-amber-50 text-amber-700 border-amber-200",  label: "Prêt à examiner" };
                        case "rejete":     return { color: "bg-red-50 text-red-700 border-red-200",        label: "Rejeté" };
                        default:           return { color: "bg-gray-50 text-gray-500 border-gray-200",     label: "À fournir" };
                      }
                    })();
                    const lockedValidated = doc.statut === "valide";
                    const isPending = doc.statut === "en_attente" || doc.statut === "envoye";

                    return (
                      <div key={doc.id} className={`rounded-lg border p-3 ${
                        doc.statut === "valide" ? "border-green-200 bg-green-50/30" :
                        doc.statut === "rejete" ? "border-red-200 bg-red-50/30" :
                        "border-gray-200 bg-white"
                      }`}>
                        <div className="flex items-start gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#0D1F3C] truncate">{doc.nom}</div>
                            <div className="text-[10px] text-gray-400">
                              type : <span className="font-mono">{doc.type}</span>
                              {doc.uploadedAt && <> · déposé {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}</>}
                              {doc.envois > 0 && <> · {doc.envois} envoi{doc.envois > 1 ? "s" : ""}</>}
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>

                        {doc.hasFile && (
                          <a
                            href={`${BASE}/api/dossiers/${selected.id}/documents/${doc.id}/file`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mb-2"
                          >
                            <Download className="w-2.5 h-2.5" /> Voir le fichier (avant envoi)
                          </a>
                        )}
                        {!doc.hasFile && doc.envoyeAt && (
                          <div className="text-[10px] text-gray-500 mb-2">
                            Transmis par email le {new Date(doc.envoyeAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}

                        {doc.dernierMotifRejet && doc.statut === "rejete" && (
                          <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                            <div className="text-[10px] font-bold text-red-700 uppercase tracking-wide mb-0.5">Motif du dernier rejet</div>
                            <div className="text-[11px] text-red-800 leading-relaxed">{doc.dernierMotifRejet}</div>
                            {doc.dernierRejetAt && (
                              <div className="text-[9px] text-red-500 mt-1">
                                Le {new Date(doc.dernierRejetAt).toLocaleDateString("fr-FR")}
                              </div>
                            )}
                          </div>
                        )}

                        {!lockedValidated && isPending && !isRejecting && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => reviewDocument(doc.id, "valide")}
                              disabled={docActionLoading === doc.id}
                              className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-[11px] font-bold py-1.5 rounded"
                            >
                              <ShieldCheck className="w-3 h-3" /> Valider
                            </button>
                            <button
                              onClick={() => setRejectingDocId(doc.id)}
                              disabled={docActionLoading === doc.id}
                              className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[11px] font-bold py-1.5 rounded"
                            >
                              <ShieldX className="w-3 h-3" /> Rejeter
                            </button>
                          </div>
                        )}

                        {!lockedValidated && doc.statut === "rejete" && !isRejecting && (
                          <button
                            onClick={() => reviewDocument(doc.id, "valide")}
                            disabled={docActionLoading === doc.id}
                            className="w-full flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-[11px] font-bold py-1.5 rounded"
                          >
                            <ShieldCheck className="w-3 h-3" /> Valider quand même
                          </button>
                        )}

                        {isRejecting && (
                          <div className="space-y-2">
                            <textarea
                              value={motif}
                              onChange={e => setRejectMotifByDoc(prev => ({ ...prev, [doc.id]: e.target.value }))}
                              placeholder="Motif du rejet (visible par l'usager dans l'email automatique et dans son espace)…"
                              rows={3}
                              className="w-full border border-red-200 rounded px-2 py-1.5 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
                            />
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => { setRejectingDocId(null); }}
                                className="flex-1 text-[11px] text-gray-500 hover:text-gray-700 py-1.5"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={() => reviewDocument(doc.id, "rejete", motif.trim())}
                                disabled={motif.trim().length < 3 || docActionLoading === doc.id}
                                className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold py-1.5 rounded"
                              >
                                {docActionLoading === doc.id ? "Envoi…" : <><Send className="w-3 h-3" /> Rejeter & notifier</>}
                              </button>
                            </div>
                          </div>
                        )}

                        {lockedValidated && (
                          <div className="text-[10px] text-green-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Pièce conforme — verrouillée
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="text-[10px] text-gray-400 leading-relaxed pt-2 border-t border-gray-100">
                    💡 Les pièces sont reçues en pièce jointe par email à chaque envoi groupé de l'usager. La validation/rejet se fait ici. Un rejet déclenche un email automatique avec le motif et permet à l'usager de redéposer la pièce.
                  </div>
                </div>
              )}

              {activeTab === "messages" && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-xs">Aucun message</p>
                      </div>
                    )}
                    {messages.map(msg => {
                      const isAdmin = msg.expediteurRole === "admin";
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[80%]">
                            {!isAdmin && <div className="text-[9px] text-gray-400 mb-0.5 ml-1">{msg.expediteur}</div>}
                            <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                              isAdmin ? "bg-[#0D1F3C] text-white rounded-br-sm"
                              : msg.expediteurRole === "system"
                              ? "bg-[#FBF5E0] text-[#7a5a2a] border border-[#e8d9a0] rounded-bl-sm"
                              : "bg-[#F1F4FA] text-[#1A2235] border border-[#DDE2EC] rounded-bl-sm"
                            }`}>
                              {msg.contenu}
                            </div>
                            <div className={`text-[9px] text-gray-400 mt-0.5 ${isAdmin ? "text-right mr-1" : "ml-1"}`}>
                              {formatTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="border-t border-gray-100 p-3 shrink-0">
                    <div className="flex gap-2">
                      <textarea
                        value={msgInput}
                        onChange={e => setMsgInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Message au porteur..."
                        rows={2}
                        className="flex-1 border border-[#DDE2EC] rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20"
                      />
                      <button type="button" onClick={sendMessage} disabled={sending || !msgInput.trim()}
                        className="w-9 h-9 bg-[#0D1F3C] rounded-lg flex items-center justify-center text-white hover:bg-[#162B52] transition-colors disabled:opacity-40 shrink-0 self-end">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "actions" && selected && (
                <div className="overflow-y-auto flex-1">
                  {/* Phase workflow */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#FFD500]" /> Workflow — 6 phases
                    </div>
                    <div className="space-y-2">
                      {PHASE_ACTIONS.map((pa) => {
                        const executed = events.some(e => e.action === pa.action);
                        const executedEvent = events.find(e => e.action === pa.action);
                        const prevDone = pa.phase === 1 || events.some(e => {
                          const prev = PHASE_ACTIONS.find(x => x.phase === pa.phase - 1);
                          return prev && e.action === prev.action;
                        });
                        const isAvailable = !executed && prevDone;

                        return (
                          <div key={pa.action} className={`rounded-lg border transition-all ${
                            executed ? "border-green-200 bg-green-50" :
                            isAvailable ? "border-[#0D1F3C] bg-[#0D1F3C]/5 shadow-sm" :
                            "border-gray-100 bg-gray-50 opacity-60"
                          }`}>
                            <div className="px-3 py-2.5">
                              <div className="flex items-center gap-2 mb-1">
                                {executed ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                ) : isAvailable ? (
                                  <AlertCircle className="w-3.5 h-3.5 text-[#0D1F3C] shrink-0" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                )}
                                <span className={`text-xs font-bold ${executed ? "text-green-700" : isAvailable ? "text-[#0D1F3C]" : "text-gray-400"}`}>
                                  {pa.label}
                                </span>
                              </div>

                              {executed && executedEvent && (
                                <div className="text-[10px] text-green-600 mb-1.5 flex items-center gap-1">
                                  <span>Exécuté le {new Date(executedEvent.createdAt).toLocaleDateString("fr-FR")}</span>
                                  {pa.docs.map(d => (
                                    <span key={d.type} className="inline-flex items-center gap-1">
                                      <button
                                        onClick={() => openPdf(selected.id, d.type)}
                                        disabled={pdfLoading === d.type}
                                        className="ml-1 flex items-center gap-0.5 text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-wait">
                                        <Download className="w-2.5 h-2.5" /> {pdfLoading === d.type ? "Génération…" : d.label}
                                      </button>
                                      <a href={`/admin/preview/${d.type}/${selected.id}`} target="_blank" rel="noreferrer"
                                        className="ml-0.5 flex items-center gap-0.5 text-[#FFD500] hover:underline text-[10px]">
                                        <Eye className="w-2.5 h-2.5" /> Prévisualiser
                                      </a>
                                    </span>
                                  ))}
                                </div>
                              )}

                              {isAvailable && (
                                <div className="mt-2 space-y-2">
                                  <p className="text-[10px] text-gray-500">{pa.desc}</p>
                                  {pa.docs.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                      {pa.docs.map(d => (
                                        <span key={d.type} className="inline-flex items-center gap-1">
                                          <button
                                            onClick={() => openPdf(selected.id, d.type)}
                                            disabled={pdfLoading === d.type}
                                            className="flex items-center gap-1 text-[10px] border border-blue-200 text-blue-700 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-wait">
                                            <Download className="w-2.5 h-2.5" /> {pdfLoading === d.type ? "Génération…" : d.label}
                                          </button>
                                          <a href={`/admin/preview/${d.type}/${selected.id}`} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1 text-[10px] border border-amber-200 text-amber-700 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition-colors">
                                            <Eye className="w-2.5 h-2.5" /> Prévisualiser
                                          </a>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <textarea
                                    value={phaseNote}
                                    onChange={e => setPhaseNote(e.target.value)}
                                    placeholder="Note optionnelle pour le porteur (incluse dans l'email)..."
                                    rows={2}
                                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-[#0D1F3C]/30"
                                  />
                                  <button
                                    onClick={() => executePhaseAction(pa.action)}
                                    disabled={!!phaseLoading}
                                    className="w-full bg-[#0D1F3C] hover:bg-[#162B52] disabled:opacity-50 text-white text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-1.5"
                                  >
                                    {phaseLoading === pa.action ? (
                                      <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Exécution...</>
                                    ) : (
                                      <><Zap className="w-3 h-3" /> {pa.cta}</>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Réglages manuels */}
                  <div className="p-4 border-b border-gray-100 space-y-3">
                    <div className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide mb-2">Réglages manuels</div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-medium block mb-1">Statut</label>
                      <select value={newStatut} onChange={e => setNewStatut(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0D1F3C]/20">
                        {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-medium block mb-1">Conseiller assigné</label>
                      <input value={expertDesigne} onChange={e => setExpertDesigne(e.target.value)}
                        placeholder="Nom du conseiller"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0D1F3C]/20" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-medium block mb-1">Commentaire au porteur</label>
                      <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)}
                        rows={2}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#0D1F3C]/20" />
                    </div>
                    <button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}
                      className="w-full bg-[#4A5568] hover:bg-[#2D3748] text-white text-xs font-bold py-2 rounded transition-colors">
                      {updateStatusMutation.isPending ? "Mise à jour..." : "Appliquer"}
                    </button>
                  </div>

                  {/* Frais */}
                  <div className="p-4">
                    <div className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide mb-2">Frais d'instruction</div>
                    <Link href="/admin/frais"
                      className="w-full bg-[#FFD500] hover:bg-[#FFC900] text-white text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Émettre les frais (456 € TTC)
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modale de confirmation — Clôturer le dossier */}
      {confirmPaiementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0D1F3C] text-base leading-tight">Confirmer la réception du paiement</h3>
                <p className="text-amber-700 text-xs mt-1 leading-relaxed">Cette action est irréversible et clôturera définitivement le dossier.</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                Avant de continuer, assurez-vous que le virement des frais d'instruction a bien été <strong>reçu et crédité</strong> sur votre compte.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 space-y-1">
                <div className="font-bold mb-1">✓ Checklist avant clôture :</div>
                <div>• Le virement apparaît sur votre relevé bancaire</div>
                <div>• Le montant correspond à la référence du dossier</div>
                <div>• Le porteur a bien effectué le paiement TTC</div>
              </div>
              <p className="text-gray-400 text-xs">
                Une fois confirmé, le dossier passera au statut <strong>Versé</strong> et le porteur en sera notifié par e-mail.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setConfirmPaiementOpen(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  setConfirmPaiementOpen(false);
                  setPhaseLoading("confirmer_paiement");
                  try {
                    await apiFetch(`/admin/dossiers/${selectedId}/phase-action`, {
                      method: "POST",
                      body: JSON.stringify({ action: "confirmer_paiement", note: phaseNote || undefined }),
                    });
                    await fetchEvents(selectedId!);
                    queryClient.invalidateQueries({ queryKey: ["/api/admin/dossiers"] });
                    setPhaseNote("");
                    toast({ title: "Dossier clôturé ✓", description: "Le paiement a été confirmé et le dossier est clôturé." });
                  } catch (err: any) {
                    toast({ title: "Erreur", description: err.message || "Impossible de confirmer le paiement.", variant: "destructive" });
                  } finally {
                    setPhaseLoading(null);
                  }
                }}
                disabled={!!phaseLoading}
                className="flex-1 bg-[#0D1F3C] hover:bg-[#162B52] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Oui, paiement reçu — Clôturer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
