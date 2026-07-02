import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function setupNotifications(): Promise<void> {
  if (Platform.OS === "web") return;

  const existing = (await Notifications.getPermissionsAsync()) as unknown as { granted: boolean };
  let granted = existing.granted;

  if (!granted) {
    const result = (await Notifications.requestPermissionsAsync()) as unknown as { granted: boolean };
    granted = result.granted;
  }

  if (!granted) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("fede", {
      name: "FEDE",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#B5872A",
      sound: "default",
      enableVibrate: true,
    });
  }
}

export function sendLocalNotification(title: string, body: string): void {
  if (Platform.OS === "web") return;
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
    },
    trigger: null,
  }).catch(() => {});
}
