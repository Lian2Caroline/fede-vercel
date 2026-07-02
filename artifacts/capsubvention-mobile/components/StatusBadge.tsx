import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  brouillon:      { bg: "#F3F4F6", color: "#6B7280" },
  soumis:         { bg: "#EFF6FF", color: "#1D4ED8" },
  en_instruction: { bg: "#FFF7ED", color: "#C2410C" },
  expertise:      { bg: "#F5F3FF", color: "#6D28D9" },
  valide:         { bg: "#F0FDF4", color: "#15803D" },
  verse:          { bg: "#ECFDF5", color: "#065F46" },
  rejete:         { bg: "#FEF2F2", color: "#B91C1C" },
};

const STATUS_KEYS: Record<string, string> = {
  brouillon:      "status_brouillon",
  soumis:         "status_soumis",
  en_instruction: "status_en_instruction",
  expertise:      "status_expertise",
  valide:         "status_valide",
  verse:          "status_verse",
  rejete:         "status_rejete",
};

export function StatusBadge({ statut }: { statut: string }) {
  const { t } = useTranslation();
  const cfg = STATUS_COLORS[statut] ?? { bg: "#F3F4F6", color: "#374151" };
  const label = STATUS_KEYS[statut] ? t(`common.${STATUS_KEYS[statut]}`) : statut;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 5,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
});
