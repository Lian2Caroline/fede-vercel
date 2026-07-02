import { useState, useEffect } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { useGetDashboardStats, useGetDossier, useListMessages, useSendMessage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Send, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const TIMELINE_STEPS = [
  { phase: 1, titre: "Prise en charge", desc: "Accusé de réception officiel transmis — instruction démarrée.", action: "accuser_reception" },
  { phase: 2, titre: "Analyse d'éligibilité", desc: "Rapport d'éligibilité favorable et fiche de renseignements complémentaires transmis.", action: "envoyer_eligibilite" },
  { phase: 3, titre: "Contractualisation", desc: "Contrat de mission de conseil en financement public transmis pour signature.", action: "envoyer_contrat" },
  { phase: 4, titre: "Constitution du dossier", desc: "Contrat signé réceptionné — constitution du dossier de demande en cours.", action: "marquer_signe" },
  { phase: 5, titre: "Décision favorable", desc: "Notification d'attribution reçue — financement non remboursable accordé.", action: "marquer_favorable" },
  { phase: 6, titre: "Clôture de la mission", desc: "Paiement des frais d'instruction confirmé — dossier clôturé.", action: "confirmer_paiement" },
];

const DOCS_BY_ACTION: Record<string, { type: string; label: string }[]> = {
  accuser_reception:   [{ type: "accuse_reception",    label: "Accusé de réception" }],
  envoyer_eligibilite: [{ type: "rapport_eligibilite", label: "Rapport d'éligibilité" }, { type: "fiche_collecte", label: "Fiche de renseignements" }],
  envoyer_contrat:     [{ type: "contrat_mission",     label: "Contrat de mission" }],
  marquer_favorable:   [{ type: "notification",        label: "Notification d'attribution" }],
};

export default function UserSuivi() {
  const { data: stats } = useGetDashboardStats();
  const dossierId = stats?.dossierActif?.id;

  const { data: dossier, isLoading: dossierLoading } = useGetDossier(dossierId as number, { query: { enabled: !!dossierId } });
  const { data: messages = [] } = useListMessages(dossierId as number, { query: { enabled: !!dossierId } });
  const sendMessageMutation = useSendMessage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!dossierId) return;
    fetch(`${BASE}/api/dossiers/${dossierId}/events`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setEvents)
      .catch(() => {});
  }, [dossierId]);

  const executedActions = new Set(events.map((e: any) => e.action));
  const completedCount = TIMELINE_STEPS.filter(s => executedActions.has(s.action)).length;
  const progressPct = Math.round((completedCount / 6) * 100);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !dossierId) return;
    try {
      await sendMessageMutation.mutateAsync({ id: dossierId, data: { contenu: message } });
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/dossiers", dossierId, "messages"] });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer le message.", variant: "destructive" });
    }
  };

  function openDoc(type: string) {
    if (!dossierId) return;
    window.open(`${BASE}/api/dossiers/${dossierId}/pdf/${type}`, "_blank");
  }

  if (!dossierId) {
    return (
      <UserLayout>
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-bold text-[#1a2f5e]">Aucun dossier actif</h3>
          <p className="text-gray-500 text-sm mt-2">Créez un dossier pour suivre son avancement.</p>
        </div>
      </UserLayout>
    );
  }

  if (dossierLoading) {
    return <UserLayout><div className="animate-pulse h-96 bg-gray-100 rounded-xl" /></UserLayout>;
  }

  return (
    <UserLayout>
      <div className="bg-[#0D1F3C] rounded-xl p-5 text-white mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Suivi en temps réel</div>
            <div className="font-extrabold text-xl">{dossier?.titre}</div>
            <div className="text-white/60 text-sm mt-0.5">Réf. {dossier?.reference} · {dossier?.territoire}</div>
          </div>
          <div className="text-left md:text-right shrink-0">
            <div className="text-white/50 text-xs mb-1">Progression globale</div>
            <div className="text-4xl font-extrabold text-[#d4b96a]">{progressPct}%</div>
            <div className="text-white/40 text-xs">{completedCount} étape{completedCount > 1 ? "s" : ""} sur 6 complétée{completedCount > 1 ? "s" : ""}</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#B5872A] to-[#d4b96a] rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#0D1F3C] text-base mb-6">Chronologie du traitement</h3>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
              <div className="space-y-0">
                {TIMELINE_STEPS.map((step, i) => {
                  const isDone = executedActions.has(step.action);
                  const isCurrent = !isDone && (i === 0 || executedActions.has(TIMELINE_STEPS[i - 1]?.action));
                  const event = events.find((e: any) => e.action === step.action);
                  const docs = DOCS_BY_ACTION[step.action] ?? [];

                  return (
                    <div key={step.phase} className="relative flex gap-4 pb-7">
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        isDone ? "bg-[#0D1F3C] border-[#0D1F3C]" :
                        isCurrent ? "bg-white border-[#B5872A] shadow-sm" :
                        "bg-white border-gray-200"
                      }`}>
                        {isDone ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#B5872A] animate-pulse" />
                        ) : (
                          <span className="text-xs font-bold text-gray-300">{step.phase}</span>
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-sm font-bold ${isDone ? "text-[#0D1F3C]" : isCurrent ? "text-[#B5872A]" : "text-gray-400"}`}>
                            {step.titre}
                          </span>
                          {isDone && event && (
                            <span className="text-[10px] text-gray-400">
                              {new Date(event.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] bg-[#B5872A]/10 text-[#B5872A] font-semibold px-2 py-0.5 rounded-full border border-[#B5872A]/20">
                              En attente
                            </span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${isDone ? "text-gray-500" : "text-gray-400"}`}>
                          {isDone && event?.note ? event.note : step.desc}
                        </p>
                        {isDone && docs.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {docs.map(d => (
                              <button key={d.type} onClick={() => openDoc(d.type)}
                                className="flex items-center gap-1.5 text-xs text-[#0D1F3C] font-semibold border border-[#0D1F3C]/20 bg-[#0D1F3C]/5 px-3 py-1.5 rounded-lg hover:bg-[#0D1F3C]/10 transition-colors">
                                <Download className="w-3 h-3" /> {d.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col" style={{ height: "600px" }}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="font-bold text-[#0D1F3C] text-sm">Messagerie</h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
                {messages.length} message{messages.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-8">Aucun message pour le moment.</div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.expediteurRole === "user";
                  const isSystem = msg.expediteurRole === "system";
                  return (
                    <div key={msg.id} className={isSystem ? "px-2" : `flex ${isUser ? "justify-end" : "justify-start"}`}>
                      {isSystem ? (
                        <div className="bg-[#F4F6FB] border border-gray-200 rounded-lg p-3 text-xs text-gray-600 text-center leading-relaxed">
                          {msg.contenu}
                        </div>
                      ) : (
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                          isUser ? "bg-[#0D1F3C] text-white rounded-br-sm" : "bg-[#F4F6FB] text-slate-800 border border-gray-100 rounded-bl-sm"
                        }`}>
                          {!isUser && <div className="text-[10px] font-bold text-[#B5872A] mb-1">{msg.expediteur}</div>}
                          <p className="whitespace-pre-wrap">{msg.contenu}</p>
                          <div className={`text-[10px] mt-1 ${isUser ? "text-white/50 text-right" : "text-gray-400"}`}>
                            {new Date(msg.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleSendMessage} className="shrink-0 flex gap-2">
              <input type="text" value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Écrire un message à votre conseiller..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20" />
              <button type="submit" disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-gray-200 text-white p-2.5 rounded-lg transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
