import React, { useState } from "react";
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View, ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { CSLogo } from "@/components/CSLogo";

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // If pendingVerification is set, _layout.tsx will redirect automatically
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message ?? "Identifiants incorrects. Vérifiez votre email et mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#060F1E", "#0D1F3C", "#162B52"]} locations={[0, 0.55, 1]} style={styles.root}>
      <View style={styles.decor1} />
      <View style={styles.decor2} />
      <View style={styles.decor3} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <CSLogo size={72} />
            <Text style={styles.brand}>CapSubvention</Text>
            <View style={styles.taglineRow}>
              <View style={styles.taglineDot} />
              <Text style={styles.tagline}>Financements non remboursables · Outre-Mer</Text>
              <View style={styles.taglineDot} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connexion à votre espace</Text>
            <Text style={styles.cardSub}>
              Accédez à votre dossier de financement et suivez l'avancement de votre demande.
            </Text>

            {!!error && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Adresse e-mail</Text>
              <View style={[styles.inputWrap, email.length > 0 && styles.inputWrapActive]}>
                <Feather name="mail" size={15} color="#8B9BB4" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre@email.com"
                  placeholderTextColor="#B0BAD0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={[styles.inputWrap, password.length > 0 && styles.inputWrapActive]}>
                <Feather name="lock" size={15} color="#8B9BB4" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#B0BAD0"
                  secureTextEntry={!showPwd}
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                  <Feather name={showPwd ? "eye-off" : "eye"} size={15} color="#8B9BB4" />
                </TouchableOpacity>
              </View>
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={["#1A3561", "#0D1F3C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnGrad}>
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.btnText}>Se connecter</Text>
                    <Feather name="arrow-right" size={16} color="#B5872A" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.divider} />
            </View>

            <Link href="/(auth)/register" asChild>
              <TouchableOpacity style={styles.registerBtn} activeOpacity={0.8}>
                <Text style={styles.registerBtnText}>Créer mon compte gratuitement</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerBadge}>
              <Feather name="shield" size={11} color="#B5872A" />
              <Text style={styles.footerText}>Accès sécurisé · Article L1611-2 CGCT</Text>
            </View>
            <Text style={styles.footerLegal}>Données chiffrées RGPD · Hébergement France</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  decor1: { position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: "#B5872A", opacity: 0.06 },
  decor2: { position: "absolute", bottom: 60, left: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: "#1A3561", opacity: 0.5, borderWidth: 1, borderColor: "rgba(181,135,42,0.15)" },
  decor3: { position: "absolute", top: "40%", right: -60, width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: "rgba(181,135,42,0.1)" },
  scroll: { flexGrow: 1, paddingHorizontal: 22 },
  header: { alignItems: "center", marginBottom: 32 },
  brand: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginTop: 16, letterSpacing: -0.5 },
  taglineRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  taglineDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#B5872A", opacity: 0.7 },
  tagline: { color: "rgba(255,255,255,0.45)", fontSize: 11, textAlign: "center" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 26, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 12 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#0D1F3C", marginBottom: 6 },
  cardSub: { fontSize: 13, color: "#6B7896", lineHeight: 19, marginBottom: 20 },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "#FECACA" },
  errorText: { flex: 1, fontSize: 12, color: "#DC2626", lineHeight: 17 },
  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: "700", color: "#4B5574", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.6 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#DDE2EC", borderRadius: 13, backgroundColor: "#F8F9FC", paddingHorizontal: 12 },
  inputWrapActive: { borderColor: "#B5872A", backgroundColor: "#FFFDF8" },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: "#0D1F3C" },
  eyeBtn: { padding: 6 },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 4, marginTop: -6, paddingVertical: 4 },
  forgotText: { fontSize: 12, color: "#6B7896", fontWeight: "600" },
  btn: { borderRadius: 14, overflow: "hidden", marginTop: 6, marginBottom: 16 },
  btnDisabled: { opacity: 0.6 },
  btnGrad: { height: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 20 },
  btnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: "#EEF0F7" },
  dividerText: { fontSize: 12, color: "#B0BAD0" },
  registerBtn: { height: 50, borderRadius: 13, borderWidth: 1.5, borderColor: "#DDE2EC", alignItems: "center", justifyContent: "center", backgroundColor: "#F8F9FC" },
  registerBtnText: { fontSize: 14, fontWeight: "600", color: "#0D1F3C" },
  footer: { alignItems: "center", marginTop: 24, gap: 6 },
  footerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(181,135,42,0.12)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(181,135,42,0.25)" },
  footerText: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  footerLegal: { color: "rgba(255,255,255,0.22)", fontSize: 10 },
});
