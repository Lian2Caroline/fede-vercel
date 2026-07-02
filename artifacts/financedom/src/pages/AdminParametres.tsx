import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Save, Building2, CheckCircle, ChevronDown, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BANQUES } from "@/lib/banques";

const BASE = import.meta.env.VITE_API_URL ?? "";

interface Coordonnees {
  id: number;
  beneficiaire: string;
  iban: string;
  bic: string;
  banque: string;
  domiciliation: string;
  libelleVirement: string;
}

export default function AdminParametres() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingBanque, setSavingBanque] = useState(false);
  const [savedBanque, setSavedBanque] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savedContact, setSavedContact] = useState(false);
  const [banqueSlug, setBanqueSlug] = useState("");
  const [contactForm, setContactForm] = useState({ telephone: "", email: "", adresse: "" });
  const [form, setForm] = useState<Omit<Coordonnees, "id">>({
    beneficiaire: "",
    iban: "",
    bic: "",
    banque: "",
    domiciliation: "",
    libelleVirement: "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/api/admin/coordonnees-bancaires`, { credentials: "include" })
        .then(r => r.ok ? r.json() : null),
      fetch(`${BASE}/api/admin/settings/banque-partenaire`, { credentials: "include" })
        .then(r => r.ok ? r.json() : null),
      fetch(`${BASE}/api/admin/settings/contact`, { credentials: "include" })
        .then(r => r.ok ? r.json() : null),
    ]).then(([coords, setting, contact]) => {
      if (coords) setForm({
        beneficiaire: coords.beneficiaire,
        iban: coords.iban,
        bic: coords.bic,
        banque: coords.banque,
        domiciliation: coords.domiciliation,
        libelleVirement: coords.libelleVirement,
      });
      if (setting) setBanqueSlug(setting.value ?? "");
      if (contact) setContactForm({ telephone: contact.telephone ?? "", email: contact.email ?? "", adresse: contact.adresse ?? "" });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSaveContact = async () => {
    setSavingContact(true);
    try {
      const r = await fetch(`${BASE}/api/admin/settings/contact`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (!r.ok) throw new Error();
      setSavedContact(true);
      setTimeout(() => setSavedContact(false), 3000);
      toast({ title: "Enregistré", description: "Coordonnées de contact mises à jour sur le site, les PDFs et l'application mobile." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les coordonnées de contact.", variant: "destructive" });
    } finally {
      setSavingContact(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${BASE}/api/admin/coordonnees-bancaires`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: "Enregistré", description: "Coordonnées bancaires mises à jour." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les coordonnées.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBanque = async () => {
    setSavingBanque(true);
    try {
      const r = await fetch(`${BASE}/api/admin/settings/banque-partenaire`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: banqueSlug }),
      });
      if (!r.ok) throw new Error();
      setSavedBanque(true);
      setTimeout(() => setSavedBanque(false), 3000);
      toast({ title: "Banque partenaire enregistrée", description: "L'affichage dans l'espace utilisateur est mis à jour." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer la banque partenaire.", variant: "destructive" });
    } finally {
      setSavingBanque(false);
    }
  };

  const field = (key: keyof typeof form, label: string, placeholder?: string, hint?: string) => (
    <div>
      <label className="block text-xs font-semibold text-[#0f1f3d] uppercase tracking-wide mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <input
        type="text"
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono text-[#0f1f3d] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/30 focus:border-[#FFD500] bg-white"
      />
    </div>
  );

  const selectedBanque = BANQUES.find(b => b.slug === banqueSlug);

  const grouped = BANQUES.reduce<Record<string, typeof BANQUES>>((acc, b) => {
    if (!acc[b.pays]) acc[b.pays] = [];
    acc[b.pays].push(b);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl font-extrabold text-[#0f1f3d]">Paramètres</h1>
          <p className="text-gray-500 text-sm mt-1">Configurez les coordonnées de contact, les coordonnées bancaires et la banque partenaire de transfert.</p>
        </div>

        {/* ── Coordonnées de contact ────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f1f3d] to-[#1a3060] px-6 py-4 flex items-center gap-3">
            <Phone className="w-5 h-5 text-[#FFD500]" />
            <div>
              <h2 className="text-white font-bold text-sm">Coordonnées de contact</h2>
              <p className="text-white/50 text-xs">S'affichent dynamiquement dans le footer du site, les PDFs générés et l'application mobile.</p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Chargement…</div>
          ) : (
            <div className="p-6 space-y-4">
              {[
                { key: "telephone" as const, label: "Numéro de téléphone", icon: <Phone className="w-4 h-4 text-[#FFD500]" />, placeholder: "+33 (0) 800 123 456" },
                { key: "email" as const, label: "Email de support", icon: <Mail className="w-4 h-4 text-[#FFD500]" />, placeholder: "support@fede-financement.com" },
                { key: "adresse" as const, label: "Adresse / disponibilité", icon: <MapPin className="w-4 h-4 text-[#FFD500]" />, placeholder: "Disponible pour toute l'Europe" },
              ].map(({ key, label, icon, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-[#0f1f3d] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    {icon} {label}
                  </label>
                  <input
                    type="text"
                    value={contactForm[key]}
                    onChange={e => setContactForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0f1f3d] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/30 focus:border-[#FFD500] bg-white"
                  />
                </div>
              ))}
              <div className="pt-1">
                <button
                  onClick={handleSaveContact}
                  disabled={savingContact}
                  className="flex items-center gap-2 bg-[#FFD500] hover:bg-[#9a7024] disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  {savedContact
                    ? <><CheckCircle className="w-4 h-4" /> Enregistré — mis à jour partout</>
                    : <><Save className="w-4 h-4" /> {savingContact ? "Enregistrement…" : "Enregistrer les coordonnées"}</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Banque partenaire de transfert ─────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f1f3d] to-[#1a3060] px-6 py-4 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#FFD500]" />
            <div>
              <h2 className="text-white font-bold text-sm">Banque partenaire de transfert</h2>
              <p className="text-white/50 text-xs">S'affiche dans l'espace "Mes Fonds" de l'utilisateur lors du processus de virement.</p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Chargement…</div>
          ) : (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0f1f3d] uppercase tracking-wide mb-2">
                  Sélectionner la banque
                </label>
                <div className="relative">
                  <select
                    value={banqueSlug}
                    onChange={e => setBanqueSlug(e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#0f1f3d] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/30 focus:border-[#FFD500] bg-white pr-10 font-medium"
                  >
                    <option value="">— Aucune banque sélectionnée —</option>
                    {Object.entries(grouped).map(([pays, banques]) => (
                      <optgroup key={pays} label={`🌍 ${pays}`}>
                        {banques.map(b => (
                          <option key={b.slug} value={b.slug}>{b.nom}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Aperçu */}
              {selectedBanque && (
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Aperçu dans l'espace utilisateur</p>
                  </div>
                  <div className="p-4 flex items-center gap-4" style={{ background: selectedBanque.couleur + "12" }}>
                    <div
                      className="w-28 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-sm"
                      dangerouslySetInnerHTML={{ __html: selectedBanque.logo }}
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0f1f3d]">{selectedBanque.nom}</p>
                      <p className="text-[11px] text-gray-400">{selectedBanque.pays}</p>
                      <p className="text-[10px] text-gray-400 mt-1 italic">Le transfert est assuré par cet établissement bancaire</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-1">
                <button
                  onClick={handleSaveBanque}
                  disabled={savingBanque}
                  className="flex items-center gap-2 bg-[#FFD500] hover:bg-[#9a7024] disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  {savedBanque
                    ? <><CheckCircle className="w-4 h-4" /> Enregistré</>
                    : <><Save className="w-4 h-4" /> {savingBanque ? "Enregistrement…" : "Enregistrer la banque"}</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Coordonnées bancaires FEDE ──────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#0f1f3d] px-6 py-4 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#FFD500]" />
            <div>
              <h2 className="text-white font-bold text-sm">Coordonnées bancaires FEDE</h2>
              <p className="text-white/50 text-xs">Ces coordonnées apparaissent dans les emails de frais d'instruction et dans l'espace paiement des porteurs.</p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Chargement…</div>
          ) : (
            <div className="p-6 space-y-4">
              {field("beneficiaire", "Bénéficiaire", "FEDE — Service de gestion des financements")}
              {field("iban", "IBAN", "FR76 3000 6000 0112 3456 7890 189")}
              {field("bic", "BIC / SWIFT", "AGRIFRPP")}
              {field("banque", "Banque", "Crédit Agricole")}
              {field("domiciliation", "Domiciliation", "Paris, France")}
              {field(
                "libelleVirement",
                "Libellé de virement (modèle)",
                "FRAIS-[REF_FRAIS] — [REF_DOSSIER]",
                "Les variables [REF_FRAIS] et [REF_DOSSIER] sont remplacées automatiquement dans l'email."
              )}

              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#0f1f3d] hover:bg-[#1a2f5e] disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  {saved
                    ? <><CheckCircle className="w-4 h-4 text-green-400" /> Enregistré</>
                    : <><Save className="w-4 h-4" /> {saving ? "Enregistrement…" : "Enregistrer"}</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Les modifications s'appliquent immédiatement aux nouveaux emails et à l'espace paiement des porteurs.
        </p>
      </div>
    </AdminLayout>
  );
}
