import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { exportElementAsPdf } from "@/lib/doc-pdf";
import {
  AcknowledgementReceipt,
  EligibilityReport,
  MissionContract,
  InformationForm,
  FundingAwardNotification,
  Invoice,
} from "@/components/documents";

const BASE = import.meta.env.VITE_API_URL ?? "";

interface DossierData {
  id: number;
  reference: string;
  statut: string;
  territoire: string;
  titre: string;
  dispositif: string;
  secteur: string;
  montantDemande: number;
  montantApport: number;
  description?: string | null;
  createdAt: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function fmtMoney(v: number) {
  return v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

const TODAY = new Date().toLocaleDateString("fr-FR", {
  day: "2-digit", month: "long", year: "numeric",
});

type DocType =
  | "accuse_reception"
  | "rapport_eligibilite"
  | "fiche_collecte"
  | "contrat_mission"
  | "notification"
  | "facture";

function getDocLabels(t: (k: string) => string): Record<DocType, string> {
  return {
    accuse_reception:    t("documents.official_accuse"),
    rapport_eligibilite: t("documents.official_rapport"),
    fiche_collecte:      t("documents.official_fiche"),
    contrat_mission:     t("documents.official_contrat"),
    notification:        t("documents.official_notification"),
    facture:             t("documents.official_facture"),
  };
}

function renderDoc(docType: DocType, dossier: DossierData, user: { prenom: string; nom: string; territoire?: string | null }) {
  const porteur = `${user.prenom} ${user.nom}`;
  switch (docType) {
    case "accuse_reception":
      return (
        <AcknowledgementReceipt
          reference={dossier.reference}
          dateEmission={TODAY}
          porteur={porteur}
          territoire={dossier.territoire}
          dispositif={dossier.dispositif}
          secteur={dossier.secteur}
          montantDemande={fmtMoney(dossier.montantDemande)}
          dateDepot={fmtDate(dossier.createdAt)}
        />
      );
    case "rapport_eligibilite":
      return (
        <EligibilityReport
          reference={dossier.reference}
          dateEmission={TODAY}
          porteur={porteur}
          nomProjet={dossier.titre || dossier.dispositif}
          territoire={dossier.territoire}
          secteur={dossier.secteur}
          montantPotentiel={fmtMoney(dossier.montantDemande)}
          tauxMin={40}
          tauxMax={80}
          dispositifPrincipal={dossier.dispositif}
          criterias={[
            { label: t("docs.eligibility.geo_label"),          description: t("docs.eligibility.geo_desc",          { territoire: dossier.territoire }), ok: true },
            { label: t("docs.eligibility.sector_label"),       description: t("docs.eligibility.sector_desc",       { secteur: dossier.secteur }),       ok: true },
            { label: t("docs.eligibility.amount_label"),       description: t("docs.eligibility.amount_desc",       { amount: fmtMoney(dossier.montantDemande) }), ok: true },
            { label: t("docs.eligibility.completeness_label"), description: t("docs.eligibility.completeness_desc"),                                      ok: true },
          ]}
        />
      );
    case "fiche_collecte":
      return (
        <InformationForm
          reference={dossier.reference}
          dateEmission={TODAY}
          porteur={porteur}
          nomProjet={dossier.titre || dossier.dispositif}
          territoire={dossier.territoire}
          montantCible={fmtMoney(dossier.montantDemande)}
        />
      );
    case "contrat_mission":
      return (
        <MissionContract
          reference={dossier.reference}
          dateEmission={TODAY}
          porteur={porteur}
          nomProjet={dossier.titre || dossier.dispositif}
          territoire={dossier.territoire}
          porteurTerritoire={user.territoire || dossier.territoire}
          montantCible={fmtMoney(dossier.montantDemande)}
        />
      );
    case "notification":
      return (
        <FundingAwardNotification
          reference={dossier.reference}
          dateDecision={TODAY}
          porteur={porteur}
          territoire={dossier.territoire}
          dispositif={dossier.dispositif}
          nomProjet={dossier.titre || dossier.dispositif}
          montantAttribue={fmtMoney(dossier.montantDemande)}
        />
      );
    case "facture":
      return (
        <Invoice
          numero={dossier.reference}
          dateEmission={TODAY}
          echeance={t("invoice.echeance_reception")}
          porteur={porteur}
          territoire={dossier.territoire}
          nomProjet={dossier.titre || dossier.dispositif}
          dispositif={dossier.dispositif}
          items={[{
            designation: t("invoice.mission_designation"),
            description: t("invoice.mission_description"),
            quantite: 1,
            puHT: 380,
          }]}
          tvaPct={20}
        />
      );
    default:
      return null;
  }
}

export default function UserDocumentPreview() {
  const params = useParams<{ type: string; id: string }>();
  const docType = params.type as DocType;
  const dossierId = Number(params.id);
  const { user } = useAuth();
  const { t } = useTranslation();
  const DOC_LABELS = getDocLabels(t);
  const docRef = useRef<HTMLDivElement>(null);

  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${BASE}/api/dossiers/${dossierId}`, { credentials: "include" });
        if (!r.ok) throw new Error(t("documents.err_access"));
        const data = await r.json();
        const { documents: _d, messages: _m, frais: _f, timeline: _t, ...dossierFields } = data;
        setDossier(dossierFields as DossierData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dossierId]);

  async function handleExport() {
    if (!docRef.current || !dossier) return;
    setExporting(true);
    const filename = `${docType.replace(/_/g, "-")}-${dossier.reference}.pdf`;
    await exportElementAsPdf(docRef.current, filename).catch(() => {});
    setExporting(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F1F4FA" }}>
        <p style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}>{t("documents.loading")}</p>
      </div>
    );
  }

  if (error || !dossier || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F1F4FA" }}>
        <p style={{ color: "#DC2626", fontFamily: "Inter, sans-serif" }}>{error ?? t("documents.err_loading")}</p>
      </div>
    );
  }

  if (!DOC_LABELS[docType]) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Inter, sans-serif" }}>Type de document inconnu : {docType}</p>
      </div>
    );
  }

  const docNode = renderDoc(docType, dossier, user);

  return (
    <div style={{ background: "#E5E7EB", minHeight: "100vh", padding: "32px 0", position: "relative" }}>
      {exporting && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(241,244,250,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <p style={{ color: "#6B7280", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
            {t("docs.pdf_generating")}
          </p>
        </div>
      )}

      <div className="doc-print-hide" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "794px", margin: "0 auto 20px", padding: "0 4px",
      }}>
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6B7280", margin: 0 }}>
            {DOC_LABELS[docType]}
          </p>
          <p style={{ fontFamily: "Inter, monospace", fontSize: "10px", color: "#9CA3AF", margin: 0 }}>
            Réf. {dossier.reference}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            background: exporting ? "#6B7280" : "#0B1F4D", color: "#fff",
            border: "none", borderRadius: "4px",
            padding: "8px 18px", fontFamily: "Inter, sans-serif",
            fontSize: "11px", fontWeight: 600,
            cursor: exporting ? "default" : "pointer",
          }}
        >
          {exporting ? "Génération…" : "Exporter PDF"}
        </button>
      </div>

      <div ref={docRef} style={{ maxWidth: "794px", margin: "0 auto" }}>
        {docNode}
      </div>
    </div>
  );
}
