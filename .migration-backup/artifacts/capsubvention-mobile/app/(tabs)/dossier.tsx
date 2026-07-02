import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { apiFetch, getBaseUrl, loadToken } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface Dossier {
  id: number;
  reference: string;
  titre: string;
  territoire: string;
  dispositif: string;
  secteur: string;
  statut: string;
  montantDemande: number;
  montantApport?: number;
  progressionEtape: number;
  totalEtapes: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface Document {
  id: number;
  type: string;
  nom: string;
  statut: "en_attente" | "valide" | "rejete" | "manquant";
  obligatoire: boolean;
  uploadedAt?: string;
}

interface DossierEvent {
  id: number;
  dossierId: number;
  action: string;
  note?: string;
  createdAt: string;
}

const TIMELINE_STEPS = [
  { phase: 1, titre: "Prise en charge",        action: "accuser_reception",   icon: "inbox" as const },
  { phase: 2, titre: "Analyse d'éligibilité",  action: "envoyer_eligibilite", icon: "check-square" as const },
  { phase: 3, titre: "Contractualisation",     action: "envoyer_contrat",     icon: "file-text" as const },
  { phase: 4, titre: "Constitution du dossier",action: "marquer_signe",       icon: "edit-3" as const },
  { phase: 5, titre: "Décision favorable",     action: "marquer_favorable",   icon: "award" as const },
  { phase: 6, titre: "Clôture",                action: "confirmer_paiement",  icon: "flag" as const },
];

const DOCS_BY_ACTION: Record<string, { type: string; label: string }[]> = {
  accuser_reception:   [{ type: "accuse_reception",    label: "Accusé de réception" }],
  envoyer_eligibilite: [{ type: "rapport_eligibilite", label: "Rapport d'éligibilité" }, { type: "fiche_collecte", label: "Fiche de renseignements" }],
  envoyer_contrat:     [{ type: "contrat_mission",     label: "Contrat de mission" }],
  marquer_favorable:   [{ type: "notification",        label: "Notification d'attribution" }],
  confirmer_paiement:  [{ type: "facture",             label: "Facture CapSubvention" }],
};

const DOC_STATUS: Record<string, { color: string; icon: "check-circle" | "x-circle" | "clock" | "alert-circle" }> = {
  valide:     { color: "#16A34A", icon: "check-circle" },
  rejete:     { color: "#DC2626", icon: "x-circle" },
  en_attente: { color: "#D97706", icon: "clock" },
  manquant:   { color: "#6B7896", icon: "alert-circle" },
};

function formatMontant(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function DossierScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: dossiers, isLoading, refetch } = useQuery({
    queryKey: ["dossiers"],
    queryFn: () => apiFetch<Dossier[]>("/api/dossiers"),
  });

  const dossier = dossiers?.[0];

  const { data: docs } = useQuery({
    queryKey: ["documents", dossier?.id],
    queryFn: () => apiFetch<Document[]>(`/api/dossiers/${dossier!.id}/documents`),
    enabled: !!dossier,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events", dossier?.id],
    queryFn: () => apiFetch<DossierEvent[]>(`/api/dossiers/${dossier!.id}/events`),
    enabled: !!dossier,
    refetchInterval: 30000,
  });

  const executedActions = new Set(events.map((e) => e.action));
  const completedCount = TIMELINE_STEPS.filter(s => executedActions.has(s.action)).length;
  const progressPct = Math.round((completedCount / 6) * 100);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  async function openPdf(dossierId: number, type: string) {
    const token = await loadToken();
    const base = getBaseUrl();
    const url = token
      ? `${base}/api/dossiers/${dossierId}/pdf/${type}?token=${token}`
      : `${base}/api/dossiers/${dossierId}/pdf/${type}`;
    Linking.openURL(url).catch(() => {});
  }

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>Mon Dossier</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push("/nouveau-dossier")}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color="#0D1F3C" />
          <Text style={styles.newBtnText}>Nouvelle demande</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B5872A" />}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#0D1F3C" size="large" />
          </View>
        ) : !dossier ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="folder-plus" size={36} color="#B5872A" />
            </View>
            <Text style={styles.emptyTitle}>Aucun dossier en cours</Text>
            <Text style={styles.emptyDesc}>
              Déposez votre première demande de financement non remboursable directement depuis l'application.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => router.push("/nouveau-dossier")}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={18} color="#FFF" />
              <Text style={styles.ctaBtnText}>Créer ma demande de subvention</Text>
            </TouchableOpacity>
            <Text style={styles.ctaNote}>Gratuit · 5 minutes · 100% en ligne</Text>
          </View>
        ) : (
          <>
            {/* Header card */}
            <View style={styles.headerCard}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.ref}>{dossier.reference}</Text>
                  <Text style={styles.titre}>{dossier.titre}</Text>
                </View>
                <StatusBadge statut={dossier.statut} />
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={13} color="#8B9BB4" />
                  <Text style={styles.metaText}>{dossier.territoire}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="tag" size={13} color="#8B9BB4" />
                  <Text style={styles.metaText}>{dossier.dispositif}</Text>
                </View>
              </View>

              <View style={styles.montantRow}>
                <View>
                  <Text style={styles.montantLabel}>Subvention demandée</Text>
                  <Text style={styles.montantValue}>{formatMontant(dossier.montantDemande)}</Text>
                </View>
                {dossier.montantApport ? (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.montantLabel}>Apport propre</Text>
                    <Text style={styles.montantSec}>{formatMontant(dossier.montantApport)}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressLabel}>
                  <Text style={styles.progressText}>Progression globale</Text>
                  <Text style={styles.progressPct}>{progressPct}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${progressPct}%` as any }]} />
                </View>
                <Text style={styles.progressSub}>{completedCount} étape{completedCount > 1 ? "s" : ""} sur 6 complétée{completedCount > 1 ? "s" : ""}</Text>
              </View>

              <Text style={styles.dateCreated}>Déposé le {formatDate(dossier.createdAt)}</Text>
            </View>

            {/* Chronologie */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chronologie du traitement</Text>
              <View style={styles.timeline}>
                {TIMELINE_STEPS.map((step, i) => {
                  const isDone = executedActions.has(step.action);
                  const isCurrent = !isDone && (i === 0 || executedActions.has(TIMELINE_STEPS[i - 1]?.action));
                  const event = events.find(e => e.action === step.action);
                  const isLast = i === TIMELINE_STEPS.length - 1;

                  return (
                    <View key={step.phase} style={styles.timelineRow}>
                      {/* Ligne verticale */}
                      <View style={styles.timelineLeft}>
                        <View style={[
                          styles.timelineDot,
                          isDone ? styles.dotDone : isCurrent ? styles.dotCurrent : styles.dotPending,
                        ]}>
                          {isDone ? (
                            <Feather name="check" size={10} color="#FFF" />
                          ) : isCurrent ? (
                            <View style={styles.pulseDot} />
                          ) : (
                            <Text style={styles.phaseNum}>{step.phase}</Text>
                          )}
                        </View>
                        {!isLast && <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />}
                      </View>

                      {/* Contenu */}
                      <View style={[styles.timelineContent, isLast && { paddingBottom: 0 }]}>
                        <View style={styles.timelineTitleRow}>
                          <Text style={[
                            styles.timelineTitle,
                            isDone ? styles.titleDone : isCurrent ? styles.titleCurrent : styles.titlePending,
                          ]}>
                            {step.titre}
                          </Text>
                          {isDone && event && (
                            <Text style={styles.timelineDate}>
                              {new Date(event.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                            </Text>
                          )}
                          {isCurrent && (
                            <View style={styles.enAttenteTag}>
                              <Text style={styles.enAttenteText}>En attente</Text>
                            </View>
                          )}
                        </View>

                        {isDone && event?.note && (
                          <Text style={styles.noteText}>{event.note}</Text>
                        )}

                        {/* Documents disponibles */}
                        {isDone && (DOCS_BY_ACTION[step.action] ?? []).length > 0 && (
                          <View style={styles.docBtns}>
                            {(DOCS_BY_ACTION[step.action] ?? []).map(doc => (
                              <TouchableOpacity
                                key={doc.type}
                                style={styles.docBtn}
                                onPress={() => openPdf(dossier.id, doc.type)}
                                activeOpacity={0.75}
                              >
                                <Feather name="download" size={11} color="#0D1F3C" />
                                <Text style={styles.docBtnText}>{doc.label}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Description */}
            {dossier.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description du projet</Text>
                <Text style={styles.desc}>{dossier.description}</Text>
              </View>
            )}

            {/* Pièces justificatives */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pièces justificatives</Text>
              {docs && docs.length > 0 ? (
                <View style={styles.docList}>
                  {docs.map((doc) => {
                    const cfg = DOC_STATUS[doc.statut] ?? DOC_STATUS.en_attente;
                    return (
                      <View key={doc.id} style={styles.docItem}>
                        <Feather name="file-text" size={16} color="#6B7896" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.docNom}>{doc.nom}</Text>
                          <Text style={styles.docType}>{doc.type}</Text>
                        </View>
                        <Feather name={cfg.icon} size={18} color={cfg.color} />
                        {doc.obligatoire && <View style={styles.reqDot} />}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyDesc}>Aucun document pour ce dossier.</Text>
              )}
            </View>

            {/* Alerte frais */}
            <View style={styles.fraisCard}>
              <Feather name="info" size={16} color="#1D4ED8" />
              <View style={{ flex: 1 }}>
                <Text style={styles.fraisTitle}>Frais d'instruction</Text>
                <Text style={styles.fraisText}>
                  Les frais d'instruction (456 € TTC) ne sont émis qu'après confirmation officielle de votre subvention. Ils sont payables exclusivement sur capsubvention.fr.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F4FA" },
  navBar: { backgroundColor: "#0D1F3C", paddingHorizontal: 20, paddingBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" as const },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#B5872A", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  newBtnText: { color: "#0D1F3C", fontSize: 12, fontWeight: "700" as const },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyState: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 16, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: "#FFF8F0", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#F0D9A8" },
  emptyTitle: { fontSize: 18, fontWeight: "700" as const, color: "#0D1F3C" },
  emptyDesc: { fontSize: 13, color: "#6B7896", textAlign: "center", lineHeight: 19 },
  ctaBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#0D1F3C", paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14, marginTop: 4 },
  ctaBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" as const },
  ctaNote: { fontSize: 11, color: "#B0BAD0" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  ref: { fontSize: 11, color: "#8B9BB4", fontWeight: "600" as const, marginBottom: 3 },
  titre: { fontSize: 16, fontWeight: "700" as const, color: "#0D1F3C" },
  metaRow: { gap: 6, marginBottom: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12, color: "#6B7896" },
  montantRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#F8F9FC", borderRadius: 12, padding: 14, marginBottom: 14 },
  montantLabel: { fontSize: 11, color: "#8B9BB4", marginBottom: 3 },
  montantValue: { fontSize: 22, fontWeight: "800" as const, color: "#0D1F3C" },
  montantSec: { fontSize: 16, fontWeight: "700" as const, color: "#6B7896" },
  progressSection: { gap: 6, marginBottom: 10 },
  progressLabel: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { fontSize: 12, color: "#6B7896" },
  progressPct: { fontSize: 12, fontWeight: "800" as const, color: "#B5872A" },
  progressTrack: { height: 8, backgroundColor: "#EEF0F7", borderRadius: 4, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: "#B5872A", borderRadius: 4 },
  progressSub: { fontSize: 10, color: "#B0BAD0" },
  dateCreated: { fontSize: 11, color: "#B0BAD0", marginTop: 4 },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: { fontSize: 12, fontWeight: "700" as const, color: "#0D1F3C", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 },
  desc: { fontSize: 13, color: "#4B5574", lineHeight: 20 },
  // Timeline
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", gap: 12 },
  timelineLeft: { alignItems: "center", width: 28 },
  timelineDot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  dotDone: { backgroundColor: "#0D1F3C", borderColor: "#0D1F3C" },
  dotCurrent: { backgroundColor: "#FFFFFF", borderColor: "#B5872A" },
  dotPending: { backgroundColor: "#FFFFFF", borderColor: "#DDE2EC" },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#B5872A" },
  phaseNum: { fontSize: 10, fontWeight: "700" as const, color: "#B0BAD0" },
  timelineLine: { flex: 1, width: 2, backgroundColor: "#EEF0F7", marginVertical: 2 },
  timelineLineDone: { backgroundColor: "#0D1F3C" },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", minHeight: 28, paddingTop: 4 },
  timelineTitle: { fontSize: 13, fontWeight: "700" as const },
  titleDone: { color: "#0D1F3C" },
  titleCurrent: { color: "#B5872A" },
  titlePending: { color: "#B0BAD0" },
  timelineDate: { fontSize: 10, color: "#8B9BB4" },
  enAttenteTag: { backgroundColor: "#FFF7E6", borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: "#F0D9A8" },
  enAttenteText: { fontSize: 9, fontWeight: "700" as const, color: "#B5872A" },
  noteText: { fontSize: 12, color: "#4B5574", lineHeight: 17, marginTop: 3, fontStyle: "italic" },
  docBtns: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  docBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#F4F6FB", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: "#DDE2EC",
  },
  docBtnText: { fontSize: 11, fontWeight: "600" as const, color: "#0D1F3C" },
  // Pièces justificatives
  docList: { gap: 10 },
  docItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F4FA" },
  docNom: { fontSize: 13, fontWeight: "600" as const, color: "#0D1F3C" },
  docType: { fontSize: 11, color: "#8B9BB4", marginTop: 2 },
  reqDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#B5872A" },
  fraisCard: { backgroundColor: "#EFF6FF", borderRadius: 14, padding: 14, flexDirection: "row", gap: 10, marginBottom: 12, borderWidth: 1, borderColor: "#BFDBFE" },
  fraisTitle: { fontSize: 13, fontWeight: "700" as const, color: "#1E40AF", marginBottom: 4 },
  fraisText: { fontSize: 12, color: "#1E40AF", lineHeight: 18 },
});
