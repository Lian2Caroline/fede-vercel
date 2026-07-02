import "@/lib/i18n";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SplashAnimation } from "@/components/SplashAnimation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { setupNotifications } from "@/lib/notifications";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
});

function RootLayoutNav() {
  const { user, isLoading, pendingVerification } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    const onVerifyScreen = segments[1] === "verify-email";

    if (pendingVerification && !onVerifyScreen) {
      router.replace("/(auth)/verify-email");
      return;
    }

    if (!pendingVerification && onVerifyScreen) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
      return;
    }

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup && !onVerifyScreen) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, pendingVerification]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D1F3C" }}>
        <ActivityIndicator color="#B5872A" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="nouveau-dossier" options={{ presentation: "modal" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the native splash immediately — our animated splash takes over
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Wait for fonts before starting any render
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                {/*
                 * Render the main app and the splash overlay together so the
                 * login screen is already loaded and waiting underneath.
                 * The SplashAnimation fades out when done, revealing login.
                 */}
                <RootLayoutNav />
                {!splashDone && (
                  <SplashAnimation onFinish={() => setSplashDone(true)} />
                )}
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
