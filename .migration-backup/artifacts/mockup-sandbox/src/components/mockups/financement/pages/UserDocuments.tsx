import { useState } from "react";
import { UserLayout } from "../shared/UserLayout";

const REQUIRED_DOCS = [
  { id: "id", label: "Pièce d'identité", desc: "CNI ou passeport en cours de validité (recto/verso)", obligatoire: true, status: "validé", file: "CNI_Koutoua.pdf", date: "12/01/2024" },
  { id: "dom", label: "Justificatif de domicile", desc: "Facture d'électricité, eau ou téléphone de moins de 3 mois", obligatoire: true, status: "validé", file: "JustifDomicile.pdf", date: "12/01/2024" },
  { id: "desc", label: "Description du projet", desc: "Présentation détaillée du projet et de ses objectifs (2 à 10 pages)", obligatoire: true, status: "en cours de vérification", file: "ProjetRestaurant.pdf", date: "13/01/2024" },
  { id: "plan", label: "Plan de financement prévisionnel", desc: "Tableau des recettes et dépenses sur 3 ans minimum, signé par un comptable", obligatoire: true, status: "en attente", file: null, date: null },
  { id: "rib", label: "Relevé d'Identité Bancaire (RIB)", desc: "RIB du compte bancaire sur lequel sera versée la subvention", obligatoire: true, status: "manquant", file: null, date: null },
  { id: "kbis", label: "Extrait Kbis ou Statuts", desc: "Pour les sociétés : extrait Kbis de moins de 3 mois. Pour les associations : statuts et récépissé de déclaration.", obligatoire: false, status: "non applicable", file: null, date: null },
  { id: "devis", label: "Devis fournisseurs", desc: "Au moins 2 devis comparatifs pour les achats d'équipements supérieurs à 5 000 €", obligatoire: false, status: "en attente", file: null, date: null },
];

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  "validé": { color: "bg-green-50 text-green-700 border-green-200", label: "Validé", icon: "✓" },
  "en cours de vérification": { color: "bg-blue-50 text-blue-700 border-blue-200", label: "En vérification", icon: "⋯" },
  "en attente": { color: "bg-amber-50 text-amber-700 border-amber-200", label: "À télécharger", icon: "↑" },
  "manquant": { color: "bg-red-50 text-red-700 border-red-200", label: "Manquant", icon: "!" },
  "non applicable": { color: "bg-gray-50 text-gray-500 border-gray-200", label: "Non applicable", icon: "—" },
};

export function UserDocuments() {
  const [drag, setDrag] = useState<string | null>(null);

  const validés = REQUIRED_DOCS.filter(d => d.status === "validé").length;
  const total = REQUIRED_DOCS.filter(d => d.obligatoire).length;

  return (
    <UserLayout active="documents">
      {/* Header info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 text-sm">Dossier DOS-2024-0127 — Martinique / FEDER</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="h-2 bg-gray-200 rounded-full w-32 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(validés / total) * 100}%` }} />
            </div>
            <span className="text-sm font-semibold text-[#1a2f5e]">{validés}/{total} documents obligatoires fournis</span>
          </div>
        </div>
        <button className="bg-[#1a2f5e] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0f1f3d] transition-colors">
          ↑ Télécharger un document
        </button>
      </div>

      {/* Missing alert */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
        <span className="text-red-500 text-xl mt-0.5">!</span>
        <div>
          <div className="font-bold text-red-700 text-sm">Documents manquants</div>
          <div className="text-red-600 text-sm mt-0.5">
            Il manque encore <strong>2 documents obligatoires</strong> pour que votre dossier soit complet : le <strong>Plan de financement</strong> et le <strong>RIB bancaire</strong>.
          </div>
        </div>
      </div>

      {/* Documents list */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#1a2f5e] text-base">Liste des pièces justificatives</h3>
          <div className="flex gap-2 text-xs">
            {["Tous", "Obligatoires", "À fournir"].map(f => (
              <button key={f} className={`px-3 py-1.5 rounded-full border font-medium transition-colors ${f === "Tous" ? "bg-[#1a2f5e] text-white border-[#1a2f5e]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {REQUIRED_DOCS.map((doc) => {
            const cfg = STATUS_CONFIG[doc.status];
            return (
              <div key={doc.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${drag === doc.id ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 mt-0.5 ${
                      doc.status === "validé" ? "bg-green-100" :
                      doc.status === "en cours de vérification" ? "bg-blue-100" :
                      doc.status === "manquant" || doc.status === "en attente" ? "bg-amber-100" :
                      "bg-gray-100"
                    }`}>
                      📄
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold text-[#1a2f5e] text-sm">{doc.label}</span>
                        {doc.obligatoire && <span className="text-xs text-red-500 font-semibold">*obligatoire</span>}
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed mb-2">{doc.desc}</p>
                      {doc.file && (
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 w-fit">
                          <span className="text-xs">📎</span>
                          <span className="text-xs text-[#1a2f5e] font-medium">{doc.file}</span>
                          <span className="text-xs text-gray-400">• {doc.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    {(doc.status === "en attente" || doc.status === "manquant") && (
                      <button
                        onDragOver={e => { e.preventDefault(); setDrag(doc.id); }}
                        onDragLeave={() => setDrag(null)}
                        onDrop={() => setDrag(null)}
                        className="text-xs border border-dashed border-[#1a2f5e]/30 text-[#1a2f5e] font-medium px-3 py-1.5 rounded-lg hover:bg-[#1a2f5e]/5 transition-colors"
                      >
                        ↑ Déposer le fichier
                      </button>
                    )}
                    {doc.file && <button className="text-xs text-gray-400 hover:text-gray-600 underline">Remplacer</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload zone */}
      <div className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1a2f5e]/40 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="text-3xl mb-2">📎</div>
        <div className="font-semibold text-[#1a2f5e] text-sm">Glisser-déposer un fichier ici</div>
        <div className="text-gray-400 text-xs mt-1">ou cliquer pour sélectionner — PDF, JPG, PNG (max 10 Mo)</div>
      </div>
    </UserLayout>
  );
}
