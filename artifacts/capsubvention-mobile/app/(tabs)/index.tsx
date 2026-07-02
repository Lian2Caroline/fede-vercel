import React, { useCallback, useMemo, useState } from "react";
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
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { CSLogo } from "@/components/CSLogo";
import { useTranslation } from "react-i18next";

const VIDEO_BASE_URL = process.env.EXPO_PUBLIC_VIDEO_URL
  ?? (process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/capsubvention-video/index.html` : "https://www.fede-financement.com/capsubvention-video/index.html");

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
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

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

  const topPad = insets.top;
  const progress = useMemo(
    () => stats?.dossierActif
      ? (stats.dossierActif.progressionEtape / stats.dossierActif.totalEtapes) * 100
      : 0,
    [stats?.dossierActif]
  );

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CSLogo size={38} />
          <View>
            <Text style={styles.greet}>{t("dashboard.greeting", { name: user?.prenom })}</Text>
            <Text style={styles.greetSub}>{user?.territoire}</Text>
          </View>
        </View>
        <View style={styles.goldBadge}>
          <Text style={styles.goldBadgeText}>F</Text>
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
            <Text style={styles.errorText}>{t("dashboard.error_loading")}</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={styles.retryBtn}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.btn_retry")}
            >
              <Text style={styles.retryText}>{t("dashboard.btn_retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Alert: fonds versés */}
            {stats?.dossierActif?.statut === "verse" && (
              <View style={styles.alertVerse}>
                <Feather name="check-circle" size={20} color="#15803D" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertVerseTitle}>{t("dashboard.alert_verse_title")}</Text>
                  <Text style={styles.alertVerseDesc}>{t("dashboard.alert_verse_desc")}</Text>
                </View>
              </View>
            )}

            {/* Alert: facture impayée */}
            {(stats?.fraisEnAttente ?? 0) > 0 && stats?.dossierActif?.statut !== "verse" && (
              <View style={styles.alertFrais}>
                <Feather name="alert-triangle" size={20} color="#92400E" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertFraisTitle}>{t("dashboard.alert_frais_title")}</Text>
                  <Text style={styles.alertFraisDesc}>{t("dashboard.alert_frais_desc")}</Text>
                </View>
              </View>
            )}

            {/* Stats grid */}
            <Text style={styles.sectionTitle}>{t("dashboard.section_dashboard")}</Text>
            <View style={styles.statsGrid}>
              {[
                { icon: "folder" as const, label: t("dashboard.stat_dossiers"), value: stats?.dossiersCount ?? 0, color: "#0D1F3C" },
                { icon: "file-text" as const, label: t("dashboard.stat_documents"), value: stats?.documentsCount ?? 0, color: "#1A3561" },
                { icon: "message-circle" as const, label: t("dashboard.stat_messages"), value: stats?.messagesNonLus ?? 0, color: "#B5872A", alert: (stats?.messagesNonLus ?? 0) > 0 },
                { icon: "credit-card" as const, label: t("dashboard.stat_frais"), value: stats?.fraisEnAttente ?? 0, color: "#DC2626", alert: (stats?.fraisEnAttente ?? 0) > 0 },
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
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t("dashboard.section_active")}</Text>
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
                    <Text style={styles.montantLabel}>{t("dashboard.montant_label")}</Text>
                    <Text style={styles.montantValue}>{formatMontant(stats.dossierActif.montantDemande)}</Text>
                  </View>
                  <View style={styles.progressSection}>
                    <View style={styles.progressLabel}>
                      <Text style={styles.progressText}>{t("dashboard.progress_label")}</Text>
                      <Text style={styles.progressPct}>{t("dashboard.progress_steps", { current: stats.dossierActif.progressionEtape, total: stats.dossierActif.totalEtapes })}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t("dashboard.section_start")}</Text>
                <View style={styles.emptyCard}>
                  <Feather name="folder-plus" size={32} color="#B5872A" />
                  <Text style={styles.emptyTitle}>{t("dashboard.empty_title")}</Text>
                  <Text style={styles.emptyDesc}>{t("dashboard.empty_desc")}</Text>
                </View>
              </>
            )}

            {/* Vidéo promo */}
            <TouchableOpacity
              style={styles.videoCard}
              activeOpacity={0.82}
              onPress={() => setShowVideo(true)}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.video_title")}
            >
              <View style={styles.videoIconWrap}>
                <Feather name="play-circle" size={28} color="#B5872A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.videoTitle}>{t("dashboard.video_title")}</Text>
                <Text style={styles.videoSub}>{t("dashboard.video_sub")}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.45)" />
            </TouchableOpacity>

            <VideoPlayerModal
              visible={showVideo}
              url={`${VIDEO_BASE_URL}?lang=${i18n.language}`}
              onClose={() => setShowVideo(false)}
            />

            {/* Programme info card */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow2}>
                <View style={styles.infoIconWrap}>
                  <Feather name="calendar" size={15} color="#0D1F3C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoCardTitle}>{t("dashboard.program_title")}</Text>
                  <Text style={styles.infoCardSub}>{t("dashboard.program_sub")}</Text>
                </View>
              </View>
              <View style={styles.infoMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaVal}>30–90j</Text>
                  <Text style={styles.metaKey}>{t("dashboard.program_delay_label")}</Text>
                </View>
                <View style={styles.metaSep} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaVal}>80%</Text>
                  <Text style={styles.metaKey}>{t("dashboard.program_rate_label")}</Text>
                </View>
                <View style={styles.metaSep} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaVal}>32</Text>
                  <Text style={styles.metaKey}>{t("dashboard.program_territories_label")}</Text>
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
  alertVerse: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#F0FDF4", borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "#86EFAC",
  },
  alertVerseTitle: { fontSize: 13, fontWeight: "700" as const, color: "#15803D", marginBottom: 3 },
  alertVerseDesc: { fontSize: 12, color: "#166534", lineHeight: 17 },
  alertFrais: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#FFFBEB", borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "#FCD34D",
  },
  alertFraisTitle: { fontSize: 13, fontWeight: "700" as const, color: "#92400E", marginBottom: 3 },
  alertFraisDesc: { fontSize: 12, color: "#78350F", lineHeight: 17 },
  videoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1F3C",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(181,135,42,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  videoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(181,135,42,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  videoTitle: { fontSize: 14, fontWeight: "700" as const, color: "#FFFFFF", marginBottom: 3 },
  videoSub: { fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 16 },
});
