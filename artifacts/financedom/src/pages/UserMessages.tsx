import { useState, useEffect, useRef } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Send, MessageSquare, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  useListDossiers,
  useListMessages,
  useSendMessage,
  getListMessagesQueryKey,
  getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";

type Dossier = {
  id: number;
  reference: string;
  titre: string;
  statut: string;
};

export default function UserMessages() {
  const { t } = useTranslation();
  useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: dossiers = [], isLoading: loadingDossiers } = useListDossiers();

  useEffect(() => {
    if (dossiers.length > 0 && !selectedDossier) {
      setSelectedDossier(dossiers[0] as Dossier);
    }
  }, [dossiers, selectedDossier]);

  const { data: messages = [] } = useListMessages(
    selectedDossier?.id ?? 0,
    {
      query: {
        enabled: !!selectedDossier,
        refetchInterval: 3000,
      },
    },
  );

  useEffect(() => {
    if (!selectedDossier) return;
    queryClient.invalidateQueries({
      queryKey: getGetDashboardStatsQueryKey(),
    });
  }, [messages, selectedDossier, queryClient]);

  const { mutate: sendMsg, isPending: sending } = useSendMessage({
    mutation: {
      onMutate: async (vars) => {
        const dossierId = vars.id;
        const queryKey = getListMessagesQueryKey(dossierId);
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<any[]>(queryKey) ?? [];
        const tempId = -Date.now();
        const optimistic = {
          id: tempId,
          dossierId,
          expediteur: t("messages.sender_user"),
          expediteurRole: "user",
          contenu: vars.data.contenu,
          lu: false,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData(queryKey, [...previous, optimistic]);
        setInput("");
        return { previous, tempId, queryKey };
      },
      onSuccess: (serverMsg, _vars, ctx) => {
        if (!ctx) return;
        queryClient.setQueryData<any[]>(ctx.queryKey, (curr) =>
          (curr ?? []).map((m) => (m.id === ctx.tempId ? serverMsg : m)),
        );
      },
      onError: (_err, vars, ctx) => {
        if (ctx) {
          queryClient.setQueryData(ctx.queryKey, ctx.previous);
        }
        setInput(vars.data.contenu);
        toast({
          title: t("messages.send_error"),
          description: t("messages.send_error_desc"),
          variant: "destructive",
        });
      },
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleSend() {
    if (!input.trim() || !selectedDossier || sending) return;
    sendMsg({ id: selectedDossier.id, data: { contenu: input.trim() } });
  }

  return (
    <UserLayout>
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-[#1a2f5e] mb-1">{t("messages.title")}</h2>
        <p className="text-gray-500 text-sm">{t("messages.sub")}</p>
      </div>

      {loadingDossiers ? (
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      ) : dossiers.length === 0 ? (
        <div className="bg-white border border-[#DDE2EC] rounded-2xl p-8 sm:p-16 text-center">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium mb-2">{t("messages.no_dossier")}</p>
          <p className="text-gray-400 text-sm">{t("messages.no_dossier_desc")}</p>
        </div>
      ) : (
        <div
          className="bg-white border border-[#DDE2EC] rounded-2xl shadow-sm overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 220px)" }}
        >
          {dossiers.length > 1 && (
            <div className="border-b border-[#DDE2EC] p-3 flex gap-2 overflow-x-auto shrink-0">
              {dossiers.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDossier(d as Dossier)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedDossier?.id === d.id
                      ? "bg-[#0D1F3C] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {d.reference}
                </button>
              ))}
            </div>
          )}

          {selectedDossier && (
            <div className="border-b border-[#DDE2EC] px-5 py-3 shrink-0 flex items-center gap-3 bg-[#F8F9FC]">
              <div className="w-8 h-8 rounded-full bg-[#0D1F3C] flex items-center justify-center text-white shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#0D1F3C] text-sm">{t("messages.advisor")}</div>
                <div className="text-xs text-gray-400">
                  {selectedDossier.reference} · {selectedDossier.titre}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> {t("messages.online")}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">{t("messages.no_messages")}</p>
                <p className="text-gray-400 text-sm">{t("messages.write_below")}</p>
              </div>
            )}
            {messages.map((msg) => {
              const isUser = msg.expediteurRole === "user";
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] ${isUser ? "order-2" : ""}`}>
                    {!isUser && (
                      <div className="text-[10px] text-gray-400 mb-1 ml-1">{msg.expediteur}</div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm break-words ${
                        isUser
                          ? "bg-[#0D1F3C] text-white rounded-br-sm"
                          : msg.expediteurRole === "system"
                          ? "bg-[#FBF5E0] text-[#7a5a2a] border border-[#e8d9a0] rounded-bl-sm"
                          : "bg-[#F1F4FA] text-[#1A2235] border border-[#DDE2EC] rounded-bl-sm"
                      }`}
                    >
                      {msg.contenu}
                    </div>
                    <div
                      className={`text-[9px] text-gray-400 mt-1 ${isUser ? "text-right mr-1" : "ml-1"}`}
                    >
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#DDE2EC] p-4 shrink-0 bg-white">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t("messages.placeholder")}
                rows={2}
                className="flex-1 border border-[#DDE2EC] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C]"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="w-11 h-11 bg-[#0D1F3C] rounded-xl flex items-center justify-center text-white hover:bg-[#162B52] transition-colors disabled:opacity-40 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-gray-400 mt-2">
              {t("messages.response_time")}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
