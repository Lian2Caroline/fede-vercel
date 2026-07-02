import { AdminLayout } from "../shared/AdminLayout";

const RECENT_DOSSIERS = [
  { id: "DOS-2024-0131", user: "Paul Tehotu", territoire: "Polynésie fr.", dispositif: "SEFI", montant: "750 000 XPF", statut: "En instruction", date: "23/01/2024" },
  { id: "DOS-2024-0130", user: "Sarah Blandin", territoire: "Guadeloupe", dispositif: "FEDER", montant: "42 000 €", statut: "Frais émis", date: "22/01/2024" },
  { id: "DOS-2024-0129", user: "Jean-Marc Céleste", territoire: "La Réunion", dispositif: "NACRE", montant: "22 000 €", statut: "Paiement reçu", date: "21/01/2024" },
  { id: "DOS-2024-0128", user: "Amina Moussana", territoire: "Nouvelle-Calédonie", dispositif: "ACE", montant: "300 000 XPF", statut: "Soumis", date: "20/01/2024" },
  { id: "DOS-2024-0127", user: "Marie Koutoua", territoire: "Martinique", dispositif: "FEDER", montant: "85 000 €", statut: "En instruction", date: "18/01/2024" },
];

const STATUS_COLOR: Record<string, string> = {
  "Soumis": "bg-blue-50 text-blue-700 border-blue-200",
  "En instruction": "bg-amber-50 text-amber-700 border-amber-200",
  "Frais émis": "bg-orange-50 text-orange-700 border-orange-200",
  "Paiement reçu": "bg-teal-50 text-teal-700 border-teal-200",
  "Validé": "bg-green-50 text-green-700 border-green-200",
  "Refusé": "bg-red-50 text-red-700 border-red-200",
};

const STATS_BY_TERRITORY = [
  { t: "Martinique", n: 12, montant: "420 000 €" },
  { t: "La Réunion", n: 18, montant: "680 000 €" },
  { t: "Guadeloupe", n: 9, montant: "310 000 €" },
  { t: "Polynésie fr.", n: 6, montant: "4.2 M XPF" },
  { t: "Nouvelle-Cal.", n: 4, montant: "2.1 M XPF" },
];

export function AdminDashboard() {
  return (
    <AdminLayout active="dashboard">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Dossiers en cours", val: "49", sub: "+5 cette semaine", color: "text-[#0f1f3d]", bg: "bg-white" },
          { label: "En attente de validation", val: "8", sub: "Nécessitent action", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Frais émis non payés", val: "3", sub: "Total : 1 368 €", color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
          { label: "Validés ce mois", val: "17", sub: "Taux : 79%", color: "text-green-600", bg: "bg-green-50 border-green-100" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-gray-200 rounded-xl p-5 shadow-sm`}>
            <div className={`text-3xl font-extrabold ${s.color} mb-1`}>{s.val}</div>
            <div className="text-sm font-semibold text-[#0f1f3d]">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Recent dossiers */}
        <div className="col-span-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#0f1f3d] text-base">Dossiers récents</h3>
              <button className="text-xs text-[#1a2f5e] font-semibold hover:underline">Voir tout →</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#f4f6fb] border-b border-gray-100">
                <tr>
                  {["N° Dossier", "Porteur", "Territoire", "Montant", "Statut", "Date"].map(h => (
                    <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wide px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_DOSSIERS.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-semibold text-[#1a2f5e] text-xs">{d.id}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{d.user}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{d.territoire}</td>
                    <td className="px-4 py-3 font-semibold text-[#0f1f3d] text-xs">{d.montant}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[d.statut] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {d.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panels */}
        <div className="col-span-4 space-y-4">
          {/* Frais en attente */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <div className="font-bold text-orange-700 text-sm mb-3">Frais en attente de paiement</div>
            <div className="space-y-2.5">
              {[
                { user: "Sarah Blandin", montant: "456 €", date: "22/01/2024" },
                { user: "Anna Leconte", montant: "512 €", date: "20/01/2024" },
                { user: "Thomas Rivière", montant: "400 €", date: "19/01/2024" },
              ].map(f => (
                <div key={f.user} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-orange-100">
                  <div>
                    <div className="text-sm font-semibold text-[#0f1f3d]">{f.user}</div>
                    <div className="text-xs text-gray-400">{f.date}</div>
                  </div>
                  <div className="text-[#b8963e] font-extrabold text-sm">{f.montant}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-orange-200 flex justify-between text-sm font-bold text-orange-700">
              <span>Total en attente</span>
              <span>1 368 €</span>
            </div>
          </div>

          {/* By territory */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-[#0f1f3d] text-sm mb-4">Dossiers par territoire</h3>
            <div className="space-y-3">
              {STATS_BY_TERRITORY.map(s => (
                <div key={s.t}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{s.t}</span>
                    <span className="text-[#0f1f3d] font-bold">{s.n} dossiers</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1a2f5e] to-[#2e5db3] rounded-full" style={{ width: `${(s.n / 18) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-[#0f1f3d] rounded-xl p-5 text-white">
            <div className="font-bold text-sm mb-3">Actions rapides</div>
            <div className="space-y-2">
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold py-2.5 px-3 rounded-lg text-left transition-colors">
                📨 Émettre des frais d'instruction
              </button>
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold py-2.5 px-3 rounded-lg text-left transition-colors">
                ✓ Valider un dossier
              </button>
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold py-2.5 px-3 rounded-lg text-left transition-colors">
                ✉ Envoyer un message
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
