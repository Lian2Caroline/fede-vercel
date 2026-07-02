import React, { useState } from "react";
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CSLogo } from "@/components/CSLogo";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isStrong = password.length >= 8;
  const passwordsMatch = password === confirm;

  const handleSubmit = async () => {
    if (!isStrong || !passwordsMatch || !token) return;
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message ?? t("reset_password.error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#060F1E", "#0D1F3C", "#162B52"]} locations={[0, 0.55, 1]} style={styles.root}>
      <View style={styles.decor1} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <CSLogo size={56} />
            <Text style={styles.brand}>FEDE</Text>
          </View>

          <View style={styles.card}>
            {success ? (
              <View style={styles.successBox}>
                <View style={styles.successIcon}>
                  <Feather name="check-circle" size={32} color="#16A34A" />
                </View>
                <Text style={styles.successTitle}>{t("reset_password.success_title")}</Text>
                <Text style={styles.successText}>{t("reset_password.success_text")}</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace("/(auth)/login")}>
                  <Text style={styles.loginBtnText}>{t("reset_password.btn_login")}</Text>
                </TouchableOpacity>
              </View>
            ) : !token ? (
              <View style={styles.successBox}>
                <Feather name="alert-circle" size={40} color="#DC2626" style={{ marginBottom: 12 }} />
                <Text style={styles.successTitle}>{t("reset_password.invalid_title")}</Text>
                <Text style={styles.successText}>{t("reset_password.invalid_text")}</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace("/(auth)/forgot-password")}>
                  <Text style={styles.loginBtnText}>{t("reset_password.btn_new_link")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.cardTitle}>{t("reset_password.title")}</Text>
                <Text style={styles.cardSub}>{t("reset_password.sub")}</Text>

                {!!error && (
                  <View style={styles.errorBox}>
                    <Feather name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.field}>
                  <Text style={styles.label}>{t("reset_password.label_new_pwd")}</Text>
                  <View style={[styles.inputWrap, password.length > 0 && styles.inputWrapActive]}>
                    <Feather name="lock" size={15} color="#8B9BB4" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#B0BAD0"
                      secureTextEntry={!showPwd}
                      returnKeyType="next"
                    />
                    <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                      <Feather name={showPwd ? "eye-off" : "eye"} size={16} color="#8B9BB4" />
                    </TouchableOpacity>
                  </View>
                  {password.length > 0 && !isStrong && (
                    <Text style={styles.hint}>{t("reset_password.hint_min")}</Text>
                  )}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>{t("reset_password.label_confirm_pwd")}</Text>
                  <View style={[styles.inputWrap, confirm.length > 0 && styles.inputWrapActive]}>
                    <Feather name="lock" size={15} color="#8B9BB4" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={confirm}
                      onChangeText={setConfirm}
                      placeholder="••••••••"
                      placeholderTextColor="#B0BAD0"
                      secureTextEntry={!showConfirm}
                      returnKeyType="send"
                      onSubmitEditing={handleSubmit}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                      <Feather name={showConfirm ? "eye-off" : "eye"} size={16} color="#8B9BB4" />
                    </TouchableOpacity>
                  </View>
                  {confirm.length > 0 && !passwordsMatch && (
                    <Text style={styles.hint}>{t("reset_password.hint_mismatch")}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.btn, (!isStrong || !passwordsMatch || loading) && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={!isStrong || !passwordsMatch || loading}
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
                        <Feather name="check" size={16} color="#fff" />
                        <Text style={styles.btnText}>{t("reset_password.btn_reset")}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  decor1: { position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: "#B5872A", opacity: 0.06 },
  scroll: { flexGrow: 1, paddingHorizontal: 22 },
  header: { alignItems: "center", marginBottom: 28, marginTop: 16 },
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
  eyeBtn: { padding: 6 },
  hint: { fontSize: 11, color: "#DC2626", marginTop: 5 },
  btn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnGrad: { height: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  successBox: { alignItems: "center", paddingVertical: 8 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: "800", color: "#0D1F3C", marginBottom: 10 },
  successText: { fontSize: 13, color: "#6B7896", lineHeight: 20, textAlign: "center", marginBottom: 20 },
  loginBtn: { width: "100%", height: 50, borderRadius: 13, backgroundColor: "#0D1F3C", alignItems: "center", justifyContent: "center" },
  loginBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
