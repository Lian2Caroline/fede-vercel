import React from "react";
import i18n from "@/i18n";
import {
  AcknowledgementReceipt,
  EligibilityReport,
  MissionContract,
  InformationForm,
  FundingAwardNotification,
  Invoice,
} from "@/components/documents";

function fmtDate(iso: string, lang?: string) {
  const locale = lang || i18n.language || 'fr';
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function fmtMoney(v: number) {
  return v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function today(lang?: string) {
  const locale = lang || i18n.language || 'fr';
  return new Date().toLocaleDateString(locale, {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export type DocType =
  | "accuse_reception"
  | "rapport_eligibilite"
  | "fiche_collecte"
  | "contrat_mission"
  | "notification"
  | "facture";

export const DOC_LABELS: Record<DocType, string> = {
  accuse_reception:    "Accusé de réception",
  rapport_eligibilite: "Rapport d'éligibilité",
  fiche_collecte:      "Fiche de collecte",
  contrat_mission:     "Contrat de mission",
  notification:        "Notification d'attribution",
  facture:             "Facture",
};

export interface DocDossierData {
  reference: string;
  territoire: string;
  titre?: string | null;
  dispositif: string;
  secteur: string;
  montantDemande: number;
  createdAt: string;
}

export interface DocUserData {
  prenom: string;
  nom: string;
  territoire?: string | null;
}

export function renderDoc(
  docType: DocType,
  dossier: DocDossierData,
  user: DocUserData,
  lang?: string,
): React.ReactElement | null {
  const NOW = today(lang);
  const porteur = `${user.prenom} ${user.nom}`;
  const T = (key: string) => i18n.t(key, { lng: lang || i18n.language || 'fr' });

  switch (docType) {
    case "accuse_reception":
      return (
        <AcknowledgementReceipt
          reference={dossier.reference}
          dateEmission={NOW}
          porteur={porteur}
          territoire={dossier.territoire}
          dispositif={dossier.dispositif}
          secteur={dossier.secteur}
          montantDemande={fmtMoney(dossier.montantDemande)}
          dateDepot={fmtDate(dossier.createdAt, lang)}
          lang={lang}
        />
      );
    case "rapport_eligibilite":
      return (
        <EligibilityReport
          reference={dossier.reference}
          dateEmission={NOW}
          porteur={porteur}
          nomProjet={dossier.titre || dossier.dispositif}
          territoire={dossier.territoire}
          secteur={dossier.secteur}
          montantPotentiel={fmtMoney(dossier.montantDemande)}
          tauxMin={40}
          tauxMax={80}
          dispositifPrincipal={dossier.dispositif}
          criterias={[
            { label: T('docs.eligibility.criteria_geo'),      description: `${T('docs.common.territoire')} ${dossier.territoire}`, ok: true },
            { label: T('docs.eligibility.criteria_secteur'),  description: `"${dossier.secteur}"`, ok: true },
            { label: T('docs.eligibility.criteria_montant'),  description: `${fmtMoney(dossier.montantDemande)} — 40 % – 80 %`, ok: true },
            { label: T('docs.eligibility.criteria_complete'), description: T('docs.eligibility.criteria_complete_desc'), ok: true },
          ]}
          lang={lang}
        />
      );
    case "fiche_collecte":
      return (
        <InformationForm
          reference={dossier.reference}
          dateEmission={NOW}
          porteur={porteur}
          nomProjet={dossier.titre || dossier.dispositif}
          territoire={dossier.territoire}
          montantCible={fmtMoney(dossier.montantDemande)}
          lang={lang}
        />
      );
    case "contrat_mission":
      return (
        <MissionContract
          reference={dossier.reference}
          dateEmission={NOW}
          porteur={porteur}
          nomProjet={dossier.titre || dossier.dispositif}
          territoire={dossier.territoire}
          porteurTerritoire={user.territoire || dossier.territoire}
          montantCible={fmtMoney(dossier.montantDemande)}
          lang={lang}
        />
      );
    case "notification":
      return (
        <FundingAwardNotification
          reference={dossier.reference}
          dateDecision={NOW}
          porteur={porteur}
          territoire={dossier.territoire}
          dispositif={dossier.dispositif}
          nomProjet={dossier.titre || dossier.dispositif}
          montantAttribue={fmtMoney(dossier.montantDemande)}
          lang={lang}
        />
      );
    case "facture":
      return (
        <Invoice
          numero={dossier.reference}
          dateEmission={NOW}
          porteur={porteur}
          territoire={dossier.territoire}
          nomProjet={dossier.titre || dossier.dispositif}
          dispositif={dossier.dispositif}
          tvaPct={20}
          lang={lang}
        />
      );
    default:
      return null;
  }
}
