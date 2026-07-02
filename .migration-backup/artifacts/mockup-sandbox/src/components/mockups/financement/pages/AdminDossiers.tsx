import { useState } from "react";
import { AdminLayout } from "../shared/AdminLayout";

const ALL_DOSSIERS = [
  { id: "DOS-2024-0131", user: "Paul Tehotu", email: "p.tehotu@mail.pf", territoire: "Polynésie française", dispositif: "SEFI Polynésie", montant: "750 000 XPF", statut: "En instruction", date: "23/01/2024", expert: "M. Henri Faaumu" },
  { id: "DOS-2024-0130", user: "Sarah Blandin", email: "s.blandin@gmail.com", territoire: "Guadeloupe", dispositif: "FEDER Guadeloupe", montant: "42 000 €", statut: "Frais émis", date: "22/01/2024", expert: "Mme Anne-Marie Lacroix" },
  { id: "DOS-2024-0129", user: "Jean-Marc Céleste", email: "jm.celeste@pro.re", territoire: "La Réunion", dispositif: "NACRE Réunion", montant: "22 000 €", statut: "Paiement reçu", date: "21/01/2024", expert: "M. Claude Payet" },
  { id: "DOS-2024-0128", user: "Amina Moussana", email: "a.moussana@nc.fr", territoire: "Nouvelle-Calédonie", dispositif: "ACE Entrepreneuriat", montant: "300 000 XPF", statut: "Soumis", date: "20/01/2024", expert: "—" },
  { id: "DOS-2024-0127", user: "Marie Koutoua", email: "m.koutoua@gmail.com", territoire: "Martinique", dispositif: "FEDER Martinique", montant: "85 000 €", statut: "En instruction", date: "18/01/2024", expert: "Mme Sylvie Bertrand" },
  { id: "DOS-2024-0126", user: "Thomas Rivière", email: "t.riviere@orange.re", territoire: "La Réunion", dispositif: "FSE+ Réunion", montant: "15 000 €", statut: "Frais émis", date: "17/01/2024", expert: "M. Claude Payet" },
  { id: "DOS-2024-0125", user: "Claire Beaumont", email: "c.beaumont@mq.fr", territoire: "Martinique", dispositif: "FSE+ Emploi", montant: "38 000 €", statut: "Validé", date: "12/01/2024", expert: "Mme Sylvie Bertrand" },
  { id: "DOS-2024-0124", user: "Félix Kanako", email: "f.kanako@mail.nc", territoire: "Nouvelle-Calédonie", dispositif: "FIDES", montant: "1 200 000 XPF", statut: "Validé", date: "10/01/2024", expert: "M. Jean-Pierre Wamytan" },
];

const STATUS_COLOR: Record<string, string> = {
  "Soumis": "bg-blue-50 text-blue-700 border-blue-200",
  "En instruction": "bg-amber-50 text-amber-700 border-amber-200",
  "Frais émis": "bg-orange-50 text-orange-700 border-orange-200",
  "Paiement reçu": "bg-teal-50 text-teal-700 border-teal-200",
  "Validé": "bg-green-50 text-green-700 border-green-200",
  "Refusé": "bg-red-50 text-red-700 border-red-200",
};

export function AdminDossiers() {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterTerr, setFilterTerr] = useState("Tous");
  const [selected, setSelected] = useState<typeof ALL_DOSSIERS[0] | null>(null);

  const filtered = ALL_DOSSIERS.filter(d => {
    const matchSearch = d.id.toLowerCase().includes(search.toLowerCase()) || d.user.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "Tous" || d.statut === filterStatut;
    const matchTerr = filterTerr === "Tous" || d.territoire === filterTerr;
    return matchSearch && matchStatut && matchTerr;
  });

  return (
    <AdminLayout active="dossiers">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-48 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un dossier ou porteur..."
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20 focus:border-[#1a2f5e] bg-white"
          />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20">
          {["Tous", "Soumis", "En instruction", "Frais émis", "Paiement reçu", "Validé", "Refusé"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterTerr} onChange={e => setFilterTerr(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20">
          {["Tous", "Martinique", "Guadeloupe", "La Réunion", "Nouvelle-Calédonie", "Polynésie française"].map(t => <option key={t}>{t}</option>)}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} dossier(s)</span>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Table */}
        <div className={selected ? "col-span-7" : "col-span-12"}>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f4f6fb] border-b border-gray-200">
                <tr>
                  {["N° Dossier", "Porteur", "Territoire / Dispositif", "Montant", "Statut", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wide px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(d => (
                  <tr key={d.id} onClick={() => setSelected(selected?.id === d.id ? null : d)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${selected?.id === d.id ? "bg-[#1a2f5e]/5" : ""}`}>
                    <td className="px-4 py-3 font-semibold text-[#1a2f5e] text-xs">{d.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-800">{d.user}</div>
                      <div className="text-xs text-gray-400">{d.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-gray-700">{d.territoire}</div>
                      <div className="text-xs text-gray-400">{d.dispositif}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#0f1f3d] text-xs">{d.montant}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[d.statut] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {d.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{d.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={e => { e.stopPropagation(); setSelected(d); }} className="text-xs border border-gray-200 text-gray-500 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors">Voir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="col-span-5">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-0">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-[#0f1f3d] text-sm">{selected.id}</div>
                  <div className={`mt-1 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLOR[selected.statut]}`}>{selected.statut}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="p-5 space-y-3 text-sm">
                {[
                  { l: "Porteur", v: selected.user },
                  { l: "Email", v: selected.email },
                  { l: "Territoire", v: selected.territoire },
                  { l: "Dispositif", v: selected.dispositif },
                  { l: "Montant demandé", v: selected.montant },
                  { l: "Soumis le", v: selected.date },
                  { l: "Expert désigné", v: selected.expert },
                ].map(r => (
                  <div key={r.l} className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-400">{r.l}</span>
                    <span className="text-xs font-semibold text-[#0f1f3d] text-right max-w-[55%]">{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5 space-y-2">
                <div className="font-semibold text-[#0f1f3d] text-xs mb-2">Actions disponibles</div>
                <button className="w-full bg-[#0f1f3d] hover:bg-[#1a2f5e] text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
                  📨 Émettre les frais d'instruction
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
                  ✓ Valider le dossier
                </button>
                <button className="w-full border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  ✉ Envoyer un message
                </button>
                <button className="w-full border border-red-200 text-red-600 text-xs font-semibold py-2.5 rounded-lg hover:bg-red-50 transition-colors">
                  ✕ Refuser le dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
