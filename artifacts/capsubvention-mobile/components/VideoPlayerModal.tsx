import React, { useState } from "react";
import {
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

function LoadingText() {
  const { t } = useTranslation();
  return <Text style={styles.loadingText}>{t("video_player.loading")}</Text>;
}

// WebView is native-only — import dynamically to avoid web crash
let WebView: React.ComponentType<any> | null = null;
if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebView = require("react-native-webview").WebView;
}

interface VideoPlayerModalProps {
  visible: boolean;
  url: string;
  onClose: () => void;
}

function WebPlayerContent({ url }: { url: string }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  if (Platform.OS === "web") {
    // On web: render an iframe directly
    return (
      <View style={styles.playerWrap}>
        <iframe
          src={url}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            border: "none",
            backgroundColor: "#000",
          }}
          allow="autoplay; fullscreen"
          title={t("video_player.title")}
        />
      </View>
    );
  }

  // Native (APK / Expo Go)
  return (
    <View style={styles.playerWrap}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingInner}>
            <Feather name="play-circle" size={48} color="#B5872A" />
            <LoadingText />
          </View>
        </View>
      )}
      {WebView && (
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
        />
      )}
    </View>
  );
}

export function VideoPlayerModal({ visible, url, onClose }: VideoPlayerModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1F3C" />
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.dot} />
            <Text style={styles.headerTitle}>CapSubvention</Text>
          </View>
          <Text style={styles.headerSub}>{t("video_player.subtitle")}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t("common.close") ?? "Fermer"}
          >
            <Feather name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <WebPlayerContent url={url} />

        {/* Footer hint */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Feather name="info" size={13} color="rgba(255,255,255,0.4)" />
          <Text style={styles.footerText}>
            {Platform.OS === "web" ? t("video_player.hint_web") : t("video_player.hint_native")}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D1F3C",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B5872A",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  playerWrap: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0D1F3C",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingInner: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#0D1F3C",
  },
  footerText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.38)",
    flex: 1,
    lineHeight: 15,
  },
});
