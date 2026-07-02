import React, { useState } from "react";
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CSLogo } from "@/components/CSLogo";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message ?? t("forgot_password.error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#060F1E", "#0D1F3C", "#162B52"]} locations={[0, 0.55, 1]} style={styles.root}>
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.6)" />
            <Text style={styles.backText}>{t("forgot_password.back")}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <CSLogo size={56} />
            <Text style={styles.brand}>FEDE</Text>
          </View>

          <View style={styles.card}>
            {sent ? (
              <View style={styles.successBox}>
                <View style={styles.successIcon}>
                  <Feather name="check-circle" size={32} color="#16A34A" />
                </View>
                <Text style={styles.successTitle}>{t("forgot_password.success_title")}</Text>
                <Text style={styles.successText}>
                  {t("forgot_password.success_text", { email })}
                </Text>
                <TouchableOpacity style={styles.backToLogin} onPress={() => router.replace("/(auth)/login")}>
                  <Text style={styles.backToLoginText}>{t("forgot_password.btn_back_login")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.cardTitle}>{t("forgot_password.title")}</Text>
                <Text style={styles.cardSub}>{t("forgot_password.sub")}</Text>

                {!!error && (
                  <View style={styles.errorBox}>
                    <Feather name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.field}>
                  <Text style={styles.label}>{t("forgot_password.label_email")}</Text>
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
                      returnKeyType="send"
                      onSubmitEditing={handleSubmit}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.btn, (!email.trim() || loading) && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={!email.trim() || loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#1A3561", "#0D1F3C"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.btnGrad}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Feather name="send" size={16} color="#fff" />
                        <Text style={styles.btnText}>{t("forgot_password.btn_send")}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.footerBadge}>
              <Feather name="shield" size={11} color="#B5872A" />
              <Text style={styles.footerText}>{t("forgot_password.footer")}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  decor1: { position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: "#B5872A", opacity: 0.06 },
  decor2: { position: "absolute", bottom: 60, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: "#1A3561", opacity: 0.4 },
  scroll: { flexGrow: 1, paddingHorizontal: 22 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  backText: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  header: { alignItems: "center", marginBottom: 28 },
  brand: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginTop: 12, letterSpacing: -0.5 },
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
  btn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnGrad: { height: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  successBox: { alignItems: "center", paddingVertical: 8 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: "800", color: "#0D1F3C", marginBottom: 10 },
  successText: { fontSize: 13, color: "#6B7896", lineHeight: 20, textAlign: "center", marginBottom: 20 },
  backToLogin: { width: "100%", height: 50, borderRadius: 13, backgroundColor: "#0D1F3C", alignItems: "center", justifyContent: "center" },
  backToLoginText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  footer: { alignItems: "center", marginTop: 24 },
  footerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(181,135,42,0.12)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(181,135,42,0.25)" },
  footerText: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
});
