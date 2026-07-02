import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { CSLogo } from "@/components/CSLogo";

const TERRITORIES = [
  "Martinique", "Guadeloupe", "La Réunion", "Nouvelle-Calédonie", "Polynésie française",
];

const TYPES_PORTEUR = [
  { value: "particulier", label: "Particulier / Micro-entrepreneur" },
  { value: "entreprise", label: "Entreprise / PME" },
  { value: "association", label: "Association" },
  { value: "collectivite", label: "Collectivité" },
  { value: "autre", label: "Autre" },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    telephone: "",
    territoire: "",
    typePorteur: "",
    organisation: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!form.prenom || !form.nom || !form.email || !form.password || !form.territoire || !form.typePorteur) {
      setError("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      await register({
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        telephone: form.telephone.trim() || undefined,
        territoire: form.territoire,
        typePorteur: form.typePorteur,
        organisation: form.organisation.trim() || undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message ?? "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#060F1E", "#0D1F3C", "#162B52"]}
      locations={[0, 0.55, 1]}
      style={styles.root}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <CSLogo size={56} />
          <Text style={styles.brand}>Créer votre espace</Text>
          <Text style={styles.tagline}>Inscription gratuite · 100% en ligne · Sans engagement</Text>
        </View>

        <View style={styles.card}>
          {!!error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <View style={styles.row2}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput style={styles.input} value={form.prenom} onChangeText={(v) => set("prenom", v)} placeholder="Jean" placeholderTextColor="#B0BAD0" />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput style={styles.input} value={form.nom} onChangeText={(v) => set("nom", v)} placeholder="Dupont" placeholderTextColor="#B0BAD0" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={form.email} onChangeText={(v) => set("email", v)} placeholder="votre@email.com" placeholderTextColor="#B0BAD0" keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput style={styles.input} value={form.telephone} onChangeText={(v) => set("telephone", v)} placeholder="+596 696 00 00 00" placeholderTextColor="#B0BAD0" keyboardType="phone-pad" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe * (8 caractères min.)</Text>
            <View style={styles.pwdWrap}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                value={form.password}
                onChangeText={(v) => set("password", v)}
                placeholder="••••••••"
                placeholderTextColor="#B0BAD0"
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <Feather name={showPwd ? "eye-off" : "eye"} size={16} color="#8B9BB4" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Votre projet</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Territoire *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <View style={styles.chips}>
                {TERRITORIES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, form.territoire === t && styles.chipActive]}
                    onPress={() => set("territoire", t)}
                  >
                    <Text style={[styles.chipText, form.territoire === t && styles.chipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Type de porteur *</Text>
            <View style={styles.chips}>
              {TYPES_PORTEUR.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.chip, form.typePorteur === t.value && styles.chipActive]}
                  onPress={() => set("typePorteur", t.value)}
                >
                  <Text style={[styles.chipText, form.typePorteur === t.value && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nom de l'organisation (si applicable)</Text>
            <TextInput style={styles.input} value={form.organisation} onChangeText={(v) => set("organisation", v)} placeholder="Nom de votre entreprise / association" placeholderTextColor="#B0BAD0" />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{loading ? "Création du compte…" : "Créer mon compte gratuitement"}</Text>
          </TouchableOpacity>

          <View style={styles.rowCenter}>
            <Text style={styles.hint}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Se connecter</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <Text style={styles.legal}>Inscription gratuite · Article L1611-2 CGCT · Données RGPD</Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20 },
  header: { alignItems: "center", marginBottom: 24 },
  brand: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" as const, marginTop: 12, letterSpacing: -0.5 },
  tagline: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 5, textAlign: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 10,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { flex: 1, fontSize: 12, color: "#DC2626", lineHeight: 17 },
  sectionTitle: { fontSize: 13, fontWeight: "700" as const, color: "#0D1F3C", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 },
  row2: { flexDirection: "row", gap: 12 },
  field: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: "700" as const, color: "#6B7896", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  input: {
    borderWidth: 1.5,
    borderColor: "#DDE2EC",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: "#0D1F3C",
    backgroundColor: "#F8F9FC",
  },
  pwdWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDE2EC",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FC",
  },
  eyeBtn: { padding: 6 },
  chipsScroll: { marginHorizontal: -4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "#DDE2EC",
    backgroundColor: "#F8F9FC",
  },
  chipActive: { borderColor: "#0D1F3C", backgroundColor: "#0D1F3C" },
  chipText: { fontSize: 12, color: "#4B5574", fontWeight: "600" as const },
  chipTextActive: { color: "#FFFFFF" },
  btn: {
    backgroundColor: "#0D1F3C",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" as const },
  rowCenter: { flexDirection: "row", justifyContent: "center" },
  hint: { color: "#6B7896", fontSize: 13 },
  link: { color: "#B5872A", fontSize: 13, fontWeight: "700" as const },
  legal: { color: "rgba(255,255,255,0.25)", fontSize: 10, textAlign: "center", marginTop: 16 },
});
