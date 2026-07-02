import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { apiFetch } from "@/lib/api";
import * as Haptics from "expo-haptics";

interface Message {
  id: number;
  dossierId: number;
  expediteur: string;
  expediteurRole: "user" | "admin" | "system";
  contenu: string;
  lu: boolean;
  createdAt: string;
}

interface Dossier {
  id: number;
  reference: string;
  titre: string;
}

function formatTime(s: string) {
  return new Date(s).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function formatDay(s: string) {
  const d = new Date(s);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
}

export default function MessagerieScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const flatRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();
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

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || !dossierId || sendMutation.isPending) return;
    setInput("");
    sendMutation.mutate(text);
  }, [input, dossierId, sendMutation]);

  const sorted = [...(messages ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.expediteurRole === "user";
    const isSystem = item.expediteurRole === "system";
    const prevItem = sorted[index - 1];
    const showDay = !prevItem || formatDay(item.createdAt) !== formatDay(prevItem.createdAt);

    return (
      <>
        {showDay && (
          <View style={styles.dayRow}>
            <View style={styles.dayLine} />
            <Text style={styles.dayText}>{formatDay(item.createdAt)}</Text>
            <View style={styles.dayLine} />
          </View>
        )}
        {isSystem ? (
          <View style={styles.systemMsg}>
            <Text style={styles.systemText}>{item.contenu}</Text>
          </View>
        ) : (
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            {!isMe && (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>CS</Text>
              </View>
            )}
            <View style={[styles.bubbleInner, isMe ? styles.bubbleInnerMe : styles.bubbleInnerThem]}>
              {!isMe && <Text style={styles.senderLabel}>Conseiller CapSubvention</Text>}
              <Text style={isMe ? styles.textMe : styles.textThem}>{item.contenu}</Text>
              <Text style={[styles.time, isMe ? styles.timeMe : styles.timeThem]}>{formatTime(item.createdAt)}</Text>
            </View>
          </View>
        )}
      </>
    );
  };

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
            <Text style={styles.advisorAvatarText}>CS</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Messagerie</Text>
            <Text style={styles.headerSub}>{dossierRef ?? "Chargement…"}</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {!dossierId ? (
        <View style={styles.noDoc}>
          <Feather name="message-circle" size={40} color="#DDE2EC" />
          <Text style={styles.noDocText}>Déposez un dossier pour accéder à la messagerie avec votre Conseiller.</Text>
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
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="message-circle" size={32} color="#DDE2EC" />
              <Text style={styles.emptyText}>Aucun message pour l'instant.{"\n"}Posez votre première question à votre Conseiller.</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      {dossierId && (
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Écrire un message…"
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
    backgroundColor: "#0D1F3C",
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  advisorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#B5872A",
    alignItems: "center",
    justifyContent: "center",
  },
  advisorAvatarText: { color: "#FFFFFF", fontWeight: "800" as const, fontSize: 13 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" as const },
  headerSub: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 1 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#22C55E", borderWidth: 2, borderColor: "#0D1F3C" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  noDoc: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  noDocText: { fontSize: 14, color: "#6B7896", textAlign: "center", lineHeight: 20 },
  list: { paddingHorizontal: 14, paddingTop: 10 },
  emptyText: { fontSize: 13, color: "#8B9BB4", textAlign: "center", lineHeight: 20 },
  dayRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 12 },
  dayLine: { flex: 1, height: 1, backgroundColor: "#DDE2EC" },
  dayText: { fontSize: 11, color: "#8B9BB4", fontWeight: "600" as const },
  systemMsg: { alignItems: "center", marginVertical: 6 },
  systemText: { fontSize: 12, color: "#6B7896", backgroundColor: "#EEF0F7", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
  bubble: { marginBottom: 8 },
  bubbleMe: { alignItems: "flex-end" },
  bubbleThem: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#0D1F3C", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#B5872A", fontSize: 10, fontWeight: "800" as const },
  bubbleInner: { maxWidth: "78%", padding: 12, borderRadius: 16 },
  bubbleInnerMe: { backgroundColor: "#0D1F3C", borderBottomRightRadius: 4 },
  bubbleInnerThem: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  senderLabel: { fontSize: 10, color: "#8B9BB4", fontWeight: "700" as const, marginBottom: 4 },
  textMe: { color: "#FFFFFF", fontSize: 14, lineHeight: 20 },
  textThem: { color: "#0D1F3C", fontSize: 14, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4 },
  timeMe: { color: "rgba(255,255,255,0.45)", textAlign: "right" },
  timeThem: { color: "#B0BAD0" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#DDE2EC",
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#DDE2EC",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0D1F3C",
    backgroundColor: "#F8F9FC",
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0D1F3C",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#DDE2EC" },
});
