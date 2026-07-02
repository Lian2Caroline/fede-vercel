import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";

const TYPE_PORTEUR_LABELS: Record<string, string> = {
  particulier: "Particulier / Micro-entrepreneur",
  entreprise: "Entreprise / PME",
  association: "Association",
  collectivite: "Collectivité",
  autre: "Autre",
};

interface MenuItemProps {
  icon: "shield" | "alert-triangle" | "mail" | "phone" | "info" | "log-out" | "file-text" | "briefcase";
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

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  const handleLogoutCancel = () => {
    setConfirmLogout(false);
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>Mon Profil</Text>
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
        <Text style={styles.sectionTitle}>Informations du compte</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Feather name="mail" size={14} color="#8B9BB4" />
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
          {user?.telephone && (
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Feather name="phone" size={14} color="#8B9BB4" />
              <View>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{user.telephone}</Text>
              </View>
            </View>
          )}
          {user?.organisation && (
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Feather name="briefcase" size={14} color="#8B9BB4" />
              <View>
                <Text style={styles.infoLabel}>Organisation</Text>
                <Text style={styles.infoValue}>{user.organisation}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Support */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Assistance & Informations</Text>
        <View style={styles.card}>
          <MenuItem icon="mail" label="Contacter le support" sub="support@capsubvention.fr" color="#0D1F3C" />
          <View style={styles.divider} />
          <MenuItem icon="file-text" label="Conditions d'utilisation" sub="Article L1611-2 CGCT" color="#6B7896" />
          <View style={styles.divider} />
          <MenuItem icon="info" label="À propos de CapSubvention" sub="Version 1.0 · © 2025" color="#6B7896" />
        </View>

        {/* Sécurité */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Sécurité — Arnaques</Text>
        <View style={styles.scamCard}>
          {[
            { emoji: "❌", text: "Aucun Telegram ni Facebook. Tout compte se réclamant de CapSubvention sur ces réseaux est une arnaque." },
            { emoji: "❌", text: "Aucun virement demandé. Nous ne vous demanderons jamais de transférer des fonds vers un tiers." },
            { emoji: "❌", text: "Aucun agent ne demande vos identifiants. Votre mot de passe est strictement confidentiel." },
            { emoji: "✅", text: "Signaler : support@capsubvention.fr" },
          ].map((item, i) => (
            <View key={i} style={[styles.scamRow, i > 0 && { marginTop: 8 }]}>
              <Text style={styles.scamEmoji}>{item.emoji}</Text>
              <Text style={styles.scamText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Déconnexion */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Compte</Text>
        <View style={styles.card}>
          {!confirmLogout ? (
            <MenuItem
              icon="log-out"
              label="Se déconnecter"
              onPress={handleLogoutPress}
              danger
            />
          ) : (
            <View style={styles.confirmBox}>
              <View style={styles.confirmHeader}>
                <Feather name="log-out" size={16} color="#DC2626" />
                <Text style={styles.confirmTitle}>Confirmer la déconnexion ?</Text>
              </View>
              <Text style={styles.confirmSub}>
                Vous devrez vous reconnecter avec votre email et mot de passe.
              </Text>
              <View style={styles.confirmBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleLogoutCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Annuler</Text>
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
                      <Text style={styles.logoutBtnText}>Se déconnecter</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.legal}>CapSubvention · Article L1611-2 CGCT · Données RGPD</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F4FA" },
  navBar: { backgroundColor: "#0D1F3C", paddingHorizontal: 20, paddingBottom: 16 },
  navTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" as const },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "#0D1F3C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarText: { color: "#B5872A", fontSize: 28, fontWeight: "900" as const },
  userName: { fontSize: 20, fontWeight: "800" as const, color: "#0D1F3C", marginBottom: 4 },
  userType: { fontSize: 13, color: "#6B7896", marginBottom: 8 },
  territoireBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF8F0",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#F0D9A8",
  },
  territoireText: { color: "#B5872A", fontSize: 12, fontWeight: "700" as const },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#6B7896",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: "#F1F4FA" },
  infoLabel: { fontSize: 10, color: "#8B9BB4", fontWeight: "600" as const, textTransform: "uppercase", marginBottom: 2 },
  infoValue: { fontSize: 14, color: "#0D1F3C", fontWeight: "500" as const },
  divider: { height: 1, backgroundColor: "#F1F4FA" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600" as const, color: "#0D1F3C" },
  menuSub: { fontSize: 12, color: "#8B9BB4", marginTop: 1 },
  scamCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0D9A8",
  },
  scamRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  scamEmoji: { fontSize: 14 },
  scamText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 18 },
  confirmBox: { padding: 16 },
  confirmHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  confirmTitle: { fontSize: 15, fontWeight: "700" as const, color: "#DC2626" },
  confirmSub: { fontSize: 12, color: "#6B7896", lineHeight: 18, marginBottom: 16 },
  confirmBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DDE2EC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FC",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600" as const, color: "#0D1F3C" },
  logoutBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  logoutBtnText: { fontSize: 14, fontWeight: "700" as const, color: "#FFF" },
  legal: { color: "#B0BAD0", fontSize: 10, textAlign: "center", marginTop: 16 },
});
