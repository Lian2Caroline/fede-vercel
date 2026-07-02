import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { exportElementAsPdf } from "@/lib/doc-pdf";
import {
  DocumentContainer,
  DocumentHeader,
  DocumentFooter,
  SectionTitle,
  InfoCard,
  StatusCard,
  MetricCard,
  SignatureBlock,
  EligibilityReport,
  MissionContract,
  AcknowledgementReceipt,
  InformationForm,
  FundingAwardNotification,
  Invoice,
} from "@/components/documents";

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

interface UserData {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  territoire?: string | null;
  organisation?: string | null;
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

const BASE = import.meta.env.VITE_API_URL ?? "";

type DocType =
  | "accuse_reception"
  | "rapport_eligibilite"
  | "fiche_collecte"
  | "contrat_mission"
  | "notification"
  | "facture";

function AccuseReception({ dossier, user }: { dossier: DossierData; user: UserData }) {
  return (
    <AcknowledgementReceipt
      reference={dossier.reference}
      dateEmission={TODAY}
      porteur={`${user.prenom} ${user.nom}`}
      territoire={dossier.territoire}
      dispositif={dossier.dispositif}
      secteur={dossier.secteur}
      montantDemande={fmtMoney(dossier.montantDemande)}
      dateDepot={fmtDate(dossier.createdAt)}
    />
  );
}

function RapportEligibilite({ dossier, user }: { dossier: DossierData; user: UserData }) {
  return (
    <EligibilityReport
      reference={dossier.reference}
      dateEmission={TODAY}
      porteur={`${user.prenom} ${user.nom}`}
      nomProjet={dossier.titre || dossier.dispositif}
      territoire={dossier.territoire}
      secteur={dossier.secteur}
      montantPotentiel={fmtMoney(dossier.montantDemande)}
      tauxMin={40}
      tauxMax={80}
      dispositifPrincipal={dossier.dispositif}
      criterias={[
        { label: "Éligibilité géographique",  description: `Territoire ${dossier.territoire} couvert par le dispositif`, ok: true },
        { label: "Éligibilité du secteur",    description: `Secteur "${dossier.secteur}" éligible`, ok: true },
        { label: "Montant dans les seuils",   description: `${fmtMoney(dossier.montantDemande)} dans la plage 40 % – 80 %`, ok: true },
        { label: "Complétude du dossier",     description: "Documents fournis conformes aux exigences", ok: true },
      ]}
    />
  );
}

function ContratMission({ dossier, user }: { dossier: DossierData; user: UserData }) {
  return (
    <MissionContract
      reference={dossier.reference}
      dateEmission={TODAY}
      porteur={`${user.prenom} ${user.nom}`}
      nomProjet={dossier.titre || dossier.dispositif}
      territoire={dossier.territoire}
      porteurTerritoire={user.territoire || dossier.territoire}
      montantCible={fmtMoney(dossier.montantDemande)}
    />
  );
}

function FicheCollecte({ dossier, user }: { dossier: DossierData; user: UserData }) {
  return (
    <InformationForm
      reference={dossier.reference}
      dateEmission={TODAY}
      porteur={`${user.prenom} ${user.nom}`}
      nomProjet={dossier.titre || dossier.dispositif}
      territoire={dossier.territoire}
      montantCible={fmtMoney(dossier.montantDemande)}
    />
  );
}

function Notification({ dossier, user }: { dossier: DossierData; user: UserData }) {
  return (
    <FundingAwardNotification
      reference={dossier.reference}
      dateDecision={TODAY}
      porteur={`${user.prenom} ${user.nom}`}
      territoire={dossier.territoire}
      dispositif={dossier.dispositif}
      nomProjet={dossier.titre || dossier.dispositif}
      montantAttribue={fmtMoney(dossier.montantDemande)}
    />
  );
}

function Facture({ dossier, user }: { dossier: DossierData; user: UserData }) {
  return (
    <Invoice
      numero={dossier.reference}
      dateEmission={TODAY}
      echeance="à réception"
      porteur={`${user.prenom} ${user.nom}`}
      territoire={dossier.territoire}
      nomProjet={dossier.titre || dossier.dispositif}
      dispositif={dossier.dispositif}
      items={[{
        designation: "Mission de conseil en financement public non remboursable",
        description: "Accompagnement à la recherche, à l'identification et au montage de dossiers de financement.",
        quantite: 1,
        puHT: 380,
      }]}
      tvaPct={20}
    />
  );
}

const DOC_COMPONENTS: Record<DocType, React.FC<{ dossier: DossierData; user: UserData }>> = {
  accuse_reception:   AccuseReception,
  rapport_eligibilite: RapportEligibilite,
  fiche_collecte:     FicheCollecte,
  contrat_mission:    ContratMission,
  notification:       Notification,
  facture:            Facture,
};

const DOC_LABELS: Record<DocType, string> = {
  accuse_reception:    "Accusé de réception",
  rapport_eligibilite: "Rapport d'éligibilité",
  fiche_collecte:      "Fiche de collecte",
  contrat_mission:     "Contrat de mission",
  notification:        "Notification d'attribution",
  facture:             "Facture",
};

export default function DocumentPreview() {
  const params = useParams<{ type: string; id: string }>();
  const docType = params.type as DocType;
  const dossierId = Number(params.id);
  const docRef = useRef<HTMLDivElement>(null);

  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${BASE}/api/admin/dossiers/${dossierId}`, { credentials: "include" });
        if (!r.ok) throw new Error("Dossier introuvable ou accès refusé");
        const data = await r.json();
        const { user: u, frais: _f, messages: _m, ...dossierFields } = data;
        setDossier(dossierFields as DossierData);
        setUser(u as UserData);
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
        <p style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}>Chargement du document…</p>
      </div>
    );
  }

  if (error || !dossier || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F1F4FA" }}>
        <p style={{ color: "#DC2626", fontFamily: "Inter, sans-serif" }}>{error ?? "Erreur de chargement"}</p>
      </div>
    );
  }

  const DocComponent = DOC_COMPONENTS[docType];
  if (!DocComponent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Type de document inconnu : {docType}</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#E5E7EB", minHeight: "100vh", padding: "32px 0", position: "relative" }}>
      {exporting && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(241,244,250,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <p style={{ color: "#6B7280", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
            Génération du PDF en cours…
          </p>
        </div>
      )}

      <div className="doc-print-hide" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "794px", margin: "0 auto 20px", padding: "0 4px",
      }}>
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6B7280", margin: 0 }}>
            Prévisualisation — {DOC_LABELS[docType] ?? docType}
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
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          {exporting ? "Génération…" : "Exporter PDF"}
        </button>
      </div>

      <div ref={docRef} style={{ maxWidth: "794px", margin: "0 auto" }}>
        <DocComponent dossier={dossier} user={user} />
      </div>
    </div>
  );
}
