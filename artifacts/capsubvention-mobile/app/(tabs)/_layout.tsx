import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

function TabIcon({ name, color, iosName }: { name: any; color: string; iosName?: SymbolViewProps["name"] }) {
  if (Platform.OS === "ios" && iosName) {
    return <SymbolView name={iosName} tintColor={color} size={22} />;
  }
  return <Feather name={name} size={22} color={color} />;
}

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<{ messagesNonLus: number }>("/api/dashboard/stats"),
    refetchInterval: 30000,
    retry: false,
  });

  const tabBarHeight = isWeb ? 84 : 56 + insets.bottom;
  const tabBarPaddingBottom = isWeb ? 20 : insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#B5872A",
        tabBarInactiveTintColor: "#8B9BB4",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#FFFFFF",
          borderTopWidth: isWeb ? 1 : 0.5,
          borderTopColor: "#DDE2EC",
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" as const },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={95}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} iosName="house.fill" />,
        }}
      />
      <Tabs.Screen
        name="dossier"
        options={{
          title: t("tabs.dossier"),
          tabBarIcon: ({ color }) => <TabIcon name="folder" color={color} iosName="folder.fill" />,
        }}
      />
      <Tabs.Screen
        name="messagerie"
        options={{
          title: t("tabs.messagerie"),
          tabBarIcon: ({ color }) => <TabIcon name="message-circle" color={color} iosName="message.fill" />,
          tabBarBadge: (stats?.messagesNonLus ?? 0) > 0 ? stats!.messagesNonLus : undefined,
          tabBarBadgeStyle: { backgroundColor: "#DC2626", fontSize: 10, minWidth: 16, height: 16 },
        }}
      />
      <Tabs.Screen
        name="frais"
        options={{
          title: t("tabs.frais"),
          tabBarIcon: ({ color }) => <TabIcon name="credit-card" color={color} iosName="creditcard.fill" />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: t("tabs.profil"),
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} iosName="person.circle.fill" />,
        }}
      />
    </Tabs>
  );
}
