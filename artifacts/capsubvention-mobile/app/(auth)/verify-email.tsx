import React, { useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { CSLogo } from "@/components/CSLogo";
import { useTranslation } from "react-i18next";

export default function VerifyEmailScreen() {
  const { pendingVerification, verifyEmail, loginWithVerifiedCode, resendVerification, clearPending } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const totalSeconds = pendingVerification?.type === "email" ? 600 : 300;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const codeRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEmail = pendingVerification?.type === "email";

  const startTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((t_) => {
        if (t_ <= 1) { clearInterval(timerRef.current!); return 0; }
        return t_ - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer(totalSeconds);
    setTimeout(() => codeRefs.current[0]?.focus(), 300);
    return () => clearInterval(timerRef.current!);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleDigit = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) submitCode(next.join(""));
  };

  const handleKey = (i: number, key: string) => {
    if (key === "Backspace" && !digits[i] && i > 0) codeRefs.current[i - 1]?.focus();
  };

  const submitCode = async (codeStr?: string) => {
    const fullCode = codeStr ?? digits.join("");
    if (fullCode.length < 6 || !pendingVerification) return;
    setError("");
    setLoading(true);
    try {
      if (isEmail) {
        await verifyEmail(pendingVerification.userId, fullCode);
      } else {
        await loginWithVerifiedCode(pendingVerification.userId, fullCode);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message ?? t("verify_email.error_invalid"));
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingVerification || !isEmail) return;
    setResending(true);
    setError("");
    try {
      await resendVerification(pendingVerification.userId);
      setResent(true);
      startTimer(600);
      setDigits(["", "", "", "", "", ""]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setResent(false), 4000);
    } catch (e: any) {
      setError(e.message ?? t("verify_email.error_invalid"));
    } finally {
      setResending(false);
    }
  };

  const title = isEmail ? t("verify_email.title_email") : t("verify_email.title_ip");
  const subtitle = isEmail
    ? t("verify_email.sub_email", { email: pendingVerification?.email })
    : t("verify_email.sub_ip", { email: pendingVerification?.email });

  return (
    <LinearGradient colors={["#060F1E", "#0D1F3C", "#162B52"]} locations={[0, 0.55, 1]} style={s.root}>
      <View style={s.decor1} />
      <View style={s.decor2} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <CSLogo size={64} />
            <Text style={s.brand}>FEDE</Text>
          </View>

          <View style={s.card}>
            <View style={s.iconWrap}>
              <Feather name={isEmail ? "mail" : "shield"} size={26} color="#0D1F3C" />
            </View>

            <Text style={s.cardTitle}>{title}</Text>
            <Text style={s.cardSub}>{subtitle}</Text>

            <View style={s.timerRow}>
              <View style={[s.timerDot, { backgroundColor: timeLeft > 60 ? "#22C55E" : "#EF4444" }]} />
              <Text style={[s.timerText, timeLeft <= 60 && { color: "#DC2626" }]}>
                {timeLeft > 0
                  ? t("verify_email.timer_valid", { time: formatTime(timeLeft) })
                  : t("verify_email.timer_expired")}
              </Text>
            </View>

            {resent && (
              <View style={s.successBox}>
                <Feather name="check-circle" size={14} color="#16A34A" />
                <Text style={s.successText}>{t("verify_email.success_sent")}</Text>
              </View>
            )}

            {!!error && (
              <View style={s.errorBox}>
                <Feather name="alert-circle" size={14} color="#DC2626" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <View style={s.codeRow}>
              {digits.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(el) => { codeRefs.current[i] = el; }}
                  style={[s.digitInput, d && s.digitInputFilled]}
                  value={d}
                  onChangeText={(v) => handleDigit(i, v)}
                  onKeyPress={({ nativeEvent }) => handleKey(i, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={timeLeft > 0 && !loading}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={[s.btn, (loading || digits.join("").length < 6 || timeLeft === 0) && s.btnDisabled]}
              onPress={() => submitCode()}
              disabled={loading || digits.join("").length < 6 || timeLeft === 0}
              activeOpacity={0.85}
            >
              <LinearGradient colors={["#1A3561", "#0D1F3C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btnGrad}>
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Text style={s.btnText}>{isEmail ? t("verify_email.btn_activate") : t("verify_email.btn_confirm")}</Text>
                    <Feather name="check" size={16} color="#B5872A" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.infoBanner}>
              <Feather name="shield" size={13} color="#B5872A" />
              <Text style={s.infoBannerText}>{t("verify_email.info_spam")}</Text>
            </View>

            {isEmail ? (
              <>
                <TouchableOpacity
                  style={[s.textBtn, (resending || timeLeft > 0) && s.textBtnDisabled]}
                  onPress={handleResend}
                  disabled={resending || timeLeft > 0}
                >
                  <Feather name="refresh-cw" size={12} color={resending || timeLeft > 0 ? "#C8D0E0" : "#8B9BB4"} />
                  <Text style={[s.textBtnLabel, (resending || timeLeft > 0) && { color: "#C8D0E0" }]}>
                    {resending
                      ? t("verify_email.btn_resending")
                      : timeLeft > 0
                        ? t("verify_email.btn_resend_wait", { time: formatTime(timeLeft) })
                        : t("verify_email.btn_resend")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.textBtn, { marginTop: 4 }]} onPress={clearPending}>
                  <Feather name="arrow-left" size={12} color="#8B9BB4" />
                  <Text style={s.textBtnLabel}>{t("verify_email.btn_back")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={s.textBtn} onPress={clearPending}>
                <Feather name="arrow-left" size={12} color="#8B9BB4" />
                <Text style={s.textBtnLabel}>{t("verify_email.btn_back")}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={s.footer}>
            <View style={s.footerBadge}>
              <Feather name="lock" size={11} color="#B5872A" />
              <Text style={s.footerText}>{t("verify_email.footer")}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  decor1: { position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: "#B5872A", opacity: 0.06 },
  decor2: { position: "absolute", bottom: 60, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: "#1A3561", opacity: 0.5, borderWidth: 1, borderColor: "rgba(181,135,42,0.15)" },
  scroll: { flexGrow: 1, paddingHorizontal: 22 },
  header: { alignItems: "center", marginBottom: 28 },
  brand: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginTop: 12, letterSpacing: -0.5 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 26, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 12 },
  iconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: "#F8F9FC", borderWidth: 1.5, borderColor: "#DDE2EC", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 },
  cardTitle: { fontSize: 19, fontWeight: "800", color: "#0D1F3C", marginBottom: 8, textAlign: "center" },
  cardSub: { fontSize: 13, color: "#6B7896", lineHeight: 19, marginBottom: 16, textAlign: "center" },
  timerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16, backgroundColor: "#F8F9FC", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: "#EEF0F7" },
  timerDot: { width: 8, height: 8, borderRadius: 4 },
  timerText: { fontSize: 12, fontWeight: "600", color: "#0D1F3C" },
  successBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0FDF4", borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: "#BBF7D0" },
  successText: { fontSize: 12, color: "#16A34A", fontWeight: "600" },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "#FECACA" },
  errorText: { flex: 1, fontSize: 12, color: "#DC2626", lineHeight: 17 },
  codeRow: { flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 20 },
  digitInput: { width: 42, height: 54, borderWidth: 2, borderColor: "#DDE2EC", borderRadius: 12, backgroundColor: "#F8F9FC", textAlign: "center", fontSize: 22, fontWeight: "800", color: "#0D1F3C" },
  digitInputFilled: { borderColor: "#0D1F3C", backgroundColor: "#F0F4FF" },
  btn: { borderRadius: 14, overflow: "hidden", marginBottom: 16 },
  btnDisabled: { opacity: 0.45 },
  btnGrad: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#FFF8F0", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#F0D9A8", marginBottom: 16 },
  infoBannerText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 17 },
  textBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 4 },
  textBtnDisabled: { opacity: 0.5 },
  textBtnLabel: { fontSize: 13, color: "#8B9BB4" },
  footer: { alignItems: "center", marginTop: 24 },
  footerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(181,135,42,0.12)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(181,135,42,0.25)" },
  footerText: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
});
