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

const DISPOSITIFS = [
  "FEADER — Développement rural",
  "FEDER — Développement régional",
  "FSE+ — Fonds social européen",
  "REACT-EU — Relance économique",
  "Aide à l'investissement territorial",
  "Soutien à la création d'emplois",
  "Subvention recherche & innovation",
  "Programme Outre-Mer POSEI",
];

const SECTEURS = [
  "Agriculture / Pêche",
  "Artisanat / Commerce",
  "BTP / Construction",
  "Culture / Tourisme",
  "Éducation / Formation",
  "Environnement / Énergie",
  "Industrie / Transformation",
  "Numérique / Innovation",
  "Santé / Social",
  "Transport / Logistique",
];

const STEP_TITLES = [
  "Votre projet",
  "Financement",
  "Calendrier",
  "Récapitulatif",
];

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

export default function NouveauDossierScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

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
      if (!form.titre.trim()) { Alert.alert("Champ requis", "Le titre du projet est obligatoire."); return false; }
      if (!form.secteur) { Alert.alert("Champ requis", "Sélectionnez un secteur d'activité."); return false; }
    }
    if (step === 1) {
      if (!form.dispositif) { Alert.alert("Champ requis", "Sélectionnez un dispositif de financement."); return false; }
      if (!form.montantDemande || isNaN(Number(form.montantDemande))) { Alert.alert("Champ requis", "Entrez le montant demandé."); return false; }
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
          territoire: user?.territoire ?? "Non précisé",
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
      Alert.alert(
        "Dossier créé !",
        "Votre dossier a été créé avec succès. Vous pouvez maintenant compléter vos pièces justificatives dans l'onglet Dossier.",
        [{ text: "Voir mon dossier", onPress: () => router.replace("/(tabs)/dossier") }]
      );
    } catch (e: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erreur", e.message ?? "Impossible de créer le dossier.");
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (v: string) => {
    const n = Number(v);
    if (isNaN(n) || !v) return "—";
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  };

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
          <Text style={styles.headerTitle}>Nouvelle demande</Text>
          <Text style={styles.headerSub}>{STEP_TITLES[step]}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepsContainer}>
        <StepIndicator current={step} total={STEP_TITLES.length} />
        <Text style={styles.stepLabel}>Étape {step + 1} / {STEP_TITLES.length} — {STEP_TITLES[step]}</Text>
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
              <SectionTitle title="Informations du projet" />

              <FieldLabel text="Titre du projet" required />
              <TextInput
                style={styles.input}
                value={form.titre}
                onChangeText={(v) => set("titre", v)}
                placeholder="Ex : Création d'une unité de transformation agroalimentaire"
                placeholderTextColor="#B0BAD0"
                maxLength={120}
              />

              <FieldLabel text="Description du projet" />
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.description}
                onChangeText={(v) => set("description", v)}
                placeholder="Décrivez votre projet, ses objectifs et son impact attendu sur votre territoire..."
                placeholderTextColor="#B0BAD0"
                multiline
                numberOfLines={5}
                maxLength={2000}
                textAlignVertical="top"
              />

              <FieldLabel text="Secteur d'activité" required />
              <View style={styles.chips}>
                {SECTEURS.map((s) => (
                  <Chip key={s} label={s} active={form.secteur === s} onPress={() => set("secteur", s)} />
                ))}
              </View>
            </View>

            <View style={styles.infoCard}>
              <Feather name="map-pin" size={14} color="#B5872A" />
              <Text style={styles.infoText}>
                Territoire associé à votre compte : <Text style={styles.infoBold}>{user?.territoire}</Text>
              </Text>
            </View>
          </>
        )}

        {/* ═══ STEP 1 — Financement ═══ */}
        {step === 1 && (
          <>
            <View style={styles.card}>
              <SectionTitle title="Dispositif de financement" />
              <FieldLabel text="Choisir le dispositif" required />
              <View style={styles.chips}>
                {DISPOSITIFS.map((d) => (
                  <Chip key={d} label={d} active={form.dispositif === d} onPress={() => set("dispositif", d)} />
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <SectionTitle title="Montants" />

              <FieldLabel text="Montant de la subvention demandée (€)" required />
              <TextInput
                style={styles.input}
                value={form.montantDemande}
                onChangeText={(v) => set("montantDemande", v.replace(/[^0-9]/g, ""))}
                placeholder="Ex : 50000"
                placeholderTextColor="#B0BAD0"
                keyboardType="numeric"
              />
              {form.montantDemande ? (
                <Text style={styles.montantPreview}>{formatMontant(form.montantDemande)}</Text>
              ) : null}

              <FieldLabel text="Apport propre (€) — facultatif" />
              <TextInput
                style={styles.input}
                value={form.montantApport}
                onChangeText={(v) => set("montantApport", v.replace(/[^0-9]/g, ""))}
                placeholder="Ex : 10000"
                placeholderTextColor="#B0BAD0"
                keyboardType="numeric"
              />

              <FieldLabel text="Justification budgétaire" />
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.justificationBudget}
                onChangeText={(v) => set("justificationBudget", v)}
                placeholder="Expliquez l'utilisation des fonds demandés et la cohérence de votre budget..."
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
            <SectionTitle title="Calendrier du projet" />

            <View style={styles.infoCardFlat}>
              <Feather name="info" size={14} color="#2563EB" />
              <Text style={styles.infoFlatText}>
                Ces informations sont indicatives. Votre conseiller pourra vous aider à affiner votre calendrier lors de l'instruction.
              </Text>
            </View>

            <FieldLabel text="Date de démarrage prévue" />
            <TextInput
              style={styles.input}
              value={form.dateDebut}
              onChangeText={(v) => set("dateDebut", v)}
              placeholder="Ex : 01/09/2025 ou T3 2025"
              placeholderTextColor="#B0BAD0"
            />

            <FieldLabel text="Durée du projet" />
            <View style={styles.chips}>
              {["6 mois", "12 mois", "18 mois", "24 mois", "36 mois", "Plus de 36 mois"].map((d) => (
                <Chip key={d} label={d} active={form.dureeProjet === d} onPress={() => set("dureeProjet", d)} />
              ))}
            </View>

            {form.dureeProjet === "Plus de 36 mois" && (
              <>
                <FieldLabel text="Précisez la durée" />
                <TextInput
                  style={styles.input}
                  value={form.dureeProjet === "Plus de 36 mois" ? "" : form.dureeProjet}
                  onChangeText={(v) => set("dureeProjet", v)}
                  placeholder="Ex : 48 mois"
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
              <SectionTitle title="Récapitulatif de votre demande" />

              <RecapRow icon="file-text" label="Titre" value={form.titre} />
              <RecapRow icon="map-pin" label="Territoire" value={user?.territoire ?? "—"} />
              <RecapRow icon="briefcase" label="Secteur" value={form.secteur} />
              <RecapRow icon="tag" label="Dispositif" value={form.dispositif} />
              <RecapRow icon="dollar-sign" label="Montant demandé" value={formatMontant(form.montantDemande)} highlight />
              {form.montantApport && (
                <RecapRow icon="trending-up" label="Apport propre" value={formatMontant(form.montantApport)} />
              )}
              {form.dateDebut && <RecapRow icon="calendar" label="Démarrage" value={form.dateDebut} />}
              {form.dureeProjet && <RecapRow icon="clock" label="Durée" value={form.dureeProjet} />}
              {form.description && (
                <View style={styles.recapDesc}>
                  <Text style={styles.recapLabel}>Description</Text>
                  <Text style={styles.recapDescText}>{form.description}</Text>
                </View>
              )}
            </View>

            <View style={styles.fraisCard}>
              <View style={styles.fraisHeader}>
                <Feather name="shield" size={15} color="#B5872A" />
                <Text style={styles.fraisTitle}>Frais d'instruction</Text>
              </View>
              <Text style={styles.fraisText}>
                Les frais d'instruction (<Text style={{ fontWeight: "700" as const }}>456 € TTC</Text>) ne seront exigibles qu'après confirmation officielle de l'obtention de votre subvention par l'organisme compétent. Ils ne constituent pas une avance et ne sont jamais demandés à l'avance.
              </Text>
              <Text style={styles.fraisLegal}>Article L1611-2 CGCT</Text>
            </View>

            <View style={styles.scamCard}>
              <Feather name="alert-triangle" size={14} color="#DC2626" />
              <Text style={styles.scamText}>
                Ne versez jamais d'argent avant d'avoir reçu une notification officielle écrite. Signalez tout contact suspect à support@capsubvention.fr
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        {step > 0 && (
          <TouchableOpacity style={styles.btnSecondary} onPress={goBack}>
            <Feather name="arrow-left" size={16} color="#0D1F3C" />
            <Text style={styles.btnSecondaryText}>Retour</Text>
          </TouchableOpacity>
        )}
        {step < STEP_TITLES.length - 1 ? (
          <TouchableOpacity style={[styles.btnPrimary, step > 0 && { flex: 1 }]} onPress={goNext}>
            <Text style={styles.btnPrimaryText}>Continuer</Text>
            <Feather name="arrow-right" size={16} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnSubmit, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Feather name="send" size={16} color="#FFF" />
            <Text style={styles.btnSubmitText}>{loading ? "Création en cours…" : "Soumettre ma demande"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
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
  infoBold: { fontWeight: "700" as const },
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DDE2EC",
    backgroundColor: "#F8F9FC",
  },
  btnSecondaryText: { color: "#0D1F3C", fontSize: 14, fontWeight: "600" as const },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#0D1F3C",
  },
  btnPrimaryText: { color: "#FFF", fontSize: 15, fontWeight: "700" as const },
  btnSubmit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#B5872A",
  },
  btnSubmitText: { color: "#FFF", fontSize: 15, fontWeight: "700" as const },
});
