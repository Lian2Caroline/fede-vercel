import { UserLayout } from "../shared/UserLayout";

const MESSAGES = [
  { de: "Administration", date: "22/01/2024 à 14h32", msg: "Votre dossier a été pris en charge par Mme Sylvie Bertrand, expert agréée. L'instruction technique de votre projet est en cours. Vous recevrez prochainement une notification concernant les frais d'instruction applicables.", type: "admin" },
  { de: "Système", date: "18/01/2024 à 09h15", msg: "Votre dossier DOS-2024-0127 a été transmis au service d'instruction. Un accusé de réception officiel vous a été envoyé par e-mail.", type: "system" },
  { de: "Administration", date: "15/01/2024 à 11h08", msg: "Nous avons bien reçu votre dossier de demande de financement. Après vérification de la recevabilité administrative, votre dossier est déclaré complet. Il sera prochainement affecté à un expert.", type: "admin" },
];

const TIMELINE_STEPS = [
  { num: 1, titre: "Création et soumission du dossier", desc: "Le porteur de projet crée son dossier en ligne et soumet l'ensemble des pièces justificatives.", date: "12/01/2024", done: true },
  { num: 2, titre: "Vérification de recevabilité administrative", desc: "L'administration vérifie la complétude du dossier et la conformité des documents fournis.", date: "15/01/2024", done: true },
  { num: 3, titre: "Affectation à un expert agréé", desc: "Un expert technique agréé par l'organisme financeur est désigné pour instruire le dossier.", date: "18/01/2024", done: true },
  { num: 4, titre: "Instruction technique et financière", desc: "L'expert procède à l'analyse approfondie de la viabilité économique et technique du projet.", date: "22/01/2024", active: true },
  { num: 5, titre: "Émission des frais d'instruction", desc: "Des frais d'instruction sont émis pour couvrir les prestations d'expertise, de certification réglementaire et d'accompagnement au montage du dossier.", date: null, pending: true, important: true },
  { num: 6, titre: "Paiement et certification du dossier", desc: "Après paiement des frais, le dossier est certifié conforme et peut être transmis à l'organisme financeur.", date: null, pending: true },
  { num: 7, titre: "Transmission à l'organisme financeur", desc: "Le dossier complet et certifié est transmis officiellement à la Région / l'UE / l'État pour décision.", date: null, pending: true },
  { num: 8, titre: "Décision et versement de la subvention", desc: "La commission d'attribution statue sur votre demande. En cas de validation, la subvention est versée sur votre RIB.", date: null, pending: true },
];

export function UserSuivi() {
  return (
    <UserLayout active="suivi">
      {/* Status banner */}
      <div className="bg-gradient-to-r from-[#1a2f5e] to-[#2e5db3] rounded-xl p-5 text-white mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">⚙</div>
          <div>
            <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Statut actuel</div>
            <div className="font-extrabold text-lg">Instruction en cours</div>
            <div className="text-white/60 text-sm">Dossier DOS-2024-0127 • FEDER Martinique</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/60 text-xs mb-1">Progression</div>
          <div className="text-3xl font-extrabold text-[#d4b96a]">45%</div>
          <div className="text-white/40 text-xs">Étape 4 sur 8</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Timeline */}
        <div className="col-span-7">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#1a2f5e] text-base mb-6">Chronologie du traitement</h3>
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={step.num} className="flex gap-4 relative">
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`absolute left-[18px] top-9 bottom-0 w-0.5 ${step.done ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                  <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm z-10 ${
                    step.done ? "bg-green-500 text-white" :
                    step.active ? "bg-[#1a2f5e] text-white ring-4 ring-[#1a2f5e]/20" :
                    "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}>
                    {step.done ? "✓" : step.num}
                  </div>
                  <div className={`pb-6 flex-1 ${step.active ? "" : ""}`}>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`font-semibold text-sm ${step.done ? "text-gray-700" : step.active ? "text-[#1a2f5e]" : "text-gray-400"}`}>
                        {step.titre}
                      </span>
                      {step.active && <span className="bg-[#1a2f5e] text-white text-xs font-bold px-2 py-0.5 rounded-full">En cours</span>}
                      {step.important && <span className="bg-[#fff8e8] text-[#b8963e] border border-[#e8d9a0] text-xs font-bold px-2 py-0.5 rounded-full">Frais réglementaires</span>}
                    </div>
                    <p className={`text-xs leading-relaxed mb-1 ${step.done || step.active ? "text-gray-500" : "text-gray-300"}`}>{step.desc}</p>
                    {step.date && <div className="text-xs text-gray-400 font-medium">{step.date}</div>}
                    {!step.date && !step.pending && <div className="text-xs text-gray-300">À venir</div>}
                    {step.pending && <div className="text-xs text-gray-300 italic">En attente</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: messages + infos */}
        <div className="col-span-5 space-y-5">
          {/* Délais */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-[#1a2f5e] text-sm mb-4">Informations clés</h3>
            <div className="space-y-3">
              {[
                { label: "Numéro de dossier", val: "DOS-2024-0127" },
                { label: "Date de soumission", val: "12/01/2024" },
                { label: "Territoire", val: "Martinique" },
                { label: "Dispositif", val: "FEDER Martinique 2021–2027" },
                { label: "Montant demandé", val: "85 000 €" },
                { label: "Expert désigné", val: "Mme Sylvie Bertrand" },
              ].map(info => (
                <div key={info.label} className="flex justify-between items-start border-b border-gray-50 pb-2">
                  <span className="text-xs text-gray-400">{info.label}</span>
                  <span className="text-xs font-semibold text-[#1a2f5e] text-right max-w-[55%]">{info.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1a2f5e] text-sm">Messages de l'administration</h3>
              <span className="bg-[#b8963e] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
            </div>
            <div className="space-y-3">
              {MESSAGES.map((msg, i) => (
                <div key={i} className={`rounded-lg p-3 ${msg.type === "admin" ? "bg-[#f4f6fb] border border-gray-100" : "bg-blue-50 border border-blue-100"}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs font-bold ${msg.type === "admin" ? "text-[#1a2f5e]" : "text-blue-600"}`}>{msg.de}</span>
                    <span className="text-xs text-gray-400">{msg.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{msg.msg}</p>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full border border-dashed border-gray-300 rounded-lg py-2.5 text-xs text-gray-400 font-medium hover:bg-gray-50 transition-colors">
              ✉ Envoyer un message
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
