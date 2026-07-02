import React from "react";
import { StyleSheet, Text, View } from "react-native";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  brouillon:      { label: "Brouillon",       bg: "#F3F4F6", color: "#6B7280" },
  soumis:         { label: "Soumis",          bg: "#EFF6FF", color: "#1D4ED8" },
  en_instruction: { label: "En instruction",  bg: "#FFF7ED", color: "#C2410C" },
  expertise:      { label: "Expertise",       bg: "#F5F3FF", color: "#6D28D9" },
  valide:         { label: "Validé",          bg: "#F0FDF4", color: "#15803D" },
  verse:          { label: "Versé",           bg: "#ECFDF5", color: "#065F46" },
  rejete:         { label: "Rejeté",          bg: "#FEF2F2", color: "#B91C1C" },
};

export function StatusBadge({ statut }: { statut: string }) {
  const cfg = STATUS_CONFIG[statut] ?? { label: statut, bg: "#F3F4F6", color: "#374151" };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
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
