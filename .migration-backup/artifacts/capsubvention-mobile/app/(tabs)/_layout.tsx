import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { SymbolView } from "expo-symbols";

function TabIcon({ name, color, iosName }: { name: any; color: string; iosName?: string }) {
  if (Platform.OS === "ios" && iosName) {
    return <SymbolView name={iosName} tintColor={color} size={22} />;
  }
  return <Feather name={name} size={22} color={color} />;
}

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

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
          height: isWeb ? 84 : 62,
          paddingBottom: isWeb ? 20 : 8,
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
          title: "Accueil",
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} iosName="house.fill" />,
        }}
      />
      <Tabs.Screen
        name="dossier"
        options={{
          title: "Dossier",
          tabBarIcon: ({ color }) => <TabIcon name="folder" color={color} iosName="folder.fill" />,
        }}
      />
      <Tabs.Screen
        name="messagerie"
        options={{
          title: "Messagerie",
          tabBarIcon: ({ color }) => <TabIcon name="message-circle" color={color} iosName="message.fill" />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} iosName="person.circle.fill" />,
        }}
      />
    </Tabs>
  );
}
