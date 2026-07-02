import { UserLayout } from "../shared/UserLayout";

const TIMELINE = [
  { date: "12/01/2024", event: "Dossier créé et soumis", status: "done" },
  { date: "15/01/2024", event: "Accusé de réception émis", status: "done" },
  { date: "18/01/2024", event: "Prise en charge par un expert agréé", status: "done" },
  { date: "22/01/2024", event: "Instruction en cours — Expertise technique", status: "active" },
  { date: "En attente", event: "Émission des frais d'instruction", status: "pending" },
  { date: "En attente", event: "Paiement et certification du dossier", status: "pending" },
  { date: "En attente", event: "Transmission à l'organisme financeur", status: "pending" },
  { date: "En attente", event: "Versement de la subvention", status: "pending" },
];

const DOCS_STATUS = [
  { nom: "Pièce d'identité", status: "validé" },
  { nom: "Justificatif de domicile", status: "validé" },
  { nom: "Description du projet", status: "validé" },
  { nom: "Plan de financement prévisionnel", status: "en attente" },
  { nom: "Relevé d'identité bancaire (RIB)", status: "manquant" },
];

export function UserDashboard() {
  return (
    <UserLayout active="dashboard">
      {/* Welcome */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1a2f5e] mb-1">Bonjour, Marie 👋</h2>
          <p className="text-gray-500 text-sm">Voici l'état de votre dossier de demande de financement non remboursable.</p>
        </div>
        <button className="bg-[#1a2f5e] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0f1f3d] transition-colors">
          + Nouveau dossier
        </button>
      </div>

      {/* Alert - frais en attente */}
      <div className="bg-[#fff8e8] border border-[#e8d9a0] rounded-xl p-4 flex items-start gap-3 mb-6">
        <span className="text-[#b8963e] text-xl mt-0.5">⚠</span>
        <div>
          <div className="font-bold text-[#7a5a2a] text-sm">Action requise — Frais d'instruction</div>
          <div className="text-[#7a5a2a]/80 text-sm mt-0.5">Des frais d'instruction ont été émis par l'administration pour votre dossier <strong>DOS-2024-0127</strong>. Veuillez procéder au paiement pour continuer le traitement.</div>
          <button className="mt-2 bg-[#b8963e] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#d4b96a] transition-colors">Voir et payer</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Dossier status card + KPIs */}
        <div className="col-span-8 space-y-5">
          {/* Dossier principal */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-extrabold text-[#1a2f5e] text-base">Dossier DOS-2024-0127</h3>
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full">En instruction</span>
                </div>
                <p className="text-gray-500 text-sm">Projet de création de restaurant — Martinique • FEDER Martinique</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#1a2f5e]">85 000 €</div>
                <div className="text-xs text-gray-400">Montant demandé</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Progression du dossier</span>
                <span className="font-semibold text-[#1a2f5e]">Étape 4 / 8</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1a2f5e] to-[#2e5db3] rounded-full" style={{ width: "45%" }} />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="text-sm text-[#1a2f5e] font-semibold border border-[#1a2f5e]/20 px-4 py-2 rounded-lg hover:bg-[#1a2f5e]/5 transition-colors">Voir le dossier</button>
              <button className="text-sm text-gray-500 font-semibold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Historique</button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-[#1a2f5e] text-base mb-5">Suivi détaillé du traitement</h3>
            <div className="space-y-0">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {/* Line */}
                  {i < TIMELINE.length - 1 && (
                    <div className={`absolute left-[17px] top-7 bottom-0 w-px ${item.status === "done" ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                  {/* Dot */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 text-sm ${
                    item.status === "done" ? "bg-green-100 text-green-600 border-2 border-green-400" :
                    item.status === "active" ? "bg-[#1a2f5e] text-white border-2 border-[#1a2f5e] animate-pulse" :
                    "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}>
                    {item.status === "done" ? "✓" : item.status === "active" ? "●" : "○"}
                  </div>
                  <div className="pb-5 flex-1">
                    <div className="font-semibold text-sm text-gray-800">{item.event}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: stats + docs */}
        <div className="col-span-4 space-y-5">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Dossiers soumis", val: "1", color: "text-[#1a2f5e]" },
              { label: "Documents fournis", val: "3/5", color: "text-amber-600" },
              { label: "Messages reçus", val: "2", color: "text-blue-600" },
              { label: "Frais à payer", val: "1", color: "text-orange-600" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-gray-400 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Documents status */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#1a2f5e] text-sm">Mes documents</h3>
              <button className="text-xs text-[#2e5db3] font-semibold">Gérer</button>
            </div>
            <div className="space-y-2.5">
              {DOCS_STATUS.map(d => (
                <div key={d.nom} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{d.nom}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    d.status === "validé" ? "bg-green-50 text-green-700 border-green-200" :
                    d.status === "en attente" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-red-50 text-red-600 border-red-200"
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full border border-dashed border-gray-300 rounded-lg py-2.5 text-xs text-gray-400 font-medium hover:bg-gray-50 transition-colors">
              + Télécharger un document
            </button>
          </div>

          {/* Contact */}
          <div className="bg-[#1a2f5e] rounded-xl p-5 text-white">
            <div className="text-sm font-bold mb-1">Expert en charge</div>
            <div className="font-extrabold text-base mb-0.5">Mme. Sylvie Bertrand</div>
            <div className="text-white/50 text-xs mb-4">Experte agréée — FEDER Martinique</div>
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              ✉ Envoyer un message
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
