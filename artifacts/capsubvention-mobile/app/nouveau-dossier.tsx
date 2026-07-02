import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { TERRITORIES, SECTEUR_KEYS } from "@/lib/constants";

interface FormData {
  titre: string;
  description: string;
  secteur: string;
  dispositif: string;
  montantDemande: string;
  montantApport: string;
  justificationBudget: string;
  dateDebut: string;
  dureeProjet: string;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.steps}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={[styles.stepDot, i < current && styles.stepDone, i === current && styles.stepActive]}>
            {i < current ? (
              <Feather name="check" size={10} color="#FFF" />
            ) : (
              <Text style={[styles.stepNum, i === current && styles.stepNumActive]}>{i + 1}</Text>
            )}
          </View>
          {i < total - 1 && <View style={[styles.stepLine, i < current && styles.stepLineDone]} />}
        </View>
      ))}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {text}{required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

function RecapRow({ icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.recapRow}>
      <Feather name={icon} size={14} color="#8B9BB4" style={{ width: 18 }} />
      <Text style={styles.recapLabel}>{label}</Text>
      <Text style={[styles.recapValue, highlight && styles.recapValueHighlight]}>{value}</Text>
    </View>
  );
}

export default function NouveauDossierScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const userTerritoire = user?.territoire ?? "";
  const territoryInfo = TERRITORIES.find(ter => ter.name === userTerritoire);
  const DISPOSITIFS = territoryInfo?.fonds ?? [];
  const SECTEURS = SECTEUR_KEYS.map((key) => ({ key, value: t(key) }));
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ titre: string; montant: string; territoire: string } | null>(null);

  const STEP_TITLES = [
    t("nouveau_dossier.step1_title"),
    t("nouveau_dossier.step2_title"),
    t("nouveau_dossier.step3_title"),
    t("nouveau_dossier.step4_title"),
  ];

  const DUREES = [
    t("nouveau_dossier.duree_6m"),
    t("nouveau_dossier.duree_12m"),
    t("nouveau_dossier.duree_18m"),
    t("nouveau_dossier.duree_24m"),
    t("nouveau_dossier.duree_36m"),
    t("nouveau_dossier.duree_plus"),
  ];

  const [form, setForm] = useState<FormData>({
    titre: "",
    description: "",
    secteur: "",
    dispositif: "",
    montantDemande: "",
    montantApport: "",
    justificationBudget: "",
    dateDebut: "",
    dureeProjet: "",
  });

  const set = (k: keyof FormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.titre.trim()) { Alert.alert(t("nouveau_dossier.validate_titre"), t("nouveau_dossier.validate_titre_text")); return false; }
      if (!form.secteur) { Alert.alert(t("nouveau_dossier.validate_titre"), t("nouveau_dossier.validate_secteur_text")); return false; }
    }
    if (step === 1) {
      if (!form.dispositif) { Alert.alert(t("nouveau_dossier.validate_titre"), t("nouveau_dossier.validate_dispositif_text")); return false; }
      if (!form.montantDemande || isNaN(Number(form.montantDemande))) { Alert.alert(t("nouveau_dossier.validate_titre"), t("nouveau_dossier.validate_montant_text")); return false; }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) { router.back(); return; }
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiFetch("/api/dossiers", {
        method: "POST",
        body: JSON.stringify({
          titre: form.titre.trim(),
          territoire: user?.territoire ?? t("common.territory_unknown"),
          dispositif: form.dispositif,
          secteur: form.secteur,
          description: form.description.trim() || undefined,
          montantDemande: Number(form.montantDemande),
          montantApport: form.montantApport ? Number(form.montantApport) : undefined,
          justificationBudget: form.justificationBudget.trim() || undefined,
          dateDebut: form.dateDebut.trim() || undefined,
          dureeProjet: form.dureeProjet.trim() || undefined,
        }),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["dossiers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setSubmittedData({
        titre: form.titre.trim(),
        montant: formatMontant(form.montantDemande),
        territoire: user?.territoire ?? t("common.territory_unknown"),
      });
      setSubmitted(true);
    } catch (e: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("nouveau_dossier.submit_error"), e.message ?? t("nouveau_dossier.submit_error_text"));
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (v: string) => {
    const n = Number(v);
    if (isNaN(n) || !v) return "—";
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  };

  if (submitted && submittedData) {
    return (
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={[styles.header, { paddingBottom: 18 }]}>
          <View style={{ width: 36 }} />
          <Text style={styles.headerTitle}>{t("nouveau_dossier.submitted_title")}</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "center", marginTop: 16, marginBottom: 28 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: "#ECFDF5", borderWidth: 3, borderColor: "#6EE7B7",
              alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              <Feather name="check" size={38} color="#059669" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: "800" as const, color: "#0D1F3C", textAlign: "center", marginBottom: 8 }}>
              {t("nouveau_dossier.success_title")}
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7896", textAlign: "center", lineHeight: 21 }}>
              {t("nouveau_dossier.success_sub")}
            </Text>
          </View>

          <View style={{ backgroundColor: "#FFF", borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: "#0D1F3C", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: "700" as const, color: "#8B9BB4", textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 12 }}>
              {t("nouveau_dossier.recap_title")}
            </Text>
            <View style={{ flexDirection: "row" as const, alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F4FA" }}>
              <Feather name="file-text" size={14} color="#8B9BB4" />
              <Text style={{ fontSize: 12, color: "#6B7896", flex: 1 }}>{t("nouveau_dossier.recap_titre")}</Text>
              <Text style={{ fontSize: 13, color: "#0D1F3C", fontWeight: "600" as const, maxWidth: 190, textAlign: "right" as const }} numberOfLines={2}>{submittedData.titre}</Text>
            </View>
            <View style={{ flexDirection: "row" as const, alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F4FA" }}>
              <Feather name="map-pin" size={14} color="#8B9BB4" />
              <Text style={{ fontSize: 12, color: "#6B7896", flex: 1 }}>{t("nouveau_dossier.recap_territoire")}</Text>
              <Text style={{ fontSize: 13, color: "#0D1F3C", fontWeight: "600" as const }}>{submittedData.territoire}</Text>
            </View>
            <View style={{ flexDirection: "row" as const, alignItems: "center", gap: 10, paddingVertical: 8 }}>
              <Feather name="dollar-sign" size={14} color="#8B9BB4" />
              <Text style={{ fontSize: 12, color: "#6B7896", flex: 1 }}>{t("nouveau_dossier.recap_montant")}</Text>
              <Text style={{ fontSize: 16, color: "#B5872A", fontWeight: "800" as const }}>{submittedData.montant}</Text>
            </View>
          </View>

          <View style={{ backgroundColor: "#EFF6FF", borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#BFDBFE" }}>
            <View style={{ flexDirection: "row" as const, alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Feather name="info" size={14} color="#2563EB" />
              <Text style={{ fontSize: 13, fontWeight: "700" as const, color: "#1E40AF" }}>{t("nouveau_dossier.next_step")}</Text>
            </View>
            <Text style={{ fontSize: 13, color: "#1E40AF", lineHeight: 19 }}>
              {t("nouveau_dossier.next_step_text")}
            </Text>
          </View>

          <View style={{ backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#FECACA", flexDirection: "row" as const, gap: 8, alignItems: "flex-start" }}>
            <Feather name="alert-triangle" size={13} color="#DC2626" />
            <Text style={{ fontSize: 12, color: "#991B1B", flex: 1, lineHeight: 17 }}>
              {t("nouveau_dossier.warning")}
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <TouchableOpacity
            style={[styles.btnPrimary, { flex: 1 }]}
            onPress={() => router.replace("/(tabs)/dossier")}
          >
            <Feather name="folder" size={16} color="#FFF" />
            <Text style={styles.btnPrimaryText}>{t("nouveau_dossier.btn_access_dossier")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: topPad }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t("nouveau_dossier.header_title")}</Text>
          <Text style={styles.headerSub}>{STEP_TITLES[step]}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepsContainer}>
        <StepIndicator current={step} total={STEP_TITLES.length} />
        <Text style={styles.stepLabel}>{t("nouveau_dossier.step_label", { current: step + 1, total: STEP_TITLES.length, title: STEP_TITLES[step] })}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ═══ STEP 0 — Projet ═══ */}
        {step === 0 && (
          <>
            <View style={styles.card}>
              <SectionTitle title={t("nouveau_dossier.section_project_info")} />

              <FieldLabel text={t("nouveau_dossier.field_titre")} required />
              <TextInput
                style={styles.input}
                value={form.titre}
                onChangeText={(v) => set("titre", v)}
                placeholder={t("nouveau_dossier.placeholder_titre")}
                placeholderTextColor="#B0BAD0"
                maxLength={120}
              />

              <FieldLabel text={t("nouveau_dossier.field_description")} />
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.description}
                onChangeText={(v) => set("description", v)}
                placeholder={t("nouveau_dossier.placeholder_desc")}
                placeholderTextColor="#B0BAD0"
                multiline
                numberOfLines={5}
                maxLength={2000}
                textAlignVertical="top"
              />

              <FieldLabel text={t("nouveau_dossier.field_secteur")} required />
              <View style={styles.chips}>
                {SECTEURS.map(({ key, value }) => (
                  <Chip key={key} label={t(`nouveau_dossier.${key}`)} active={form.secteur === value} onPress={() => set("secteur", value)} />
                ))}
              </View>
            </View>

            <View style={styles.infoCard}>
              <Feather name="map-pin" size={14} color="#B5872A" />
              <Text style={styles.infoText}>
                {t("nouveau_dossier.territoire_info", { territoire: user?.territoire })}
              </Text>
            </View>
          </>
        )}

        {/* ═══ STEP 1 — Financement ═══ */}
        {step === 1 && (
          <>
            <View style={styles.card}>
              <SectionTitle title={t("nouveau_dossier.section_dispositif")} />
              <FieldLabel text={t("nouveau_dossier.field_dispositif")} required />
              <View style={styles.chips}>
                {DISPOSITIFS.map((d) => (
                  <Chip key={d} label={d} active={form.dispositif === d} onPress={() => set("dispositif", d)} />
                ))}
                {DISPOSITIFS.length === 0 && (
                  <Text style={{ color: "#6B7896", fontSize: 13, fontStyle: "italic" as const }}>
                    {t("nouveau_dossier.territoire_info", { territoire: userTerritoire || "—" })}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.card}>
              <SectionTitle title={t("nouveau_dossier.section_montants")} />

              <FieldLabel text={t("nouveau_dossier.field_montant")} required />
              <TextInput
                style={styles.input}
                value={form.montantDemande}
                onChangeText={(v) => set("montantDemande", v.replace(/[^0-9]/g, ""))}
                placeholder={t("nouveau_dossier.placeholder_montant")}
                placeholderTextColor="#B0BAD0"
                keyboardType="numeric"
              />
              {form.montantDemande ? (
                <Text style={styles.montantPreview}>{formatMontant(form.montantDemande)}</Text>
              ) : null}

              <FieldLabel text={t("nouveau_dossier.field_apport")} />
              <TextInput
                style={styles.input}
                value={form.montantApport}
                onChangeText={(v) => set("montantApport", v.replace(/[^0-9]/g, ""))}
                placeholder={t("nouveau_dossier.placeholder_apport")}
                placeholderTextColor="#B0BAD0"
                keyboardType="numeric"
              />

              <FieldLabel text={t("nouveau_dossier.field_justification")} />
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.justificationBudget}
                onChangeText={(v) => set("justificationBudget", v)}
                placeholder={t("nouveau_dossier.placeholder_desc")}
                placeholderTextColor="#B0BAD0"
                multiline
                numberOfLines={4}
                maxLength={1000}
                textAlignVertical="top"
              />
            </View>
          </>
        )}

        {/* ═══ STEP 2 — Calendrier ═══ */}
        {step === 2 && (
          <View style={styles.card}>
            <SectionTitle title={t("nouveau_dossier.section_calendrier")} />

            <View style={styles.infoCardFlat}>
              <Feather name="info" size={14} color="#2563EB" />
              <Text style={styles.infoFlatText}>{t("nouveau_dossier.calendar_info")}</Text>
            </View>

            <FieldLabel text={t("nouveau_dossier.field_date_debut")} />
            <TextInput
              style={styles.input}
              value={form.dateDebut}
              onChangeText={(v) => set("dateDebut", v)}
              placeholder={t("nouveau_dossier.placeholder_date")}
              placeholderTextColor="#B0BAD0"
            />

            <FieldLabel text={t("nouveau_dossier.field_duree")} />
            <View style={styles.chips}>
              {DUREES.map((d) => (
                <Chip key={d} label={d} active={form.dureeProjet === d} onPress={() => set("dureeProjet", d)} />
              ))}
            </View>

            {form.dureeProjet === t("nouveau_dossier.duree_plus") && (
              <>
                <FieldLabel text={t("nouveau_dossier.field_duree_custom")} />
                <TextInput
                  style={styles.input}
                  value={form.dureeProjet === t("nouveau_dossier.duree_plus") ? "" : form.dureeProjet}
                  onChangeText={(v) => set("dureeProjet", v)}
                  placeholder={t("nouveau_dossier.placeholder_duree_custom")}
                  placeholderTextColor="#B0BAD0"
                />
              </>
            )}
          </View>
        )}

        {/* ═══ STEP 3 — Récapitulatif ═══ */}
        {step === 3 && (
          <>
            <View style={styles.card}>
              <SectionTitle title={t("nouveau_dossier.recap_title")} />

              <RecapRow icon="file-text" label={t("nouveau_dossier.recap_titre")} value={form.titre} />
              <RecapRow icon="map-pin" label={t("nouveau_dossier.recap_territoire")} value={user?.territoire ?? "—"} />
              <RecapRow icon="briefcase" label={t("nouveau_dossier.recap_secteur")} value={form.secteur} />
              <RecapRow icon="tag" label={t("nouveau_dossier.recap_dispositif")} value={form.dispositif} />
              <RecapRow icon="dollar-sign" label={t("nouveau_dossier.recap_montant")} value={formatMontant(form.montantDemande)} highlight />
              {form.montantApport && (
                <RecapRow icon="trending-up" label={t("nouveau_dossier.recap_apport")} value={formatMontant(form.montantApport)} />
              )}
              {form.dateDebut && <RecapRow icon="calendar" label={t("nouveau_dossier.recap_demarrage")} value={form.dateDebut} />}
              {form.dureeProjet && <RecapRow icon="clock" label={t("nouveau_dossier.recap_duree")} value={form.dureeProjet} />}
              {form.description && (
                <View style={styles.recapDesc}>
                  <Text style={styles.recapLabel}>{t("nouveau_dossier.recap_description")}</Text>
                  <Text style={styles.recapDescText}>{form.description}</Text>
                </View>
              )}
            </View>

            <View style={styles.fraisCard}>
              <View style={styles.fraisHeader}>
                <Feather name="shield" size={15} color="#B5872A" />
                <Text style={styles.fraisTitle}>{t("nouveau_dossier.frais_recap_title")}</Text>
              </View>
              <Text style={styles.fraisText}>{t("nouveau_dossier.frais_recap_text")}</Text>
              <Text style={styles.fraisLegal}>{t("nouveau_dossier.frais_legal")}</Text>
            </View>

            <View style={styles.scamCard}>
              <Feather name="alert-triangle" size={14} color="#DC2626" />
              <Text style={styles.scamText}>{t("nouveau_dossier.scam_warning")}</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        {step > 0 && (
          <TouchableOpacity style={styles.btnSecondary} onPress={goBack}>
            <Feather name="arrow-left" size={16} color="#0D1F3C" />
            <Text style={styles.btnSecondaryText}>{t("nouveau_dossier.btn_back")}</Text>
          </TouchableOpacity>
        )}
        {step < STEP_TITLES.length - 1 ? (
          <TouchableOpacity style={[styles.btnPrimary, step > 0 && { flex: 1 }]} onPress={goNext}>
            <Text style={styles.btnPrimaryText}>{t("nouveau_dossier.btn_next")}</Text>
            <Feather name="arrow-right" size={16} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnSubmit, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Feather name="send" size={16} color="#FFF" />
            <Text style={styles.btnSubmitText}>{loading ? t("nouveau_dossier.btn_loading") : t("nouveau_dossier.btn_submit")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F4FA" },
  header: {
    backgroundColor: "#0D1F3C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" as const, textAlign: "center" },
  headerSub: { color: "rgba(255,255,255,0.5)", fontSize: 11, textAlign: "center", marginTop: 1 },
  stepsContainer: { backgroundColor: "#0D1F3C", paddingHorizontal: 20, paddingBottom: 16, alignItems: "center", gap: 8 },
  steps: { flexDirection: "row", alignItems: "center" },
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  stepActive: { backgroundColor: "#B5872A" },
  stepDone: { backgroundColor: "#16A34A" },
  stepNum: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700" as const },
  stepNumActive: { color: "#FFF" },
  stepLine: { width: 40, height: 2, backgroundColor: "rgba(255,255,255,0.15)", marginHorizontal: 4 },
  stepLineDone: { backgroundColor: "#16A34A" },
  stepLabel: { color: "rgba(255,255,255,0.55)", fontSize: 11 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  card: { backgroundColor: "#FFF", borderRadius: 18, padding: 18, shadowColor: "#0D1F3C", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 13, fontWeight: "700" as const, color: "#0D1F3C", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: "700" as const, color: "#6B7896", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 7, marginTop: 12 },
  required: { color: "#DC2626" },
  input: {
    borderWidth: 1.5,
    borderColor: "#DDE2EC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#0D1F3C",
    backgroundColor: "#F8F9FC",
  },
  textarea: { height: 110, textAlignVertical: "top", paddingTop: 11 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, borderWidth: 1.5, borderColor: "#DDE2EC", backgroundColor: "#F8F9FC" },
  chipActive: { borderColor: "#0D1F3C", backgroundColor: "#0D1F3C" },
  chipText: { fontSize: 12, color: "#4B5574", fontWeight: "600" as const },
  chipTextActive: { color: "#FFF" },
  montantPreview: { fontSize: 11, color: "#B5872A", fontWeight: "700" as const, marginTop: 5, marginLeft: 4 },
  infoCard: { flexDirection: "row", gap: 8, backgroundColor: "rgba(181,135,42,0.08)", borderRadius: 12, padding: 12, alignItems: "center" },
  infoText: { fontSize: 12, color: "#92400E", flex: 1 },
  infoCardFlat: { flexDirection: "row", gap: 8, backgroundColor: "#EFF6FF", borderRadius: 12, padding: 12, marginBottom: 14, alignItems: "flex-start" },
  infoFlatText: { fontSize: 12, color: "#1E40AF", flex: 1, lineHeight: 17 },
  recapRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F4FA" },
  recapLabel: { fontSize: 12, color: "#6B7896", flex: 1 },
  recapValue: { fontSize: 13, color: "#0D1F3C", fontWeight: "600" as const, maxWidth: 180, textAlign: "right" },
  recapValueHighlight: { color: "#B5872A", fontSize: 15, fontWeight: "800" as const },
  recapDesc: { marginTop: 10 },
  recapDescText: { fontSize: 13, color: "#4B5574", lineHeight: 19, marginTop: 4 },
  fraisCard: { backgroundColor: "#FFF8F0", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#F0D9A8" },
  fraisHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  fraisTitle: { fontSize: 13, fontWeight: "700" as const, color: "#92400E" },
  fraisText: { fontSize: 12, color: "#92400E", lineHeight: 18 },
  fraisLegal: { fontSize: 10, color: "#B45309", marginTop: 6, fontStyle: "italic" },
  scamCard: { flexDirection: "row", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12, alignItems: "flex-start", borderWidth: 1, borderColor: "#FECACA" },
  scamText: { fontSize: 12, color: "#991B1B", flex: 1, lineHeight: 17 },
  footer: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#DDE2EC",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  btnSecondary: {
    flexDirection: "row", alignItems: "center", gap: 6,
    height: 52, paddingHorizontal: 18, borderRadius: 14,
    borderWidth: 1.5, borderColor: "#DDE2EC", backgroundColor: "#F8F9FC",
  },
  btnSecondaryText: { fontSize: 14, fontWeight: "600" as const, color: "#0D1F3C" },
  btnPrimary: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    height: 52, borderRadius: 14, backgroundColor: "#0D1F3C",
  },
  btnPrimaryText: { fontSize: 15, fontWeight: "700" as const, color: "#FFF" },
  btnSubmit: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    height: 52, borderRadius: 14, backgroundColor: "#B5872A",
  },
  btnSubmitText: { fontSize: 15, fontWeight: "700" as const, color: "#FFF" },
});
