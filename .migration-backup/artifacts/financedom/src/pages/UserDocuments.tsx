import { useState, useEffect } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { useGetDashboardStats, useListDocuments, useUploadDocument, useDeleteDocument } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, CheckCircle, Clock, XCircle, FileMinus, Download, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const REQUIRED_DOC_TYPES = [
  { id: "identite",    label: "Pièce d'identité",                   desc: "CNI ou passeport en cours de validité (recto/verso)", obligatoire: true },
  { id: "domicile",    label: "Justificatif de domicile",            desc: "Facture d'électricité, eau ou téléphone de moins de 3 mois", obligatoire: true },
  { id: "projet",      label: "Description du projet",              desc: "Présentation détaillée du projet et de ses objectifs", obligatoire: true },
  { id: "financement", label: "Plan de financement prévisionnel",   desc: "Tableau équilibré des recettes et dépenses prévisionnelles", obligatoire: true },
  { id: "rib",         label: "Relevé d'identité bancaire (RIB)",   desc: "RIB du compte bancaire dédié au projet", obligatoire: true },
  { id: "kbis",        label: "Extrait Kbis ou statuts",            desc: "Pour les sociétés et associations", obligatoire: false },
  { id: "devis",       label: "Devis fournisseurs",                 desc: "Devis comparatifs pour les dépenses prévues", obligatoire: false },
];

const OFFICIAL_DOCS: { type: string; label: string; action: string; desc: string }[] = [
  { type: "accuse_reception",    label: "Accusé de réception",           action: "accuser_reception",   desc: "Confirmation officielle de la prise en charge de votre dossier." },
  { type: "rapport_eligibilite", label: "Rapport d'éligibilité",         action: "envoyer_eligibilite", desc: "Analyse d'éligibilité favorable établie par votre conseiller CapSubvention." },
  { type: "fiche_collecte",      label: "Fiche de renseignements",       action: "envoyer_eligibilite", desc: "Fiche de renseignements complémentaires à compléter et retourner signée." },
  { type: "contrat_mission",     label: "Contrat de mission",            action: "envoyer_contrat",     desc: "Contrat de mission de conseil en financement public non remboursable." },
  { type: "notification",        label: "Notification d'attribution",    action: "marquer_favorable",   desc: "Décision officielle d'attribution de la subvention non remboursable." },
];

export default function UserDocuments() {
  const { data: stats } = useGetDashboardStats();
  const dossier = stats?.dossierActif;
  const dossierId = dossier?.id ?? 0;

  const { data: documents = [], isLoading } = useListDocuments(dossierId, { query: { enabled: !!dossier && dossierId > 0 } });
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!dossierId) return;
    fetch(`${BASE}/api/dossiers/${dossierId}/events`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setEvents)
      .catch(() => {});
  }, [dossierId]);

  const executedActions = new Set(events.map((e: any) => e.action));

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "valide":    return { color: "bg-green-50 text-green-700 border-green-200",   icon: <CheckCircle className="w-3 h-3" />, label: "Validé" };
      case "en_attente":return { color: "bg-amber-50 text-amber-700 border-amber-200",   icon: <Clock className="w-3 h-3" />,       label: "En vérification" };
      case "rejete":    return { color: "bg-red-50 text-red-700 border-red-200",         icon: <XCircle className="w-3 h-3" />,     label: "Rejeté" };
      case "manquant":  return { color: "bg-gray-50 text-gray-500 border-gray-200",      icon: <FileMinus className="w-3 h-3" />,   label: "Manquant" };
      default:          return { color: "bg-gray-50 text-gray-500 border-gray-200",      icon: <FileMinus className="w-3 h-3" />,   label: "À fournir" };
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, nom: string) => {
    const file = e.target.files?.[0];
    if (!file || !dossier) return;
    setUploadingType(type);
    try {
      await uploadMutation.mutateAsync({ id: dossierId, data: { type, nom, filename: file.name } });
      queryClient.invalidateQueries({ queryKey: ["/api/dossiers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Document déposé", description: "Votre document a bien été transmis." });
    } catch {
      toast({ title: "Erreur", description: "Erreur lors du dépôt du document.", variant: "destructive" });
    } finally {
      setUploadingType(null);
      e.target.value = "";
    }
  };

  const handleDelete = async (docId: number) => {
    try {
      await deleteMutation.mutateAsync({ dossierId, docId });
      queryClient.invalidateQueries({ queryKey: ["/api/dossiers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer ce document.", variant: "destructive" });
    }
  };

  if (!dossier) {
    return (
      <UserLayout>
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-[#1a2f5e]">Aucun dossier actif</h3>
          <p className="text-gray-500 text-sm mt-2">Les documents seront disponibles une fois votre dossier créé.</p>
        </div>
      </UserLayout>
    );
  }

  const availableOfficialDocs = OFFICIAL_DOCS.filter(d => executedActions.has(d.action));
  const unavailableOfficialDocs = OFFICIAL_DOCS.filter(d => !executedActions.has(d.action));

  return (
    <UserLayout>
      {/* Documents officiels CapSubvention */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#0D1F3C] flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0D1F3C]">Documents officiels CapSubvention</h2>
            <p className="text-xs text-gray-400">Documents générés et transmis par votre conseiller au fil de la procédure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableOfficialDocs.map(doc => (
            <a key={doc.type}
              href={`${BASE}/api/dossiers/${dossierId}/pdf/${doc.type}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-3 bg-white border border-gray-200 hover:border-[#0D1F3C] rounded-xl p-4 shadow-sm transition-all hover:shadow-md">
              <div className="w-10 h-10 rounded-lg bg-[#0D1F3C]/8 flex items-center justify-center shrink-0 group-hover:bg-[#0D1F3C]/15 transition-colors">
                <FileText className="w-5 h-5 text-[#0D1F3C]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#0D1F3C] mb-0.5">{doc.label}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{doc.desc}</div>
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-[#0D1F3C] shrink-0 mt-0.5 transition-colors" />
            </a>
          ))}

          {unavailableOfficialDocs.map(doc => (
            <div key={doc.type}
              className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-500 mb-0.5">{doc.label}</div>
                <div className="text-xs text-gray-400 leading-relaxed">Disponible lors d'une prochaine étape de votre dossier.</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pièces justificatives */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#B5872A] flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0D1F3C]">Pièces justificatives</h2>
            <p className="text-xs text-gray-400">Documents à fournir pour la constitution de votre dossier de demande</p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {REQUIRED_DOC_TYPES.map(req => {
              const doc = documents.find(d => d.type === req.id);
              const cfg = getStatusConfig(doc?.statut ?? "manquant");
              return (
                <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        doc?.statut === "valide" ? "bg-green-50" : doc?.statut === "en_attente" ? "bg-amber-50" : "bg-gray-100"
                      }`}>
                        <FileText className={`w-4 h-4 ${
                          doc?.statut === "valide" ? "text-green-600" : doc?.statut === "en_attente" ? "text-amber-600" : "text-gray-400"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-sm font-semibold text-[#0D1F3C]">{req.label}</span>
                          {req.obligatoire && (
                            <span className="text-[10px] text-red-500 font-medium border border-red-200 bg-red-50 px-1.5 py-0.5 rounded">Obligatoire</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-1.5">{req.desc}</p>
                        {doc?.filename && (
                          <div className="flex items-center gap-1.5 bg-gray-50 rounded px-2 py-1 w-fit">
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-[#0D1F3C] font-medium truncate max-w-[200px]">{doc.filename}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      {(!doc || doc.statut === "rejete") && (
                        <label className="cursor-pointer text-xs border border-dashed border-[#0D1F3C]/30 text-[#0D1F3C] font-medium px-3 py-1.5 rounded-lg hover:bg-[#0D1F3C]/5 transition-colors flex items-center gap-1">
                          {uploadingType === req.id ? "Envoi..." : <><Upload className="w-3 h-3" /> Déposer</>}
                          <input type="file" className="hidden" onChange={e => handleUpload(e, req.id, req.label)} disabled={!!uploadingType} />
                        </label>
                      )}
                      {doc && doc.statut !== "valide" && (
                        <button onClick={() => handleDelete(doc.id)}
                          className="text-xs text-red-400 hover:text-red-600 underline">
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
