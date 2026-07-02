import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface MenuItemProps {
  icon: "shield" | "alert-triangle" | "mail" | "phone" | "info" | "log-out" | "file-text" | "briefcase" | "play-circle";
  label: string;
  sub?: string;
  onPress?: () => void;
  danger?: boolean;
  color?: string;
}

function MenuItem({ icon, label, sub, onPress, danger, color }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? "#FEF2F2" : color ? color + "15" : "#F1F4FA" }]}>
        <Feather name={icon} size={16} color={danger ? "#DC2626" : (color ?? "#0D1F3C")} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: "#DC2626" }]}>{label}</Text>
        {sub && <Text style={styles.menuSub}>{sub}</Text>}
      </View>
      {!danger && <Feather name="chevron-right" size={16} color="#DDE2EC" />}
    </TouchableOpacity>
  );
}

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

const DEFAULT_CONTACT = { telephone: "+33 (0) 800 123 456", email: "support@fede-financement.com", adresse: "Disponible pour toute l'Europe" };

export default function ProfilScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [telephone, setTelephone] = useState(user?.telephone ?? "");
  const [organisation, setOrganisation] = useState(user?.organisation ?? "");
  const [showConditions, setShowConditions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/settings/contact`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setContactInfo({ ...DEFAULT_CONTACT, ...d }); })
      .catch(() => {});
  }, []);

  const TYPE_PORTEUR_LABELS: Record<string, string> = {
    particulier: t("profil.type_particulier"),
    entreprise: t("profil.type_entreprise"),
    association: t("profil.type_association"),
    collectivite: t("profil.type_collectivite"),
    autre: t("profil.type_autre"),
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const initials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : "??";

  const handleLogoutPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfirmLogout(true);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await logout();
    setLoggingOut(false);
    setConfirmLogout(false);
  };

  const handleEditPress = () => {
    setTelephone(user?.telephone ?? "");
    setOrganisation(user?.organisation ?? "");
    setEditing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ telephone: telephone.trim(), organisation: organisation.trim() });
      setEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t("profil.success_profile"), t("profil.success_profile_text"));
    } catch {
      Alert.alert(t("profil.error_profile"), t("profil.error_profile_text"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setTelephone(user?.telephone ?? "");
    setOrganisation(user?.organisation ?? "");
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>{t("profil.nav_title")}</Text>
        {!editing ? (
          <TouchableOpacity style={styles.editBtn} onPress={handleEditPress} activeOpacity={0.8}>
            <Feather name="edit-2" size={14} color="#B5872A" />
            <Text style={styles.editBtnText}>{t("profil.btn_edit")}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
          <Text style={styles.userType}>{TYPE_PORTEUR_LABELS[user?.typePorteur ?? ""] ?? user?.typePorteur}</Text>
          <View style={styles.territoireBadge}>
            <Feather name="map-pin" size={11} color="#B5872A" />
            <Text style={styles.territoireText}>{user?.territoire}</Text>
          </View>
        </View>

        {/* Informations */}
        <Text style={styles.sectionTitle}>{t("profil.section_account")}</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Feather name="mail" size={14} color="#8B9BB4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{t("profil.label_email")}</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Feather name="phone" size={14} color="#8B9BB4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{t("profil.label_phone")}</Text>
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={telephone}
                  onChangeText={setTelephone}
                  placeholder="+596 696 00 00 00"
                  placeholderTextColor="#B0BAD0"
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
              ) : (
                <Text style={styles.infoValue}>{user?.telephone || "—"}</Text>
              )}
            </View>
          </View>

          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Feather name="briefcase" size={14} color="#8B9BB4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{t("profil.label_org")}</Text>
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={organisation}
                  onChangeText={setOrganisation}
                  placeholder={t("profil.placeholder_org")}
                  placeholderTextColor="#B0BAD0"
                  autoCorrect={false}
                />
              ) : (
                <Text style={styles.infoValue}>{user?.organisation || "—"}</Text>
              )}
            </View>
          </View>

          {editing && (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelEditBtn} onPress={handleCancelEdit} activeOpacity={0.7}>
                <Text style={styles.cancelEditText}>{t("profil.btn_cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Feather name="check" size={14} color="#FFF" />
                    <Text style={styles.saveBtnText}>{t("profil.btn_save")}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Video player modal */}
        <VideoPlayerModal
          visible={showVideo}
          url={`${process.env.EXPO_PUBLIC_VIDEO_URL ?? "https://www.fede-financement.com/capsubvention-video/index.html"}?lang=${i18n.language}`}
          onClose={() => setShowVideo(false)}
        />

        {/* Modals */}
        <Modal visible={showConditions} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowConditions(false)}>
          <View style={styles.modalRoot}>
            <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
              <Text style={styles.modalTitle}>{t("profil.modal_conditions_title")}</Text>
              <TouchableOpacity onPress={() => setShowConditions(false)} style={styles.modalClose}>
                <Feather name="x" size={20} color="#0D1F3C" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
              <Text style={styles.modalSub}>{t("profil.cgu_legal_ref")}</Text>
              <Text style={[styles.modalBody, { marginTop: 10 }]}>{t("profil.cgu_intro")}</Text>

              <Text style={[styles.modalBold, { marginTop: 18 }]}>{t("profil.cgu_s1_title")}</Text>
              <Text style={[styles.modalBody, { marginTop: 6 }]}>{t("profil.cgu_s1_body")}</Text>

              <Text style={[styles.modalBold, { marginTop: 18 }]}>{t("profil.cgu_s2_title")}</Text>
              <Text style={[styles.modalBody, { marginTop: 6 }]}>{t("profil.cgu_s2_body")}</Text>

              <Text style={[styles.modalBold, { marginTop: 18 }]}>{t("profil.cgu_s3_title")}</Text>
              <Text style={[styles.modalBody, { marginTop: 6 }]}>{t("profil.cgu_s3_body")} {contactInfo.email}</Text>

              <Text style={[styles.modalBold, { marginTop: 18 }]}>{t("profil.cgu_s4_title")}</Text>
              <Text style={[styles.modalBody, { marginTop: 6 }]}>{t("profil.cgu_s4_body")}</Text>

              <Text style={[styles.modalBold, { marginTop: 18 }]}>{t("profil.cgu_s5_title")}</Text>
              <Text style={[styles.modalBody, { marginTop: 6 }]}>{contactInfo.email}</Text>

              <Text style={[styles.modalBody, { marginTop: 20, color: "#B0BAD0", fontSize: 11 }]}>{t("profil.cgu_version")}</Text>
            </ScrollView>
          </View>
        </Modal>

        <Modal visible={showAbout} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAbout(false)}>
          <View style={styles.modalRoot}>
            <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
              <Text style={styles.modalTitle}>{t("profil.modal_about_title")}</Text>
              <TouchableOpacity onPress={() => setShowAbout(false)} style={styles.modalClose}>
                <Feather name="x" size={20} color="#0D1F3C" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
              <View style={styles.aboutLogoSection}>
                <View style={styles.aboutIconCircle}>
                  <Text style={styles.aboutIconText}>F</Text>
                </View>
                <Text style={styles.aboutAppName}>FEDE</Text>
                <Text style={styles.aboutVersion}>{t("profil.about_version")}</Text>
              </View>

              <View style={styles.aboutCard}>
                {[
                  { icon: "target" as const, label: t("profil.about_mission_label"), value: t("profil.about_mission_value") },
                  { icon: "map-pin" as const, label: t("profil.about_territoires_label"), value: t("profil.about_territoires_value") },
                  { icon: "shield" as const, label: t("profil.about_legal_label"), value: t("profil.about_legal_value") },
                  { icon: "mail" as const, label: t("profil.about_contact_label"), value: contactInfo.email },
                  { icon: "globe" as const, label: t("profil.about_website_label"), value: "fede-financement.com" },
                ].map((item, i) => (
                  <View key={i} style={[styles.aboutRow, i > 0 && { borderTopWidth: 1, borderTopColor: "#F1F4FA" }]}>
                    <View style={styles.aboutRowIcon}>
                      <Feather name={item.icon} size={14} color="#B5872A" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.aboutRowLabel}>{item.label}</Text>
                      <Text style={styles.aboutRowValue}>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.aboutLegal}>{t("profil.about_disclaimer")}</Text>
            </ScrollView>
          </View>
        </Modal>

        {/* Support */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t("profil.section_support")}</Text>
        <View style={styles.card}>
          <MenuItem icon="mail" label={t("profil.menu_contact")} sub={contactInfo.email} color="#0D1F3C" onPress={() => Linking.openURL(`mailto:${contactInfo.email}`)} />
          <View style={styles.divider} />
          <MenuItem icon="file-text" label={t("profil.menu_conditions")} sub={t("profil.menu_conditions_sub")} color="#6B7896" onPress={() => setShowConditions(true)} />
          <View style={styles.divider} />
          <MenuItem icon="play-circle" label={t("profil.menu_video")} sub={t("profil.menu_video_sub")} color="#B5872A" onPress={() => setShowVideo(true)} />
          <View style={styles.divider} />
          <MenuItem icon="info" label={t("profil.menu_about")} sub={t("profil.menu_about_sub")} color="#6B7896" onPress={() => setShowAbout(true)} />
        </View>

        {/* Sécurité */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t("profil.section_security")}</Text>
        <View style={styles.scamCard}>
          {[
            { emoji: "❌", text: t("profil.scam1") },
            { emoji: "❌", text: t("profil.scam2") },
            { emoji: "❌", text: t("profil.scam3") },
            { emoji: "✅", text: t("profil.scam4") },
          ].map((item, i) => (
            <View key={i} style={[styles.scamRow, i > 0 && { marginTop: 8 }]}>
              <Text style={styles.scamEmoji}>{item.emoji}</Text>
              <Text style={styles.scamText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Déconnexion */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t("profil.section_account2")}</Text>
        <View style={styles.card}>
          {!confirmLogout ? (
            <MenuItem
              icon="log-out"
              label={t("profil.btn_logout")}
              onPress={handleLogoutPress}
              danger
            />
          ) : (
            <View style={styles.confirmBox}>
              <View style={styles.confirmHeader}>
                <Feather name="log-out" size={16} color="#DC2626" />
                <Text style={styles.confirmTitle}>{t("profil.confirm_logout_title")}</Text>
              </View>
              <Text style={styles.confirmSub}>{t("profil.confirm_logout_sub")}</Text>
              <View style={styles.confirmBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setConfirmLogout(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>{t("profil.confirm_cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.logoutBtn, loggingOut && { opacity: 0.6 }]}
                  onPress={handleLogoutConfirm}
                  disabled={loggingOut}
                  activeOpacity={0.8}
                >
                  {loggingOut ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Feather name="log-out" size={14} color="#FFF" />
                      <Text style={styles.logoutBtnText}>{t("profil.confirm_logout_btn")}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.legal}>{t("profil.legal")}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F4FA" },
  navBar: { backgroundColor: "#0D1F3C", paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" as const },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(181,135,42,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "rgba(181,135,42,0.3)" },
  editBtnText: { color: "#B5872A", fontSize: 12, fontWeight: "700" as const },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 24, backgroundColor: "#0D1F3C",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
    shadowColor: "#0D1F3C", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  avatarText: { color: "#B5872A", fontSize: 28, fontWeight: "900" as const },
  userName: { fontSize: 20, fontWeight: "800" as const, color: "#0D1F3C", marginBottom: 4 },
  userType: { fontSize: 13, color: "#6B7896", marginBottom: 8 },
  territoireBadge: {
    flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FFF8F0",
    borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "#F0D9A8",
  },
  territoireText: { color: "#B5872A", fontSize: 12, fontWeight: "700" as const },
  sectionTitle: {
    fontSize: 12, fontWeight: "700" as const, color: "#6B7896",
    textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden",
    shadowColor: "#0D1F3C", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: "#F1F4FA" },
  infoLabel: { fontSize: 10, color: "#8B9BB4", fontWeight: "600" as const, textTransform: "uppercase", marginBottom: 2 },
  infoValue: { fontSize: 14, color: "#0D1F3C", fontWeight: "500" as const },
  editInput: {
    fontSize: 14, color: "#0D1F3C", fontWeight: "500" as const,
    borderWidth: 1.5, borderColor: "#B5872A", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginTop: 2, backgroundColor: "#FFFDF7",
  },
  editActions: {
    flexDirection: "row", gap: 10, padding: 14, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: "#F1F4FA",
  },
  cancelEditBtn: {
    flex: 1, height: 42, borderRadius: 10, borderWidth: 1.5, borderColor: "#DDE2EC",
    alignItems: "center", justifyContent: "center", backgroundColor: "#F8F9FC",
  },
  cancelEditText: { fontSize: 13, fontWeight: "600" as const, color: "#6B7896" },
  saveBtn: {
    flex: 2, height: 42, borderRadius: 10, backgroundColor: "#0D1F3C",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  saveBtnText: { fontSize: 13, fontWeight: "700" as const, color: "#FFF" },
  divider: { height: 1, backgroundColor: "#F1F4FA" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600" as const, color: "#0D1F3C" },
  menuSub: { fontSize: 12, color: "#8B9BB4", marginTop: 1 },
  scamCard: { backgroundColor: "#FFF8F0", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#F0D9A8" },
  scamRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  scamEmoji: { fontSize: 14 },
  scamText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 18 },
  confirmBox: { padding: 16 },
  confirmHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  confirmTitle: { fontSize: 15, fontWeight: "700" as const, color: "#DC2626" },
  confirmSub: { fontSize: 12, color: "#6B7896", lineHeight: 18, marginBottom: 16 },
  confirmBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: "#DDE2EC",
    alignItems: "center", justifyContent: "center", backgroundColor: "#F8F9FC",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600" as const, color: "#0D1F3C" },
  logoutBtn: {
    flex: 1, height: 44, borderRadius: 12, backgroundColor: "#DC2626",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  logoutBtnText: { fontSize: 14, fontWeight: "700" as const, color: "#FFF" },
  legal: { color: "#B0BAD0", fontSize: 10, textAlign: "center", marginTop: 16 },
  modalRoot: { flex: 1, backgroundColor: "#F1F4FA" },
  modalHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F7",
  },
  modalTitle: { fontSize: 18, fontWeight: "800" as const, color: "#0D1F3C" },
  modalClose: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "#F1F4FA",
    alignItems: "center", justifyContent: "center",
  },
  modalScroll: { flex: 1 },
  modalSub: { fontSize: 11, color: "#B5872A", fontWeight: "700" as const, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 },
  modalBody: { fontSize: 13, color: "#3A4A64", lineHeight: 21 },
  modalBold: { fontWeight: "700" as const, color: "#0D1F3C" },
  aboutLogoSection: { alignItems: "center", paddingVertical: 24, gap: 8 },
  aboutIconCircle: {
    width: 80, height: 80, borderRadius: 22, backgroundColor: "#0D1F3C",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#0D1F3C", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  aboutIconText: { color: "#D4A847", fontSize: 26, fontWeight: "900" as const, letterSpacing: -1 },
  aboutAppName: { fontSize: 22, fontWeight: "800" as const, color: "#0D1F3C" },
  aboutVersion: { fontSize: 12, color: "#8B9BB4" },
  aboutCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden",
    shadowColor: "#0D1F3C", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
    marginBottom: 16,
  },
  aboutRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  aboutRowIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#FFF8F0", alignItems: "center", justifyContent: "center" },
  aboutRowLabel: { fontSize: 10, color: "#8B9BB4", fontWeight: "700" as const, textTransform: "uppercase", marginBottom: 2 },
  aboutRowValue: { fontSize: 13, color: "#0D1F3C", fontWeight: "500" as const },
  aboutLegal: { fontSize: 11, color: "#8B9BB4", lineHeight: 17, textAlign: "center" },
});
