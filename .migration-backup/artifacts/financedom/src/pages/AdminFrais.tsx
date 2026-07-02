import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminDossiers, useListAdminFrais, useEmitFrais } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle } from "lucide-react";

const BASE_ITEMS = [
  { id: "instruction", label: "Frais d'instruction administrative", desc: "Étude de recevabilité et vérification de conformité réglementaire.", ht: 120 },
  { id: "expertise", label: "Expertise technique et financière", desc: "Analyse approfondie de la viabilité économique par un expert agréé.", ht: 180 },
  { id: "certification", label: "Frais de certification et de montage du dossier", desc: "Certification de la conformité du dossier et formalisation du rapport.", ht: 80 },
];

export default function AdminFrais() {
  const [selectedDossierId, setSelectedDossierId] = useState<number | null>(null);
  const [items, setItems] = useState(BASE_ITEMS.map(i => ({ ...i, selected: true, custom: i.ht })));
  const [sent, setSent] = useState(false);

  const { data: dossiers = [] } = useListAdminDossiers();
  const { data: fraisList = [] } = useListAdminFrais();
  
  const emitMutation = useEmitFrais();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const eligibleDossiers = dossiers.filter(d => d.statut !== "Brouillon" && d.statut !== "Refusé");
  const selectedDossier = eligibleDossiers.find(d => d.id === selectedDossierId);

  const totalHT = items.filter(i => i.selected).reduce((acc, i) => acc + i.custom, 0);
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;

  const handleEmit = async () => {
    if (!selectedDossierId) return;

    try {
      await emitMutation.mutateAsync({
        data: {
          dossierId: selectedDossierId,
          echeanceDays: 30,
          lignes: items.filter(i => i.selected).map(i => ({
            label: i.label,
            description: i.desc,
            montantHT: i.custom
          }))
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/frais"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dossiers"] });
      setSent(true);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'émettre l'avis de frais.", variant: "destructive" });
    }
  };

  if (sent) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white border border-gray-200 rounded-xl shadow-sm p-10 max-w-md w-full">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0f1f3d] mb-2">Avis de frais émis</h2>
            <p className="text-gray-500 text-sm mb-2">L'avis de frais a été envoyé au porteur du dossier par e-mail.</p>
            <p className="text-gray-400 text-xs mb-8">Il peut désormais procéder au paiement depuis son espace personnel.</p>
            <button 
              onClick={() => { setSent(false); setSelectedDossierId(null); }} 
              className="bg-[#0f1f3d] text-white font-bold px-6 py-3 rounded-lg text-sm hover:bg-[#1a2f5e] transition-colors w-full"
            >
              Émettre un autre avis
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#0f1f3d] text-base mb-4">1. Sélectionner le dossier</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {eligibleDossiers.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">Aucun dossier éligible</div>
              ) : eligibleDossiers.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDossierId(d.id)}
                  className={`w-full text-left px-4 py-4 rounded-xl border transition-colors ${selectedDossierId === d.id ? "border-[#0f1f3d] bg-[#0f1f3d]/5" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#0f1f3d] text-sm">{d.reference}</div>
                      <div className="text-gray-600 text-xs mt-0.5">{d.user?.prenom} {d.user?.nom} — {d.territoire}</div>
                      <div className="text-gray-400 text-xs">{d.dispositif}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#0f1f3d] font-extrabold text-sm">{d.montantDemande.toLocaleString("fr-FR")} €</div>
                      <div className="text-xs text-gray-400">Montant demandé</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#0f1f3d] text-base mb-1">2. Configurer les postes de frais</h3>
            <p className="text-gray-400 text-xs mb-5">Sélectionnez et ajustez les postes à inclure dans l'avis de frais. Les montants sont en euros HT.</p>
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={item.id} className={`border rounded-xl p-4 transition-colors ${item.selected ? "border-[#0f1f3d]/20 bg-[#f4f6fb]" : "border-gray-100 bg-white opacity-60"}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={e => {
                        const updated = [...items];
                        updated[i] = { ...item, selected: e.target.checked };
                        setItems(updated);
                      }}
                      className="mt-1 accent-[#0f1f3d] w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-[#0f1f3d] text-sm mb-0.5">{item.label}</div>
                      <p className="text-gray-500 text-xs leading-relaxed mb-3">{item.desc}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Montant HT :</span>
                        <input
                          type="number"
                          value={item.custom}
                          disabled={!item.selected}
                          onChange={e => {
                            const updated = [...items];
                            updated[i] = { ...item, custom: parseInt(e.target.value) || 0 };
                            setItems(updated);
                          }}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-24 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 disabled:bg-gray-50 disabled:text-gray-300"
                        />
                        <span className="text-xs text-gray-400">€</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#0f1f3d] text-base mb-4">3. Confirmer et envoyer</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm">
              <div className="font-bold text-amber-700 mb-1 flex items-center gap-2">⚠ Vérification avant envoi</div>
              <p className="text-amber-700/80 text-xs leading-relaxed">
                L'avis de frais sera envoyé par e-mail à {selectedDossier ? <strong>{selectedDossier.user?.prenom} {selectedDossier.user?.nom}</strong> : "l'utilisateur sélectionné"} et sera visible dans son espace personnel.
              </p>
            </div>
            <button
              onClick={handleEmit}
              disabled={!selectedDossierId || emitMutation.isPending || totalHT === 0}
              className="w-full bg-[#0f1f3d] hover:bg-[#1a2f5e] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" /> {emitMutation.isPending ? "Émission..." : "Émettre et envoyer l'avis de frais"}
            </button>
          </div>
        </div>

        <div className="md:col-span-4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sticky top-0">
            <div className="font-bold text-[#0f1f3d] text-sm mb-4">Aperçu de la facture</div>
            <div className="space-y-2 text-sm">
              {items.filter(i => i.selected).map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-gray-600 flex-1 pr-2 leading-tight">{item.label}</span>
                  <span className="font-semibold text-[#0f1f3d] whitespace-nowrap">{item.custom.toFixed(2)} €</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-xs text-gray-500"><span>Sous-total HT</span><span className="font-semibold">{totalHT.toFixed(2)} €</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span>TVA 20%</span><span className="font-semibold">{tva.toFixed(2)} €</span></div>
                <div className="flex justify-between text-sm font-extrabold text-[#0f1f3d] border-t border-gray-200 pt-1.5 mt-1">
                  <span>TOTAL TTC</span>
                  <span className="text-[#b8963e]">{totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="font-bold text-[#0f1f3d] text-sm mb-4">Historique récent</div>
            <div className="space-y-3">
              {fraisList.slice(0, 5).map(f => (
                <div key={f.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs font-bold text-[#0f1f3d]">{f.reference}</div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${f.statut === "paye" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                      {f.statut === "paye" ? "Payé" : f.statut === "annule" ? "Annulé" : "En attente"}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-600">Dossier: {f.dossierId}</div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-gray-400">Émis: {new Date(f.createdAt).toLocaleDateString("fr-FR")}</span>
                    <span className="text-[10px] font-bold text-[#0f1f3d]">{f.montantTTC.toFixed(2)} €</span>
                  </div>
                </div>
              ))}
              {fraisList.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">Aucun frais émis</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
