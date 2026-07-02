import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { apiFetch, apiUploadFile, getBaseUrl } from "@/lib/api";
import { sendLocalNotification } from "@/lib/notifications";
import { StatusBadge } from "@/components/StatusBadge";
import { useTranslation } from "react-i18next";

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
  motifRejet?: string;
}

interface DossierEvent {
  id: number;
  dossierId: number;
  action: string;
  note?: string;
  createdAt: string;
}

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
  return new Date(s).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });
}

const REQUIRED_TYPES = new Set(["identite", "domicile", "business_plan", "financement", "rib"]);

async function pickFromLibrary(deniedMsg: string): Promise<{ name: string; uri: string } | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("", deniedMsg);
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  const name = asset.fileName ?? asset.uri.split("/").pop() ?? "document.jpg";
  return { name, uri: asset.uri };
}

async function pickFromCamera(deniedMsg: string): Promise<{ name: string; uri: string } | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("", deniedMsg);
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  const name = asset.fileName ?? `photo_${Date.now()}.jpg`;
  return { name, uri: asset.uri };
}

async function pickDocument(unavailableMsg: string): Promise<{ name: string; uri: string } | null> {
  try {
    const DocumentPicker = await import("expo-document-picker");
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return { name: asset.name, uri: asset.uri };
  } catch {
    Alert.alert("", unavailableMsg);
    return null;
  }
}

export default function DossierScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);
  const [freeUploading, setFreeUploading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const prevAllRequiredRef = useRef(false);

  const TIMELINE_STEPS = useMemo(() => [
    { phase: 1, titre: t("dossier.timeline_step1"), action: "accuser_reception",   icon: "inbox" as const },
    { phase: 2, titre: t("dossier.timeline_step2"), action: "envoyer_eligibilite", icon: "check-square" as const },
    { phase: 3, titre: t("dossier.timeline_step3"), action: "envoyer_contrat",     icon: "file-text" as const },
    { phase: 4, titre: t("dossier.timeline_step4"), action: "marquer_signe",       icon: "edit-3" as const },
    { phase: 5, titre: t("dossier.timeline_step5"), action: "marquer_favorable",   icon: "award" as const },
    { phase: 6, titre: t("dossier.timeline_step6"), action: "confirmer_paiement",  icon: "flag" as const },
  ], [t]);

  const DOCS_BY_ACTION = useMemo<Record<string, { type: string; label: string }[]>>(() => ({
    accuser_reception:   [{ type: "accuse_reception",    label: t("dossier.doc_accuse") }],
    envoyer_eligibilite: [{ type: "rapport_eligibilite", label: t("dossier.doc_rapport") }, { type: "fiche_collecte", label: t("dossier.doc_fiche") }],
    envoyer_contrat:     [{ type: "contrat_mission",     label: t("dossier.doc_contrat") }],
    marquer_favorable:   [{ type: "notification",        label: t("dossier.doc_notification") }],
    confirmer_paiement:  [{ type: "facture",             label: t("dossier.doc_facture") }],
  }), [t]);

  const { data: dossiers, isLoading, refetch } = useQuery({
    queryKey: ["dossiers"],
    queryFn: () => apiFetch<Dossier[]>("/api/dossiers"),
  });

  const dossier = dossiers?.[0];

  const { data: docs, refetch: refetchDocs } = useQuery({
    queryKey: ["documents", dossier?.id],
    queryFn: () => apiFetch<Document[]>(`/api/dossiers/${dossier!.id}/documents`),
    enabled: !!dossier,
    refetchInterval: 10000,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events", dossier?.id],
    queryFn: () => apiFetch<DossierEvent[]>(`/api/dossiers/${dossier!.id}/events`),
    enabled: !!dossier,
    refetchInterval: 10000,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ dossierId, type, nom, uri, filename }: { dossierId: number; type: string; nom: string; uri: string; filename: string }) => {
      const ext = filename.split(".").pop()?.toLowerCase() ?? "";
      let mimeType = "image/jpeg";
      if (ext === "pdf") mimeType = "application/pdf";
      else if (ext === "png") mimeType = "image/png";
      else if (ext === "webp") mimeType = "image/webp";
      return apiUploadFile(
        `/api/dossiers/${dossierId}/documents/upload`,
        { uri, name: filename, mimeType },
        { type, nom }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", dossier?.id] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (dossierId: number) => {
      try {
        await apiFetch(`/api/dossiers/${dossierId}/documents/submit`, { method: "POST" });
      } catch (e: any) {
        if (e?.status !== 400) console.warn("[submit] documents/submit:", e?.message);
      }
      return apiFetch(`/api/dossiers/${dossierId}/submit`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dossiers"] });
      queryClient.invalidateQueries({ queryKey: ["documents", dossier?.id] });
      Alert.alert(t("dossier.submit_success_title"), t("dossier.submit_success_text"));
    },
    onError: () => Alert.alert(t("dossier.submit_error"), t("dossier.submit_error_text")),
  });

  const prevEventCountRef = useRef<number | null>(null);

  const allRequiredUploaded = useMemo(() => {
    if (!docs || docs.length === 0) return false;
    const uploadedTypes = new Set(docs.map(d => d.type));
    return [...REQUIRED_TYPES].every(t => uploadedTypes.has(t));
  }, [docs]);

  useEffect(() => {
    if (allRequiredUploaded && !prevAllRequiredRef.current) {
      prevAllRequiredRef.current = true;
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    } else if (!allRequiredUploaded) {
      prevAllRequiredRef.current = false;
    }
  }, [allRequiredUploaded]);

  useEffect(() => {
    if (events.length === 0) return;
    if (prevEventCountRef.current === null) {
      prevEventCountRef.current = events.length;
      return;
    }
    if (events.length > prevEventCountRef.current) {
      sendLocalNotification(t("dossier.notif_new_step_title"), t("dossier.notif_new_step_body"));
      prevEventCountRef.current = events.length;
    }
  }, [events.length]);

  const executedActions = useMemo(() => new Set(events.map((e) => e.action)), [events]);
  const completedCount = useMemo(() => TIMELINE_STEPS.filter(s => executedActions.has(s.action)).length, [TIMELINE_STEPS, executedActions]);
  const progressPct = useMemo(() => Math.round((completedCount / 6) * 100), [completedCount]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSubmit = useCallback(() => {
    if (!dossier) return;
    Alert.alert(
      t("dossier.submit_confirm_title"),
      t("dossier.submit_confirm_text"),
      [
        { text: t("dossier.sheet_cancel"), style: "cancel" },
        { text: t("dossier.submit_confirm_ok"), onPress: () => submitMutation.mutate(dossier.id) },
      ]
    );
  }, [dossier, t, submitMutation]);

  const openPdf = useCallback(async (dossierId: number, type: string) => {
    try {
      const { token } = await apiFetch<{ token: string; expiresInSeconds: number }>("/api/pdf-token", { method: "POST" });
      const base = getBaseUrl();
      const url = `${base}/api/dossiers/${dossierId}/pdf/${type}?token=${encodeURIComponent(token)}`;
      Linking.openURL(url).catch(() => {});
    } catch {
      Alert.alert(t("dossier.upload_error"), t("dossier.upload_error_text"));
    }
  }, [t]);

  const showUploadOptions = useCallback((doc: Document) => {
    if (!dossier) return;
    const doUpload = async (picked: { name: string; uri: string } | null) => {
      if (!picked) return;
      setUploadingDocId(doc.id);
      try {
        await uploadMutation.mutateAsync({
          dossierId: dossier.id,
          type: doc.type,
          nom: doc.nom,
          uri: picked.uri,
          filename: picked.name,
        });
        Alert.alert(t("dossier.upload_success"), t("dossier.upload_success_text", { name: doc.nom }));
      } catch {
        Alert.alert(t("dossier.upload_error"), t("dossier.upload_error_text"));
      } finally {
        setUploadingDocId(null);
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t("dossier.sheet_title", { name: doc.nom }),
          options: [t("dossier.sheet_cancel"), t("dossier.sheet_camera"), t("dossier.sheet_gallery"), t("dossier.sheet_file")],
          cancelButtonIndex: 0,
        },
        async (idx) => {
          if (idx === 1) doUpload(await pickFromCamera(t("dossier.camera_permission")));
          else if (idx === 2) doUpload(await pickFromLibrary(t("dossier.gallery_permission")));
          else if (idx === 3) doUpload(await pickDocument(t("dossier.doc_unavailable_text")));
        }
      );
    } else {
      Alert.alert(
        t("dossier.sheet_title", { name: doc.nom }),
        t("dossier.sheet_source"),
        [
          { text: t("dossier.sheet_cancel"), style: "cancel" },
          { text: `📷 ${t("dossier.sheet_camera")}`, onPress: async () => doUpload(await pickFromCamera(t("dossier.camera_permission"))) },
          { text: `🖼 ${t("dossier.sheet_gallery")}`, onPress: async () => doUpload(await pickFromLibrary(t("dossier.gallery_permission"))) },
          { text: `📄 ${t("dossier.sheet_file")}`, onPress: async () => doUpload(await pickDocument(t("dossier.doc_unavailable_text"))) },
        ]
      );
    }
  }, [dossier, t, uploadMutation]);

  const handleFreeUpload = useCallback(async () => {
    if (!dossier) return;
    const doUpload = async (picked: { name: string; uri: string } | null) => {
      if (!picked) return;
      setFreeUploading(true);
      try {
        await uploadMutation.mutateAsync({
          dossierId: dossier.id,
          type: "piece_libre",
          nom: t("dossier.upload_free_name"),
          uri: picked.uri,
          filename: picked.name,
        });
        Alert.alert(t("dossier.upload_success"), t("dossier.upload_success_text", { name: picked.name }));
      } catch {
        Alert.alert(t("dossier.upload_error"), t("dossier.upload_error_text"));
      } finally {
        setFreeUploading(false);
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t("dossier.upload_free_name"),
          options: [t("dossier.sheet_cancel"), t("dossier.sheet_camera"), t("dossier.sheet_gallery"), t("dossier.sheet_file")],
          cancelButtonIndex: 0,
        },
        async (idx) => {
          if (idx === 1) doUpload(await pickFromCamera(t("dossier.camera_permission")));
          else if (idx === 2) doUpload(await pickFromLibrary(t("dossier.gallery_permission")));
          else if (idx === 3) doUpload(await pickDocument(t("dossier.doc_unavailable_text")));
        }
      );
    } else {
      Alert.alert(
        t("dossier.upload_free_name"),
        t("dossier.sheet_source"),
        [
          { text: t("dossier.sheet_cancel"), style: "cancel" },
          { text: `📷 ${t("dossier.sheet_camera")}`, onPress: async () => doUpload(await pickFromCamera(t("dossier.camera_permission"))) },
          { text: `🖼 ${t("dossier.sheet_gallery")}`, onPress: async () => doUpload(await pickFromLibrary(t("dossier.gallery_permission"))) },
          { text: `📄 ${t("dossier.sheet_file")}`, onPress: async () => doUpload(await pickDocument(t("dossier.doc_unavailable_text"))) },
        ]
      );
    }
  }, [dossier, t, uploadMutation]);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>{t("dossier.nav_title")}</Text>
        {!dossier && !isLoading && (
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push("/nouveau-dossier")}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={16} color="#0D1F3C" />
            <Text style={styles.newBtnText}>{t("dossier.btn_new")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
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
            <Text style={styles.emptyTitle}>{t("dossier.empty_title")}</Text>
            <Text style={styles.emptyDesc}>{t("dossier.empty_desc")}</Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => router.push("/nouveau-dossier")}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={18} color="#FFF" />
              <Text style={styles.ctaBtnText}>{t("dossier.btn_create")}</Text>
            </TouchableOpacity>
            <Text style={styles.ctaNote}>{t("dossier.cta_note")}</Text>
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
                  <Text style={styles.montantLabel}>{t("dossier.montant_label")}</Text>
                  <Text style={styles.montantValue}>{formatMontant(dossier.montantDemande)}</Text>
                </View>
                {dossier.montantApport ? (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.montantLabel}>{t("dossier.apport_label")}</Text>
                    <Text style={styles.montantSec}>{formatMontant(dossier.montantApport)}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressLabel}>
                  <Text style={styles.progressText}>{t("dossier.progress_label")}</Text>
                  <Text style={styles.progressPct}>{progressPct}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${progressPct}%` as any }]} />
                </View>
                <Text style={styles.progressSub}>{t("dossier.progress_sub", { count: completedCount })}</Text>
              </View>

              <Text style={styles.dateCreated}>{t("dossier.date_deposited", { date: formatDate(dossier.createdAt) })}</Text>
            </View>

            {/* Chronologie */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("dossier.section_timeline")}</Text>
              <View style={styles.timeline}>
                {TIMELINE_STEPS.map((step, i) => {
                  const isDone = executedActions.has(step.action);
                  const isCurrent = !isDone && (i === 0 || executedActions.has(TIMELINE_STEPS[i - 1]?.action));
                  const event = events.find(e => e.action === step.action);
                  const isLast = i === TIMELINE_STEPS.length - 1;

                  return (
                    <View key={step.phase} style={styles.timelineRow}>
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
                              {new Date(event.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" })}
                            </Text>
                          )}
                          {isCurrent && (
                            <View style={styles.enAttenteTag}>
                              <Text style={styles.enAttenteText}>{t("dossier.en_attente")}</Text>
                            </View>
                          )}
                        </View>

                        {isDone && event?.note && (
                          <Text style={styles.noteText}>{event.note}</Text>
                        )}

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
                <Text style={styles.sectionTitle}>{t("dossier.section_description")}</Text>
                <Text style={styles.desc}>{dossier.description}</Text>
              </View>
            )}

            {/* Pièces justificatives */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t("dossier.section_docs")}</Text>
                <TouchableOpacity
                  style={styles.uploadHint}
                  onPress={handleFreeUpload}
                  disabled={freeUploading}
                  activeOpacity={0.7}
                >
                  {freeUploading ? (
                    <ActivityIndicator size="small" color="#B5872A" />
                  ) : (
                    <Feather name="upload" size={11} color="#B5872A" />
                  )}
                  <Text style={styles.uploadHintText}>{t("dossier.upload_hint")}</Text>
                </TouchableOpacity>
              </View>
              {docs && docs.length > 0 && (
                <View style={styles.docList}>
                  {docs.map((doc) => {
                    const cfg = DOC_STATUS[doc.statut] ?? DOC_STATUS.en_attente;
                    const isUploading = uploadingDocId === doc.id;
                    const canUpload = doc.statut !== "valide";
                    const isRequired = doc.obligatoire || REQUIRED_TYPES.has(doc.type);
                    return (
                      <View key={doc.id} style={styles.docItem}>
                        <Feather name="file-text" size={16} color="#6B7896" />
                        <View style={{ flex: 1 }}>
                          <View style={styles.docNomRow}>
                            <Text style={styles.docNom}>{doc.nom}</Text>
                            {isRequired && (
                              <View style={styles.reqBadge}>
                                <Text style={styles.reqBadgeText}>{t("dossier.required_label")}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.docType}>{doc.type}</Text>
                          {doc.uploadedAt && (
                            <Text style={styles.docDate}>
                              {t("dossier.doc_deposited", { date: new Date(doc.uploadedAt).toLocaleDateString(undefined) })}
                            </Text>
                          )}
                          {doc.statut === "rejete" && doc.motifRejet && (
                            <Text style={styles.docMotif}>{t("dossier.doc_motif_rejet", { motif: doc.motifRejet })}</Text>
                          )}
                        </View>
                        <Feather name={cfg.icon} size={16} color={cfg.color} />
                        {canUpload && (
                          <TouchableOpacity
                            style={[styles.uploadBtn, isUploading && { opacity: 0.5 }]}
                            onPress={() => showUploadOptions(doc)}
                            disabled={isUploading}
                            activeOpacity={0.7}
                          >
                            {isUploading ? (
                              <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                              <Feather name="upload" size={13} color="#FFF" />
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Categories d'upload — toujours visibles, sauf celles déjà envoyées */}
              {(() => {
                const uploadedTypes = new Set((docs ?? []).map((d) => d.type));
                const ALL_CATS = [
                  { type: "identite",      key: "doc_cat_identite",      obligatoire: true  },
                  { type: "domicile",      key: "doc_cat_domicile",      obligatoire: true  },
                  { type: "business_plan", key: "doc_cat_business_plan", obligatoire: true  },
                  { type: "financement",   key: "doc_cat_financement",   obligatoire: true  },
                  { type: "rib",           key: "doc_cat_rib",           obligatoire: true  },
                  { type: "kbis",          key: "doc_cat_kbis",          obligatoire: false },
                  { type: "devis",         key: "doc_cat_devis",         obligatoire: false },
                  { type: "piece_libre",   key: "doc_cat_autre",         obligatoire: false },
                ];
                const remainingCats = ALL_CATS.filter((cat) => !uploadedTypes.has(cat.type));
                if (remainingCats.length === 0) return null;
                return (
              <View style={[styles.emptyDocsBox, docs && docs.length > 0 && { marginTop: 12 }]}>
                {(!docs || docs.length === 0) && (
                  <>
                    <Text style={styles.emptyDocsTitle}>{t("dossier.empty_docs_title")}</Text>
                    <Text style={styles.emptyDocsDesc}>{t("dossier.empty_docs_desc")}</Text>
                  </>
                )}
                <Text style={styles.docCatTitle}>{t("dossier.doc_cat_title")}</Text>
                {remainingCats.map((cat) => (
                  <TouchableOpacity
                    key={cat.type}
                    style={styles.docCatBtn}
                    onPress={() => showUploadOptions({
                      id: -(cat.type.length),
                      type: cat.type,
                      nom: t(`dossier.${cat.key}`),
                      statut: "manquant",
                      obligatoire: cat.obligatoire,
                    })}
                    activeOpacity={0.7}
                  >
                    <Feather name="file-plus" size={14} color="#0D1F3C" />
                    <Text style={styles.docCatText}>{t(`dossier.${cat.key}`)}</Text>
                    {cat.obligatoire && (
                      <View style={styles.reqBadge}>
                        <Text style={styles.reqBadgeText}>{t("dossier.required_label")}</Text>
                      </View>
                    )}
                    <Feather name="upload" size={12} color="#B5872A" />
                  </TouchableOpacity>
                ))}
              </View>
                );
              })()}
            </View>

            {/* Bouton soumission des pièces */}
            {dossier.statut !== "soumis" && dossier.statut !== "verse" && (
              <TouchableOpacity
                style={[styles.submitBtn, submitMutation.isPending && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={submitMutation.isPending}
                activeOpacity={0.85}
              >
                {submitMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Feather name="send" size={16} color="#FFF" />
                    <Text style={styles.submitBtnText}>{t("dossier.btn_submit_docs")}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Alerte frais */}
            <View style={styles.fraisCard}>
              <Feather name="info" size={16} color="#1D4ED8" />
              <View style={{ flex: 1 }}>
                <Text style={styles.fraisTitle}>{t("dossier.frais_title")}</Text>
                <Text style={styles.fraisText}>{t("dossier.frais_text")}</Text>
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
  progressSub: { fontSize: 11, color: "#8B9BB4" },
  dateCreated: { fontSize: 11, color: "#B0BAD0", marginTop: 4 },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "700" as const, color: "#0D1F3C", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
  uploadHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  uploadHintText: { fontSize: 11, color: "#B5872A" },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", gap: 12 },
  timelineLeft: { alignItems: "center", width: 24 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dotDone: { backgroundColor: "#16A34A" },
  dotCurrent: { backgroundColor: "#B5872A" },
  dotPending: { backgroundColor: "#EEF0F7", borderWidth: 1.5, borderColor: "#DDE2EC" },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF" },
  phaseNum: { fontSize: 10, fontWeight: "700" as const, color: "#8B9BB4" },
  timelineLine: { width: 2, flex: 1, backgroundColor: "#EEF0F7", marginTop: 2 },
  timelineLineDone: { backgroundColor: "#16A34A" },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  timelineTitle: { fontSize: 13, fontWeight: "600" as const, flex: 1 },
  titleDone: { color: "#0D1F3C" },
  titleCurrent: { color: "#B5872A" },
  titlePending: { color: "#8B9BB4" },
  timelineDate: { fontSize: 10, color: "#8B9BB4" },
  enAttenteTag: { backgroundColor: "#FEF3C7", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  enAttenteText: { fontSize: 10, color: "#92400E", fontWeight: "600" as const },
  noteText: { fontSize: 12, color: "#6B7896", marginTop: 4, lineHeight: 17 },
  docBtns: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  docBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EEF0F7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  docBtnText: { fontSize: 11, color: "#0D1F3C", fontWeight: "600" as const },
  desc: { fontSize: 13, color: "#4B5574", lineHeight: 20, backgroundColor: "#FFF", borderRadius: 14, padding: 14 },
  docList: { gap: 8 },
  docItem: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFF",
    borderRadius: 12, padding: 12,
    shadowColor: "#0D1F3C", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    position: "relative",
  },
  docNom: { fontSize: 13, fontWeight: "600" as const, color: "#0D1F3C" },
  docType: { fontSize: 11, color: "#8B9BB4", marginTop: 1 },
  docDate: { fontSize: 10, color: "#B0BAD0", marginTop: 2 },
  docMotif: { fontSize: 11, color: "#DC2626", marginTop: 3, fontStyle: "italic", lineHeight: 16 },
  uploadBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: "#0D1F3C",
    alignItems: "center", justifyContent: "center",
  },
  docNomRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  reqBadge: { backgroundColor: "#FEE2E2", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  reqBadgeText: { fontSize: 9, color: "#DC2626", fontWeight: "700" as const, textTransform: "uppercase" as const, letterSpacing: 0.4 },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#0D1F3C", borderRadius: 14, paddingVertical: 15,
    marginBottom: 16, marginTop: 4,
    shadowColor: "#0D1F3C", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  submitBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" as const },
  emptyDocsBox: { backgroundColor: "#FFF", borderRadius: 14, padding: 20, gap: 8 },
  emptyDocsTitle: { fontSize: 14, fontWeight: "700" as const, color: "#0D1F3C" },
  emptyDocsDesc: { fontSize: 12, color: "#6B7896", lineHeight: 18, marginBottom: 4 },
  docCatTitle: { fontSize: 11, fontWeight: "700" as const, color: "#0D1F3C", textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 4, marginTop: 4 },
  docCatBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#F1F4FA", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: "#DDE2EC",
  },
  docCatText: { flex: 1, fontSize: 13, color: "#0D1F3C", fontWeight: "500" as const },
  fraisCard: {
    flexDirection: "row", gap: 12, backgroundColor: "#EFF6FF", borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: "#BFDBFE", marginBottom: 16,
  },
  fraisTitle: { fontSize: 13, fontWeight: "700" as const, color: "#1D4ED8", marginBottom: 4 },
  fraisText: { fontSize: 12, color: "#1E40AF", lineHeight: 18 },
});
