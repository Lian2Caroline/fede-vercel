import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { CSLogo } from "@/components/CSLogo";

interface DashboardStats {
  dossiersCount: number;
  documentsCount: number;
  fraisEnAttente: number;
  messagesNonLus: number;
  dossierActif?: {
    id: number;
    reference: string;
    titre: string;
    territoire: string;
    dispositif: string;
    statut: string;
    montantDemande: number;
    progressionEtape: number;
    totalEtapes: number;
  };
}

function formatMontant(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<DashboardStats>("/api/dashboard/stats"),
    refetchInterval: 30000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const progress = stats?.dossierActif
    ? (stats.dossierActif.progressionEtape / stats.dossierActif.totalEtapes) * 100
    : 0;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CSLogo size={38} />
          <View>
            <Text style={styles.greet}>Bonjour, {user?.prenom} 👋</Text>
            <Text style={styles.greetSub}>{user?.territoire}</Text>
          </View>
        </View>
        <View style={styles.goldBadge}>
          <Text style={styles.goldBadgeText}>CS</Text>
        </View>
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
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Erreur de chargement</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats grid */}
            <Text style={styles.sectionTitle}>Tableau de bord</Text>
            <View style={styles.statsGrid}>
              {[
                { icon: "folder" as const, label: "Dossiers", value: stats?.dossiersCount ?? 0, color: "#0D1F3C" },
                { icon: "file-text" as const, label: "Documents", value: stats?.documentsCount ?? 0, color: "#1A3561" },
                { icon: "message-circle" as const, label: "Messages", value: stats?.messagesNonLus ?? 0, color: "#B5872A", alert: (stats?.messagesNonLus ?? 0) > 0 },
                { icon: "credit-card" as const, label: "Frais en attente", value: stats?.fraisEnAttente ?? 0, color: "#DC2626", alert: (stats?.fraisEnAttente ?? 0) > 0 },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: s.color + "15" }]}>
                    <Feather name={s.icon} size={20} color={s.color} />
                    {s.alert && <View style={styles.alertDot} />}
                  </View>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Dossier actif */}
            {stats?.dossierActif ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Dossier actif</Text>
                <View style={styles.dossierCard}>
                  <View style={styles.dossierTop}>
                    <View>
                      <Text style={styles.dossierRef}>{stats.dossierActif.reference}</Text>
                      <Text style={styles.dossierTitre}>{stats.dossierActif.titre}</Text>
                    </View>
                    <StatusBadge statut={stats.dossierActif.statut} />
                  </View>
                  <View style={styles.dossierInfo}>
                    <View style={styles.infoRow}>
                      <Feather name="map-pin" size={13} color="#8B9BB4" />
                      <Text style={styles.infoText}>{stats.dossierActif.territoire}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Feather name="tag" size={13} color="#8B9BB4" />
                      <Text style={styles.infoText}>{stats.dossierActif.dispositif}</Text>
                    </View>
                  </View>
                  <View style={styles.montantRow}>
                    <Text style={styles.montantLabel}>Montant demandé</Text>
                    <Text style={styles.montantValue}>{formatMontant(stats.dossierActif.montantDemande)}</Text>
                  </View>
                  <View style={styles.progressSection}>
                    <View style={styles.progressLabel}>
                      <Text style={styles.progressText}>Progression</Text>
                      <Text style={styles.progressPct}>{stats.dossierActif.progressionEtape}/{stats.dossierActif.totalEtapes} étapes</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Démarrer</Text>
                <View style={styles.emptyCard}>
                  <Feather name="folder-plus" size={32} color="#B5872A" />
                  <Text style={styles.emptyTitle}>Aucun dossier en cours</Text>
                  <Text style={styles.emptyDesc}>Déposez votre premier dossier pour accéder aux financements non remboursables de votre territoire.</Text>
                </View>
              </>
            )}

            {/* Programme info card */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow2}>
                <View style={styles.infoIconWrap}>
                  <Feather name="calendar" size={15} color="#0D1F3C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoCardTitle}>Programme 2025–2027</Text>
                  <Text style={styles.infoCardSub}>
                    Les enveloppes budgétaires FEDER, FSE+ et FEADER sont ouvertes. Les dossiers sont instruits par ordre de dépôt.
                  </Text>
                </View>
              </View>
              <View style={styles.infoMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaVal}>30–90j</Text>
                  <Text style={styles.metaKey}>Délai d'instruction</Text>
                </View>
                <View style={styles.metaSep} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaVal}>80%</Text>
                  <Text style={styles.metaKey}>Taux de financement max.</Text>
                </View>
                <View style={styles.metaSep} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaVal}>5 DOM</Text>
                  <Text style={styles.metaKey}>Territoires couverts</Text>
                </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#0D1F3C",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  greet: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" as const },
  greetSub: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 1 },
  goldBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(181,135,42,0.2)",
    borderWidth: 1,
    borderColor: "rgba(181,135,42,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  goldBadgeText: { color: "#B5872A", fontSize: 12, fontWeight: "800" as const },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  errorText: { color: "#6B7896", fontSize: 15 },
  retryBtn: { marginTop: 12, backgroundColor: "#0D1F3C", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: "#FFF", fontWeight: "600" as const },
  sectionTitle: { fontSize: 13, fontWeight: "700" as const, color: "#0D1F3C", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10, position: "relative" },
  alertDot: { position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: "#DC2626", borderWidth: 1.5, borderColor: "#FFF" },
  statValue: { fontSize: 28, fontWeight: "800" as const, color: "#0D1F3C" },
  statLabel: { fontSize: 12, color: "#6B7896", marginTop: 2 },
  dossierCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  dossierTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  dossierRef: { fontSize: 11, color: "#8B9BB4", fontWeight: "600" as const, marginBottom: 3 },
  dossierTitre: { fontSize: 16, fontWeight: "700" as const, color: "#0D1F3C", maxWidth: 200 },
  dossierInfo: { gap: 5, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 12, color: "#6B7896" },
  montantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  montantLabel: { fontSize: 12, color: "#6B7896" },
  montantValue: { fontSize: 18, fontWeight: "800" as const, color: "#0D1F3C" },
  progressSection: { gap: 8 },
  progressLabel: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { fontSize: 12, color: "#6B7896" },
  progressPct: { fontSize: 12, fontWeight: "700" as const, color: "#0D1F3C" },
  progressTrack: { height: 8, backgroundColor: "#EEF0F7", borderRadius: 4, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: "#B5872A", borderRadius: 4 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700" as const, color: "#0D1F3C" },
  emptyDesc: { fontSize: 13, color: "#6B7896", textAlign: "center", lineHeight: 19 },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow2: { flexDirection: "row", gap: 12, marginBottom: 14 },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F4FA",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoCardTitle: { fontSize: 13, fontWeight: "700" as const, color: "#0D1F3C", marginBottom: 3 },
  infoCardSub: { fontSize: 12, color: "#6B7896", lineHeight: 17 },
  infoMeta: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEF0F7",
    paddingTop: 12,
  },
  metaItem: { flex: 1, alignItems: "center" },
  metaVal: { fontSize: 15, fontWeight: "800" as const, color: "#B5872A" },
  metaKey: { fontSize: 10, color: "#8B9BB4", textAlign: "center", marginTop: 2 },
  metaSep: { width: 1, height: 32, backgroundColor: "#EEF0F7" },
});
