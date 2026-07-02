import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  AppState,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "@/lib/api";
import { sendLocalNotification } from "@/lib/notifications";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

interface Message {
  id: number;
  dossierId: number;
  expediteur: string;
  expediteurRole: "user" | "admin" | "system";
  contenu: string;
  lu: boolean;
  createdAt: string;
}

interface PendingMessage {
  localId: string;
  contenu: string;
  createdAt: string;
}

interface Dossier {
  id: number;
  reference: string;
  titre: string;
}

const PENDING_KEY = "caps_pending_messages_v1";
const LAST_SEEN_KEY = "caps_last_seen_msg_v1";

function formatTime(s: string) {
  return new Date(s).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDay(s: string, todayLabel: string) {
  const d = new Date(s);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return todayLabel;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "long" });
}

export default function MessagerieScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const isNearBottomRef = useRef(true);
  const queryClient = useQueryClient();
  const isFocusedRef = useRef(true);
  const lastSeenIdRef = useRef<number>(0);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const { data: dossiers } = useQuery({
    queryKey: ["dossiers"],
    queryFn: () => apiFetch<Dossier[]>("/api/dossiers"),
  });

  const dossierId = dossiers?.[0]?.id;
  const dossierRef = dossiers?.[0]?.reference;

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", dossierId],
    queryFn: () => apiFetch<Message[]>(`/api/dossiers/${dossierId}/messages`),
    enabled: !!dossierId,
    refetchInterval: 5000,
  });

  // Dès que l'écran est affiché, on rafraîchit le compteur de messages non lus
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }, [queryClient])
  );

  useEffect(() => {
    AsyncStorage.getItem(PENDING_KEY).then(raw => {
      if (raw) {
        try { setPending(JSON.parse(raw)); } catch {}
      }
    });
    AsyncStorage.getItem(LAST_SEEN_KEY).then(raw => {
      if (raw) lastSeenIdRef.current = parseInt(raw, 10) || 0;
    });
  }, []);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const adminMessages = messages.filter(m => m.expediteurRole === "admin" || m.expediteurRole === "system");
    if (adminMessages.length === 0) return;
    const latest = adminMessages[adminMessages.length - 1];
    if (latest.id > lastSeenIdRef.current) {
      if (!isFocusedRef.current) {
        sendLocalNotification(t("messagerie.new_msg_notif"), t("messagerie.new_msg_notif_body"));
      }
      lastSeenIdRef.current = latest.id;
      AsyncStorage.setItem(LAST_SEEN_KEY, String(latest.id));
    }
  }, [messages]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      isFocusedRef.current = state === "active";
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  }, [pending]);

  const savePending = useCallback((msgs: PendingMessage[]) => {
    setPending(msgs);
    AsyncStorage.setItem(PENDING_KEY, JSON.stringify(msgs));
  }, []);

  const sendMutation = useMutation({
    mutationFn: (contenu: string) =>
      apiFetch<Message>(`/api/dossiers/${dossierId}/messages`, {
        method: "POST",
        body: JSON.stringify({ contenu }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", dossierId] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !dossierId || sendMutation.isPending) return;
    setInput("");
    try {
      await sendMutation.mutateAsync(text);
    } catch {
      const msg: PendingMessage = {
        localId: `pending_${Date.now()}`,
        contenu: text,
        createdAt: new Date().toISOString(),
      };
      savePending([...pending, msg]);
    }
  }, [input, dossierId, sendMutation, pending, savePending]);

  const retryPending = useCallback(async () => {
    if (!dossierId || pending.length === 0 || isRetrying) return;
    setIsRetrying(true);
    const stillPending: PendingMessage[] = [];
    for (const msg of pending) {
      try {
        await sendMutation.mutateAsync(msg.contenu);
      } catch {
        stillPending.push(msg);
      }
    }
    savePending(stillPending);
    setIsRetrying(false);
  }, [dossierId, pending, isRetrying, sendMutation, savePending]);

  useEffect(() => {
    if (pending.length === 0) return;
    const interval = setInterval(retryPending, 15000);
    return () => clearInterval(interval);
  }, [pending, retryPending]);

  const sorted = useMemo(
    () => [...(messages ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages]
  );

  const todayLabel = t("messagerie.today");

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isMe = item.expediteurRole === "user";
    const isSystem = item.expediteurRole === "system";
    const prevItem = sorted[index - 1];
    const showDay = !prevItem || formatDay(item.createdAt, todayLabel) !== formatDay(prevItem.createdAt, todayLabel);

    return (
      <>
        {showDay && (
          <View style={styles.dayRow}>
            <View style={styles.dayLine} />
            <Text style={styles.dayText}>{formatDay(item.createdAt, todayLabel)}</Text>
            <View style={styles.dayLine} />
          </View>
        )}
        {isSystem ? (
          <View style={styles.bubbleThem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>F</Text>
            </View>
            <View style={styles.systemBubble}>
              <Text style={styles.systemSenderLabel}>{item.expediteur}</Text>
              <Text style={styles.systemBubbleText}>{item.contenu}</Text>
              <Text style={[styles.time, styles.timeThem]}>{formatTime(item.createdAt)}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            {!isMe && (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>F</Text>
              </View>
            )}
            <View style={[styles.bubbleInner, isMe ? styles.bubbleInnerMe : styles.bubbleInnerThem]}>
              {!isMe && <Text style={styles.senderLabel}>{item.expediteur}</Text>}
              <Text style={isMe ? styles.textMe : styles.textThem}>{item.contenu}</Text>
              <Text style={[styles.time, isMe ? styles.timeMe : styles.timeThem]}>{formatTime(item.createdAt)}</Text>
            </View>
          </View>
        )}
      </>
    );
  }, [sorted, todayLabel]);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: topPad }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.advisorAvatar}>
            <Text style={styles.advisorAvatarText}>F</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{t("messagerie.header_title")}</Text>
            <Text style={styles.headerSub}>{dossierRef ?? t("messagerie.header_loading")}</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Offline banner */}
      {pending.length > 0 && (
        <View style={styles.offlineBanner}>
          <Feather name="wifi-off" size={13} color="#92400E" />
          <Text style={styles.offlineText}>
            {t("messagerie.pending_msg_count", { count: pending.length })}
          </Text>
          <TouchableOpacity onPress={retryPending} disabled={isRetrying} activeOpacity={0.7}>
            {isRetrying ? (
              <ActivityIndicator size="small" color="#92400E" />
            ) : (
              <Text style={styles.retryText}>{t("messagerie.btn_retry")}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!dossierId ? (
        <View style={styles.noDoc}>
          <Feather name="message-circle" size={40} color="#DDE2EC" />
          <Text style={styles.noDocText}>{t("messagerie.no_dossier")}</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#0D1F3C" />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={sorted}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
            isNearBottomRef.current =
              contentSize.height - contentOffset.y - layoutMeasurement.height < 80;
          }}
          scrollEventThrottle={100}
          onContentSizeChange={() => {
            if (isNearBottomRef.current) {
              flatRef.current?.scrollToEnd({ animated: true });
            }
          }}
          ListFooterComponent={
            pending.length > 0 ? (
              <>
                {pending.map((msg) => (
                  <View key={msg.localId} style={[styles.bubble, styles.bubbleMe]}>
                    <View style={[styles.bubbleInner, styles.bubbleInnerMe, styles.pendingBubble]}>
                      <Text style={styles.textMe}>{msg.contenu}</Text>
                      <View style={styles.pendingRow}>
                        <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                        <Text style={styles.pendingLabel}>{t("messagerie.pending_label")}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : null
          }
          ListEmptyComponent={
            pending.length === 0 ? (
              <View style={styles.center}>
                <Feather name="message-circle" size={32} color="#DDE2EC" />
                <Text style={styles.emptyText}>{t("messagerie.empty_messages")}</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Input */}
      {dossierId && (
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 64 }]}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={t("messagerie.input_placeholder")}
            placeholderTextColor="#B0BAD0"
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sendMutation.isPending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!input.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Feather name="send" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F4FA" },
  header: {
    backgroundColor: "#0D1F3C", paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  advisorAvatar: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "#B5872A",
    alignItems: "center", justifyContent: "center",
  },
  advisorAvatarText: { color: "#FFFFFF", fontWeight: "800" as const, fontSize: 13 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" as const },
  headerSub: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 1 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#22C55E", borderWidth: 2, borderColor: "#0D1F3C" },
  offlineBanner: {
    backgroundColor: "#FFF7ED", borderBottomWidth: 1, borderBottomColor: "#FDE68A",
    paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8,
  },
  offlineText: { flex: 1, fontSize: 12, color: "#92400E", fontWeight: "500" as const },
  retryText: { fontSize: 12, color: "#B45309", fontWeight: "700" as const },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  noDoc: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  noDocText: { fontSize: 14, color: "#6B7896", textAlign: "center", lineHeight: 20 },
  list: { paddingHorizontal: 14, paddingTop: 10 },
  emptyText: { fontSize: 13, color: "#8B9BB4", textAlign: "center", lineHeight: 20 },
  dayRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 12 },
  dayLine: { flex: 1, height: 1, backgroundColor: "#DDE2EC" },
  dayText: { fontSize: 11, color: "#8B9BB4", fontWeight: "600" as const },
  systemBubble: {
    maxWidth: "78%", padding: 12, borderRadius: 16, borderBottomLeftRadius: 4,
    backgroundColor: "#FBF5E0", borderWidth: 1, borderColor: "#E8D9A0",
  },
  systemSenderLabel: { fontSize: 10, color: "#92710A", fontWeight: "700" as const, marginBottom: 4 },
  systemBubbleText: { color: "#7A5A2A", fontSize: 14, lineHeight: 20 },
  bubble: { marginBottom: 8 },
  bubbleMe: { alignItems: "flex-end" },
  bubbleThem: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#0D1F3C", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#B5872A", fontSize: 10, fontWeight: "800" as const },
  bubbleInner: { maxWidth: "78%", padding: 12, borderRadius: 16 },
  bubbleInnerMe: { backgroundColor: "#0D1F3C", borderBottomRightRadius: 4 },
  bubbleInnerThem: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  pendingBubble: { opacity: 0.7 },
  pendingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  pendingLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)", fontStyle: "italic" },
  senderLabel: { fontSize: 10, color: "#8B9BB4", fontWeight: "700" as const, marginBottom: 4 },
  textMe: { color: "#FFFFFF", fontSize: 14, lineHeight: 20 },
  textThem: { color: "#0D1F3C", fontSize: 14, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4 },
  timeMe: { color: "rgba(255,255,255,0.45)", textAlign: "right" },
  timeThem: { color: "#B0BAD0" },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#DDE2EC", gap: 10,
  },
  textInput: {
    flex: 1, borderWidth: 1.5, borderColor: "#DDE2EC", borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#0D1F3C",
    backgroundColor: "#F8F9FC", maxHeight: 120,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#0D1F3C", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#DDE2EC" },
});
