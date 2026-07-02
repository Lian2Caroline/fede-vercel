import { useState, useEffect, useRef } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileText, Upload, CheckCircle, Clock, XCircle, FileMinus,
  Download, Lock, Send, AlertTriangle, X, Loader2, ShieldCheck,
  RefreshCw, BadgeCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { downloadUserDoc } from "@/lib/doc-download";

const BASE = import.meta.env.VITE_API_URL ?? "";

type DocApi = {
  id: number; type: string; nom: string; statut: string; filename?: string | null;
  hasFile?: boolean; uploadedAt?: string | null; envois?: number; envoyeAt?: string | null;
  dernierMotifRejet?: string | null; dernierRejetAt?: string | null;
  obligatoire?: boolean; expiresAt?: string | null;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });
}

export default function UserDocuments() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: stats } = useGetDashboardStats();
  const dossier = stats?.dossierActif;
  const dossierId = dossier?.id ?? 0;

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [justUploadedType, setJustUploadedType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const submitRef = useRef<HTMLButtonElement>(null);

  // Marquer les badges documents comme "vus" à l'ouverture de la page
  useEffect(() => {
    const officials = stats?.documentsOfficielsDisponibles ?? 0;
    const rejected = stats?.documentsRejetes ?? 0;
    if (officials > 0 || rejected > 0) {
      localStorage.setItem("docs_seen_officials", String(officials));
      localStorage.setItem("docs_seen_rejected", String(rejected));
    }
  }, [stats?.documentsOfficielsDisponibles, stats?.documentsRejetes]);

  const REQUIRED_DOC_TYPES = [
    { id: "identite",    label: t("documents.doc_identite"),    desc: t("documents.doc_identite_desc"),    obligatoire: true },
    { id: "domicile",    label: t("documents.doc_domicile"),    desc: t("documents.doc_domicile_desc"),    obligatoire: true },
    { id: "projet",      label: t("documents.doc_projet"),      desc: t("documents.doc_projet_desc"),      obligatoire: true },
    { id: "financement", label: t("documents.doc_financement"), desc: t("documents.doc_financement_desc"), obligatoire: true },
    { id: "rib",         label: t("documents.doc_rib"),         desc: t("documents.doc_rib_desc"),         obligatoire: true },
    { id: "kbis",        label: t("documents.doc_kbis"),        desc: t("documents.doc_kbis_desc"),        obligatoire: false },
    { id: "devis",       label: t("documents.doc_devis"),       desc: t("documents.doc_devis_desc"),       obligatoire: false },
  ];

  const OFFICIAL_DOCS = [
    { type: "accuse_reception",    label: t("documents.official_accuse"),       action: "accuser_reception",   desc: t("documents.official_accuse_desc") },
    { type: "rapport_eligibilite", label: t("documents.official_eligibilite"),  action: "envoyer_eligibilite", desc: t("documents.official_eligibilite_desc") },
    { type: "fiche_collecte",      label: t("documents.official_fiche"),        action: "envoyer_eligibilite", desc: t("documents.official_fiche_desc") },
    { type: "contrat_mission",     label: t("documents.official_contrat"),      action: "envoyer_contrat",     desc: t("documents.official_contrat_desc") },
    { type: "notification",        label: t("documents.official_notification"), action: "marquer_favorable",   desc: t("documents.official_notification_desc") },
    { type: "facture",             label: t("documents.official_facture"),      action: "confirmer_paiement",  desc: t("documents.official_facture_desc") },
  ];

  const handleDownloadPdf = async (docType: string) => {
    if (!dossierId || !user) return;
    setDownloadingDoc(docType);
    try {
      await downloadUserDoc(dossierId, docType, user);
    } catch {
      toast({ title: t("common.error"), description: t("documents.err_pdf"), variant: "destructive" });
    } finally {
      setDownloadingDoc(null);
    }
  };

  const refreshDocs = async (silent = false) => {
    if (!dossierId) return;
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/dossiers/${dossierId}/documents`, {
        credentials: "include", cache: "no-store",
      });
      if (!res.ok) throw new Error("fetch docs failed");
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      if (!silent) setDocuments([]);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDocs();
    if (!dossierId) return;
    const interval = setInterval(() => refreshDocs(true), 10_000);
    return () => clearInterval(interval);
  }, [dossierId]);

  useEffect(() => {
    if (!dossierId) return;
    fetch(`${BASE}/api/dossiers/${dossierId}/events`, { credentials: "include", cache: "no-store" })
      .then(r => r.ok ? r.json() : [])
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .catch(() => setEvents([]));
  }, [dossierId]);

  const executedActions = new Set(events.map((e: any) => e.action));

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, type: string, nom: string) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!dossier) {
      toast({ title: t("common.error"), description: t("documents.err_no_dossier"), variant: "destructive" });
      return;
    }

    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    const isPdfByName = file.name.toLowerCase().endsWith(".pdf");
    if (!allowed.includes(file.type) && !isPdfByName) {
      toast({ title: t("documents.err_type"), description: t("documents.err_type_desc"), variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: t("documents.err_size"), description: t("documents.err_size_desc"), variant: "destructive" });
      return;
    }

    setUploadingType(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("nom", nom);

      const res = await fetch(`${BASE}/api/dossiers/${dossierId}/documents/upload`, {
        method: "POST", credentials: "include", body: formData,
      });
      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);

      await refreshDocs();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setJustUploadedType(type);
      setTimeout(() => setJustUploadedType(null), 2500);
      toast({
        title: t("documents.status_received_anim"),
        description: t("documents.doc_upload_hint"),
      });
      setTimeout(() => {
        submitRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err?.message ?? t("documents.err_upload"), variant: "destructive" });
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (docId: number) => {
    try {
      const res = await fetch(`${BASE}/api/dossiers/${dossierId}/documents/${docId}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("delete failed");
      await refreshDocs();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    } catch {
      toast({ title: t("common.error"), description: t("documents.err_delete"), variant: "destructive" });
    }
  };

  const handleSubmitDossier = async () => {
    if (!dossier) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/dossiers/${dossierId}/documents/submit`, {
        method: "POST", credentials: "include",
      });
      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
      if (!res.ok) throw new Error(data.error ?? "Échec de l'envoi du dossier.");
      await refreshDocs();
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: t("documents.ok_sent"), description: t("documents.ok_sent_desc", { count: data.count ?? "" }) });
    } catch (err: any) {
      toast({ title: t("documents.err_send"), description: err?.message ?? t("documents.err_send_desc"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!dossier) {
    return (
      <UserLayout>
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-[#1a2f5e]">{t("documents.no_dossier_title")}</h3>
          <p className="text-gray-500 text-sm mt-2">{t("documents.no_dossier_desc")}</p>
        </div>
      </UserLayout>
    );
  }

  const availableOfficialDocs = OFFICIAL_DOCS.filter(d => executedActions.has(d.action));
  const unavailableOfficialDocs = OFFICIAL_DOCS.filter(d => !executedActions.has(d.action));

  const requiredIds = REQUIRED_DOC_TYPES.filter(d => d.obligatoire).map(d => d.id);
  const allRequiredDeposited = requiredIds.every(id => {
    const d = documents.find(x => x.type === id);
    return d && (d.statut === "en_attente" || d.statut === "valide" || d.statut === "envoye");
  });
  const hasUnsentUploads = documents.some(d => d.hasFile && d.statut === "en_attente");
  const canSubmit = allRequiredDeposited && hasUnsentUploads;

  const missingCount = requiredIds.filter(
    id => !documents.find(x => x.type === id && (x.statut === "en_attente" || x.statut === "valide" || x.statut === "envoye"))
  ).length;

  return (
    <UserLayout>
      <div className="mb-6 bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFD500] flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-[#0D1F3C]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base mb-0.5">{t("documents.send_title")}</h3>
              <p className="text-white/70 text-xs leading-relaxed">
                {allRequiredDeposited
                  ? hasUnsentUploads
                    ? t("documents.send_all_ready")
                    : t("documents.send_already_sent")
                  : t("documents.send_missing", { count: missingCount })}
              </p>
            </div>
          </div>
          <button
            ref={submitRef}
            onClick={handleSubmitDossier}
            disabled={!canSubmit || submitting}
            data-testid="btn-submit-dossier"
            className={`shrink-0 px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              canSubmit && !submitting
                ? "bg-[#FFD500] text-[#0D1F3C] hover:bg-[#C99835] shadow-md"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? t("documents.sending") : t("documents.send_btn")}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#0D1F3C] flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0D1F3C]">{t("documents.official_title")}</h2>
            <p className="text-xs text-gray-400">{t("documents.official_sub")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableOfficialDocs.map(doc => (
            <button key={doc.type}
              onClick={() => handleDownloadPdf(doc.type)}
              disabled={downloadingDoc === doc.type}
              className="group flex items-start gap-3 bg-white border border-gray-200 hover:border-[#0D1F3C] rounded-xl p-4 shadow-sm transition-all hover:shadow-md w-full text-left disabled:opacity-70 disabled:cursor-wait">
              <div className="w-10 h-10 rounded-lg bg-[#0D1F3C]/8 flex items-center justify-center shrink-0 group-hover:bg-[#0D1F3C]/15 transition-colors">
                <FileText className="w-5 h-5 text-[#0D1F3C]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#0D1F3C] mb-0.5">{doc.label}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{doc.desc}</div>
              </div>
              {downloadingDoc === doc.type
                ? <Loader2 className="w-4 h-4 text-[#0D1F3C] shrink-0 mt-0.5 animate-spin" />
                : <Download className="w-4 h-4 text-gray-400 group-hover:text-[#0D1F3C] shrink-0 mt-0.5 transition-colors" />}
            </button>
          ))}
          {unavailableOfficialDocs.map(doc => (
            <div key={doc.type} className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-500 mb-0.5">{doc.label}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{t("documents.doc_locked")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FFD500] flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0D1F3C]">{t("documents.pieces_title")}</h2>
            <p className="text-xs text-gray-400">{t("documents.pieces_sub")}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {REQUIRED_DOC_TYPES.map(req => {
              const doc = documents.find(d => d.type === req.id);
              const statut = doc?.statut ?? "manquant";
              const isUploading = uploadingType === req.id;
              const justUploaded = justUploadedType === req.id;
              const isRejected = statut === "rejete";
              const isValidated = statut === "valide";
              const isSent = statut === "envoye";
              const isPending = statut === "en_attente" && doc?.hasFile;
              const canDeposit = !isValidated && !isSent && !isPending && !isUploading;

              return (
                <DocCard
                  key={req.id}
                  req={req}
                  doc={doc}
                  statut={statut}
                  isUploading={isUploading}
                  justUploaded={justUploaded}
                  isRejected={isRejected}
                  isValidated={isValidated}
                  isSent={isSent}
                  isPending={isPending}
                  canDeposit={canDeposit}
                  uploadingAny={!!uploadingType}
                  onDeposit={() => fileInputs.current[req.id]?.click()}
                  onDelete={() => doc && handleDelete(doc.id)}
                  fileInputRef={(el) => { fileInputs.current[req.id] = el; }}
                  onFileChange={(e) => handleUploadFile(e, req.id, req.label)}
                />
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

type DocCardProps = {
  req: { id: string; label: string; desc: string; obligatoire: boolean };
  doc?: DocApi;
  statut: string;
  isUploading: boolean;
  justUploaded: boolean;
  isRejected: boolean;
  isValidated: boolean;
  isSent: boolean;
  isPending: boolean;
  canDeposit: boolean;
  uploadingAny: boolean;
  onDeposit: () => void;
  onDelete: () => void;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function DocCard({
  req, doc, statut, isUploading, justUploaded,
  isRejected, isValidated, isSent, isPending,
  canDeposit, uploadingAny, onDeposit, onDelete,
  fileInputRef, onFileChange,
}: DocCardProps) {
  const { t } = useTranslation();

  const cardStyle = (() => {
    if (isValidated) return "border-green-200 bg-green-50/40";
    if (isRejected)  return "border-red-200 bg-red-50/30";
    if (isSent)      return "border-blue-200 bg-blue-50/20";
    if (isPending || justUploaded) return "border-amber-200 bg-amber-50/20";
    return "border-gray-200 bg-white";
  })();

  return (
    <div className={`border rounded-xl p-4 shadow-sm transition-all duration-300 ${cardStyle}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <DocIcon statut={statut} isUploading={isUploading} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-sm font-semibold text-[#0D1F3C]">{req.label}</span>
              {req.obligatoire && (
                <span className="text-[10px] text-red-500 font-medium border border-red-200 bg-red-50 px-1.5 py-0.5 rounded">
                  {t("documents.obligatoire")}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-1">{req.desc}</p>

            {isRejected && doc?.dernierMotifRejet && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2.5 flex gap-2 items-start">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-red-700 uppercase tracking-wide mb-0.5">{t("documents.reject_reason")}</div>
                  <div className="text-xs text-red-800 leading-relaxed">{doc.dernierMotifRejet}</div>
                </div>
              </div>
            )}

            {(isSent || isValidated) && doc?.envoyeAt && (
              <div className="mt-1 text-[11px] text-blue-600 flex items-center gap-1">
                <Send className="w-3 h-3" />
                {t("documents.sent_at")} {fmtDate(doc.envoyeAt)}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2.5 shrink-0">
          <StatusBadge statut={statut} isUploading={isUploading} justUploaded={justUploaded} />
          <ActionArea
            req={req}
            doc={doc}
            statut={statut}
            isUploading={isUploading}
            justUploaded={justUploaded}
            isRejected={isRejected}
            isValidated={isValidated}
            isSent={isSent}
            isPending={isPending}
            canDeposit={canDeposit}
            uploadingAny={uploadingAny}
            onDeposit={onDeposit}
            onDelete={onDelete}
            fileInputRef={fileInputRef}
            onFileChange={onFileChange}
          />
        </div>
      </div>
    </div>
  );
}

function DocIcon({ statut, isUploading }: { statut: string; isUploading: boolean }) {
  if (isUploading) {
    return (
      <div className="w-9 h-9 rounded-lg bg-[#0D1F3C]/10 flex items-center justify-center shrink-0 mt-0.5">
        <Loader2 className="w-4 h-4 text-[#0D1F3C] animate-spin" />
      </div>
    );
  }
  const map: Record<string, { bg: string; icon: JSX.Element }> = {
    valide:     { bg: "bg-green-100",  icon: <ShieldCheck className="w-4 h-4 text-green-600" /> },
    envoye:     { bg: "bg-blue-100",   icon: <Clock className="w-4 h-4 text-blue-600" /> },
    en_attente: { bg: "bg-amber-100",  icon: <FileText className="w-4 h-4 text-amber-600" /> },
    rejete:     { bg: "bg-red-100",    icon: <XCircle className="w-4 h-4 text-red-600" /> },
    manquant:   { bg: "bg-gray-100",   icon: <FileMinus className="w-4 h-4 text-gray-400" /> },
  };
  const cfg = map[statut] ?? map.manquant;
  return (
    <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
      {cfg.icon}
    </div>
  );
}

function StatusBadge({ statut, isUploading, justUploaded }: { statut: string; isUploading: boolean; justUploaded: boolean }) {
  const { t } = useTranslation();

  if (isUploading) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-[#0D1F3C]/8 text-[#0D1F3C] border-[#0D1F3C]/20">
        <Loader2 className="w-3 h-3 animate-spin" /> {t("documents.status_uploading")}
      </span>
    );
  }
  if (justUploaded && statut === "en_attente") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-300 animate-pulse">
        <CheckCircle className="w-3 h-3" /> {t("documents.status_received_anim")}
      </span>
    );
  }
  const map: Record<string, { color: string; icon: JSX.Element; label: string }> = {
    valide:     { color: "bg-green-50 text-green-700 border-green-200",   icon: <BadgeCheck className="w-3 h-3" />,  label: t("documents.status_accepted") },
    envoye:     { color: "bg-blue-50 text-blue-700 border-blue-200",      icon: <Clock className="w-3 h-3" />,       label: t("documents.status_validating") },
    en_attente: { color: "bg-amber-50 text-amber-700 border-amber-200",   icon: <CheckCircle className="w-3 h-3" />, label: t("documents.status_received") },
    rejete:     { color: "bg-red-50 text-red-700 border-red-200",         icon: <XCircle className="w-3 h-3" />,     label: t("documents.status_rejected") },
    manquant:   { color: "bg-gray-50 text-gray-500 border-gray-200",      icon: <FileMinus className="w-3 h-3" />,   label: t("documents.status_missing") },
  };
  const cfg = map[statut] ?? map.manquant;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ActionArea({
  req, doc, isUploading, justUploaded,
  isRejected, isValidated, isSent, isPending,
  canDeposit, uploadingAny, onDeposit, onDelete,
  fileInputRef, onFileChange,
}: Omit<DocCardProps, "statut" | "cardStyle">) {
  const { t } = useTranslation();

  if (isUploading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#0D1F3C]/60 font-medium px-3 py-2 bg-[#0D1F3C]/5 rounded-lg">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>{t("documents.action_uploading")}</span>
      </div>
    );
  }

  if (isValidated) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
        <Lock className="w-3.5 h-3.5" />
        <span>{t("documents.action_locked")}</span>
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
        <Clock className="w-3.5 h-3.5" />
        <span>{t("documents.action_verif")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
        onChange={onFileChange}
        className="hidden"
        disabled={uploadingAny}
      />
      {canDeposit ? (
        <button
          onClick={onDeposit}
          disabled={uploadingAny}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
            isRejected
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-[#0D1F3C] hover:bg-[#162B52] text-white"
          } disabled:opacity-40`}
        >
          <Upload className="w-3.5 h-3.5" />
          {isRejected ? t("documents.action_replace") : (doc ? t("documents.action_replace") : t("documents.action_deposit"))}
        </button>
      ) : null}
      {isPending && !isUploading && (
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={onDeposit}
            disabled={uploadingAny}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 hover:text-amber-800 transition-colors disabled:opacity-40"
          >
            <RefreshCw className="w-3 h-3" /> {t("documents.action_replace")}
          </button>
          {doc && (
            <button
              onClick={onDelete}
              disabled={uploadingAny}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
            >
              <X className="w-3 h-3" /> {t("documents.action_delete")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
