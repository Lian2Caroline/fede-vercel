import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  Send, CheckCircle, Clock, AlertCircle, Banknote,
  Info, Lock, Shield, ChevronDown, ChevronUp, Eye, CreditCard, Euro
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.VITE_API_URL ?? "";

const LIBELLES: Record<number, string> = {
  2: "Frais de dossier de transfert",
  3: "TAF (Taxe d'administration financière)",
  4: "Frais de validation",
};

interface AdminVirement {
  id: number;
  statut: string;
  etapeCourante: number;
  iban: string;
  bic: string;
  titulaire: string;
  montant: number;
  codeEmail1: string | null;
  codeFinancier2: string | null;
  codeFinancier3: string | null;
  codeFinancier4: string | null;
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
  createdAt: string;
  user: { prenom: string; nom: string; email: string; territoire: string } | null;
  dossier: { reference: string; titre: string; montantDemande: number } | null;
}

// ── Panneau explicatif ─────────────────────────────────────────────────────────

function WorkflowGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#0D1F3C] rounded-xl overflow-hidden mb-6 shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-[#FFD500]" />
          <span className="text-white font-bold text-sm">Comprendre le processus de transfert — Rôle du conseiller</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
      </button>

      {open && (
        <div className="border-t border-white/10 px-5 pb-5">
          <div className="mt-4 mb-5">
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Flux de transfert sécurisé</div>
            <div className="space-y-2 text-xs text-white/70 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5 shrink-0">①</span>
                <span><strong className="text-white">Étape 1 — Identité :</strong> Le système envoie automatiquement un code à l'utilisateur. L'utilisateur le valide. L'admin n'intervient pas.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5 shrink-0">②</span>
                <span><strong className="text-white">Étapes 2, 3, 4 — Paiement puis code :</strong> Pour chaque étape, l'admin envoie d'abord une demande de paiement (montant + messagerie + email). Après réception du paiement, l'admin confirme et envoie le code. L'utilisateur saisit le code manuellement.</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-white font-bold text-xs uppercase tracking-wider">Ce que vous pouvez faire</span>
              </div>
              <ul className="space-y-1.5 text-xs text-white/70">
                <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span> Envoyer une demande de paiement avec montant</li>
                <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span> Confirmer la réception du paiement</li>
                <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span> Envoyer le code après confirmation du paiement</li>
                <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span> Suivre l'état complet en temps réel</li>
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span className="text-white font-bold text-xs uppercase tracking-wider">Hors de votre portée</span>
              </div>
              <ul className="space-y-1.5 text-xs text-white/70">
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Envoyer le code sans confirmer le paiement</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Modifier les coordonnées bancaires</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Valider une étape à la place de l'utilisateur</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Envoyer le même code deux fois</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Carte principale d'un virement ────────────────────────────────────────────

function VirementCard({ v, onRefresh }: { v: AdminVirement; onRefresh: () => void }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [montantInputs, setMontantInputs] = useState<Record<number, string>>({});
  const [instructionsInputs, setInstructionsInputs] = useState<Record<number, string>>({});

  const etape = v.etapeCourante;

  const statutCfg = {
    en_attente: { label: "En attente", color: "text-amber-700 bg-amber-50 border-amber-200" },
    en_cours:   { label: "En cours",   color: "text-blue-700 bg-blue-50 border-blue-200" },
    complete:   { label: "Complété",   color: "text-green-700 bg-green-50 border-green-200" },
    annule:     { label: "Annulé",     color: "text-red-700 bg-red-50 border-red-200" },
  }[v.statut] ?? { label: v.statut, color: "text-gray-700 bg-gray-50 border-gray-200" };

  async function apiPost(url: string, body?: object) {
    const r = await fetch(`${BASE}${url}`, {
      method: "POST",
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error ?? "Erreur serveur");
    }
    return r.json();
  }

  async function handleDemandePaiement(round: number) {
    const montantStr = montantInputs[round] ?? "";
    const montant = parseFloat(montantStr.replace(",", "."));
    if (!montant || montant <= 0) {
      toast({ title: "Montant invalide", variant: "destructive", description: "Veuillez saisir un montant valide." });
      return;
    }
    setLoadingAction(`demande-${round}`);
    try {
      await apiPost(`/api/admin/virements/${v.id}/demande-paiement/${round}`, {
        montant,
        instructions: instructionsInputs[round] || undefined,
      });
      toast({ title: "Demande envoyée", description: `La demande de paiement a été transmise par email et messagerie.` });
      onRefresh();
    } catch (e: unknown) {
      toast({ title: "Erreur", variant: "destructive", description: (e as Error).message });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleConfirmerPaiement(round: number) {
    setLoadingAction(`confirmer-${round}`);
    try {
      await apiPost(`/api/admin/virements/${v.id}/confirmer-paiement/${round}`);
      toast({ title: "Paiement confirmé", description: "L'utilisateur a été notifié. Vous pouvez maintenant envoyer le code." });
      onRefresh();
    } catch (e: unknown) {
      toast({ title: "Erreur", variant: "destructive", description: (e as Error).message });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleEnvoyerCode(round: number) {
    setLoadingAction(`code-${round}`);
    try {
      await apiPost(`/api/admin/virements/${v.id}/envoyer-code/${round}`);
      toast({ title: "Code envoyé", description: `"${LIBELLES[round]}" transmis à ${v.user?.prenom} par email et messagerie.` });
      onRefresh();
    } catch (e: unknown) {
      toast({ title: "Erreur", variant: "destructive", description: (e as Error).message });
    } finally {
      setLoadingAction(null);
    }
  }

  function RoundRow({ round }: { round: number }) {
    const completed = !!(v[`etape${round}CompletedAt` as keyof AdminVirement]);
    const completedAt = v[`etape${round}CompletedAt` as keyof AdminVirement] as string | null;
    const isCurrent = v.statut === "en_cours" && round === etape;
    const sentAt = round >= 2 ? (v[`codeFinancierSentAt${round}` as keyof AdminVirement] as string | null) : null;
    const preCode = round >= 2 ? (v[`codeFinancier${round}` as keyof AdminVirement] as string | null) : null;
    const paiementMontant = round >= 2 ? (v[`paiementMontant${round}` as keyof AdminVirement] as number | null) : null;
    const paiementDemandeAt = round >= 2 ? (v[`paiementDemandeAt${round}` as keyof AdminVirement] as string | null) : null;
    const paiementConfirmeAt = round >= 2 ? (v[`paiementConfirmeAt${round}` as keyof AdminVirement] as string | null) : null;

    // ── Étape 1 : vérification d'identité (pas d'action admin) ──────────────
    if (round === 1) {
      if (completed) {
        return (
          <div className="flex items-center gap-3 py-2.5 border-b border-gray-100">
            <div className="w-7 h-7 rounded-full bg-[#0D1F3C] flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#0D1F3C]">Identité vérifiée</div>
              <div className="text-xs text-gray-400">
                {new Date(completedAt!).toLocaleDateString("fr-FR")} à {new Date(completedAt!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Validée ✓</span>
          </div>
        );
      }
      if (isCurrent) {
        return (
          <div className="py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#0D1F3C]">Vérification d'identité — En cours</div>
                <div className="text-xs text-blue-600">En attente que l'utilisateur valide son code email</div>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Att. utilisateur
              </span>
            </div>
            {v.codeEmail1 && (
              <div className="mt-2 ml-10 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest shrink-0">Code email :</span>
                <span className="font-mono font-extrabold text-[#0D1F3C] tracking-widest text-sm">{v.codeEmail1}</span>
                <span className="text-[10px] text-blue-400 ml-auto italic">Support uniquement</span>
              </div>
            )}
          </div>
        );
      }
      return (
        <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 opacity-35">
          <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-400">1</div>
          <div className="flex-1"><div className="text-xs font-bold text-gray-400">Vérification d'identité</div></div>
          <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded-full">À venir</span>
        </div>
      );
    }

    // ── Étapes 2, 3, 4 ──────────────────────────────────────────────────────

    // Étape complétée (code saisi par l'utilisateur)
    if (completed) {
      return (
        <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
          <div className="w-7 h-7 rounded-full bg-[#0D1F3C] flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-[#0D1F3C]">{LIBELLES[round]}</div>
            <div className="text-xs text-gray-400">
              Complété le {new Date(completedAt!).toLocaleDateString("fr-FR")} à {new Date(completedAt!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Validé ✓</span>
        </div>
      );
    }

    // Étape future (pas encore active)
    if (!isCurrent) {
      return (
        <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 opacity-35">
          <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-400">{round}</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-400">{LIBELLES[round]}</div>
          </div>
          <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded-full">À venir</span>
        </div>
      );
    }

    // ── Étape courante : pipeline en 3 sous-étapes ──────────────────────────

    // 3b. Code envoyé — en attente de saisie par l'utilisateur
    if (sentAt) {
      return (
        <div className="py-2.5 border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#0D1F3C]">{LIBELLES[round]} — Code envoyé</div>
              <div className="text-xs text-amber-600">
                Envoyé à {new Date(sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} — En attente de saisie par l'utilisateur
              </div>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Att. utilisateur
            </span>
          </div>
          {showCodes && preCode && (
            <div className="mt-2 ml-10 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest shrink-0">Code envoyé :</span>
              <span className="font-mono font-extrabold text-[#0D1F3C] tracking-widest text-sm">{preCode}</span>
            </div>
          )}
        </div>
      );
    }

    // 3a. Paiement confirmé — envoyer le code
    if (paiementConfirmeAt) {
      const isLoading = loadingAction === `code-${round}`;
      return (
        <div className="py-3 border-b border-green-200 last:border-0 bg-green-50/30 rounded-lg px-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-green-800">{LIBELLES[round]} — Paiement reçu ✓</div>
              <div className="text-xs text-green-600">
                Confirmé le {new Date(paiementConfirmeAt).toLocaleDateString("fr-FR")} — Envoyez maintenant le code
              </div>
            </div>
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full animate-pulse">⚡ Action</span>
          </div>
          {showCodes && preCode && (
            <div className="mb-3 ml-10 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest shrink-0">Code pré-généré :</span>
              <span className="font-mono font-extrabold text-[#0D1F3C] tracking-widest text-sm">{preCode}</span>
            </div>
          )}
          <button
            onClick={() => handleEnvoyerCode(round)}
            disabled={isLoading}
            className="w-full ml-10 bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-gray-300 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            style={{ width: "calc(100% - 2.5rem)" }}
          >
            <Send className="w-4 h-4" />
            {isLoading ? "Envoi en cours…" : `Envoyer le code "${LIBELLES[round]}"`}
          </button>
        </div>
      );
    }

    // 2b. Demande de paiement envoyée — en attente de réception
    if (paiementDemandeAt) {
      const montantStr = paiementMontant ? paiementMontant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) : "—";
      const isLoading = loadingAction === `confirmer-${round}`;
      return (
        <div className="py-3 border-b border-amber-200 last:border-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-amber-800">{LIBELLES[round]} — En attente de paiement</div>
              <div className="text-xs text-amber-600">
                Demande envoyée le {new Date(paiementDemandeAt).toLocaleDateString("fr-FR")} — Montant : <strong>{montantStr}</strong>
              </div>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Att. paiement
            </span>
          </div>
          <button
            onClick={() => handleConfirmerPaiement(round)}
            disabled={isLoading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            {isLoading ? "Confirmation…" : "Confirmer la réception du paiement"}
          </button>
          <p className="text-[10px] text-amber-600/70 mt-1.5">
            Cliquez uniquement après avoir reçu et vérifié le paiement de {montantStr}.
          </p>
        </div>
      );
    }

    // 2a. Aucune demande encore — formulaire montant
    const isLoading = loadingAction === `demande-${round}`;
    const montantVal = montantInputs[round] ?? "";
    const instructionsVal = instructionsInputs[round] ?? "";

    return (
      <div className="py-3 border-b border-amber-300 last:border-0 bg-amber-50/40 rounded-lg px-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Euro className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-amber-800">{LIBELLES[round]} — Demande de paiement requise</div>
            <div className="text-xs text-amber-600">Saisissez le montant et envoyez la demande à l'utilisateur</div>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full animate-pulse">⚡ Action</span>
        </div>

        <div className="ml-10 space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[180px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={montantVal}
                onChange={e => setMontantInputs(m => ({ ...m, [round]: e.target.value }))}
                className="w-full pl-7 pr-3 py-2 border border-amber-300 rounded-lg text-sm font-bold text-[#0D1F3C] focus:outline-none focus:ring-2 focus:ring-[#FFD500] bg-white"
              />
            </div>
            <span className="text-xs text-gray-400">Montant à régler (€)</span>
          </div>
          <textarea
            rows={2}
            placeholder="Instructions de paiement (optionnel — RIB, référence, etc.)"
            value={instructionsVal}
            onChange={e => setInstructionsInputs(i => ({ ...i, [round]: e.target.value }))}
            className="w-full px-3 py-2 border border-amber-200 rounded-lg text-xs text-[#0D1F3C] focus:outline-none focus:ring-2 focus:ring-[#FFD500] bg-white resize-none"
          />
        </div>

        <button
          onClick={() => handleDemandePaiement(round)}
          disabled={isLoading || !montantVal}
          className="w-full bg-[#FFD500] hover:bg-[#9A7020] disabled:bg-gray-300 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Banknote className="w-4 h-4" />
          {isLoading ? "Envoi en cours…" : "Envoyer la demande de paiement"}
        </button>
        <p className="text-[10px] text-amber-600/70 mt-1.5">
          L'utilisateur recevra le montant par email et dans sa messagerie interne.
        </p>
      </div>
    );
  }

  const needsAction = v.statut === "en_cours" && !!v.etape1CompletedAt && etape >= 2 && etape <= 4 && !v[`etape${etape}CompletedAt` as keyof AdminVirement];

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border ${needsAction ? "border-amber-300" : "border-gray-200"}`}>
      {/* En-tête */}
      <div className={`flex items-center justify-between px-5 py-4 ${needsAction ? "bg-amber-50 border-b border-amber-200" : "bg-[#f8f9fc] border-b border-gray-100"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0D1F3C]/8 border border-[#0D1F3C]/10 flex items-center justify-center font-bold text-[#0D1F3C] text-sm uppercase">
            {v.user?.prenom?.[0]}{v.user?.nom?.[0]}
          </div>
          <div>
            <div className="font-bold text-[#0D1F3C] text-sm">{v.user?.prenom} {v.user?.nom}</div>
            <div className="text-xs text-gray-500">{v.user?.email} · {v.user?.territoire}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-extrabold text-[#FFD500]">
              {v.montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </div>
            <div className="text-xs text-gray-500">{v.dossier?.reference}</div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statutCfg.color}`}>
            {statutCfg.label}
          </span>
          <button
            onClick={() => setShowCodes(s => !s)}
            title="Afficher/masquer les codes pré-générés"
            className={`p-1.5 rounded-lg border transition-colors ${showCodes ? "bg-amber-50 border-amber-300 text-amber-600" : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      </div>

      {/* Corps : 4 étapes */}
      <div className={`px-5 ${needsAction ? "bg-amber-50/30" : ""}`}>
        <div className="py-3 space-y-1">
          {RoundRow({ round: 1 })}
          {RoundRow({ round: 2 })}
          {RoundRow({ round: 3 })}
          {RoundRow({ round: 4 })}
        </div>
      </div>

      {/* Détails étendus */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 bg-gray-50/50">
          {v.statut === "complete" && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <div className="text-sm font-bold text-green-800">Transfert entièrement autorisé</div>
                <div className="text-xs text-green-700">Complété le {new Date(v.completedAt!).toLocaleDateString("fr-FR")} — 4 étapes validées</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5">
              <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Titulaire</div>
              <div className="font-semibold text-[#0D1F3C]">{v.titulaire}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5">
              <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">BIC</div>
              <div className="font-mono font-semibold text-[#0D1F3C]">{v.bic}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 md:col-span-2">
              <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">IBAN</div>
              <div className="font-mono font-semibold text-[#0D1F3C] text-xs">{v.iban}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400">Initié le {new Date(v.createdAt).toLocaleDateString("fr-FR")} à {new Date(v.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      )}
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function AdminVirements() {
  const [virements, setVirements] = useState<AdminVirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "en_cours" | "complete" | "annule">("en_cours");

  const load = useCallback(() => {
    setIsLoading(true);
    fetch(`${BASE}/api/admin/virements`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setVirements(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  // Rafraîchissement silencieux — sans setIsLoading pour ne pas perturber les saisies
  const silentRefresh = useCallback(() => {
    fetch(`${BASE}/api/admin/virements`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setVirements(data); })
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  // Actualisation automatique toutes les 8s — sans interruption des saisies
  useEffect(() => {
    const interval = setInterval(silentRefresh, 8000);
    return () => clearInterval(interval);
  }, [silentRefresh]);

  const filtered = virements.filter(v => filter === "all" || v.statut === filter);
  const enCoursCount = virements.filter(v => v.statut === "en_cours").length;
  const annuleCount = virements.filter(v => v.statut === "annule").length;
  const completeCount = virements.filter(v => v.statut === "complete").length;
  const actionRequise = virements.filter(v => {
    if (v.statut !== "en_cours" || !v.etape1CompletedAt) return false;
    const etape = v.etapeCourante;
    if (etape < 2 || etape > 4) return false;
    return true;
  }).length;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3C]">Virements</h1>
            <p className="text-gray-500 text-sm mt-0.5">Gestion des transferts de fonds sécurisés</p>
          </div>
          <div className="flex items-center gap-3">
            {actionRequise > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" /> {actionRequise} action{actionRequise > 1 ? "s" : ""} requise{actionRequise > 1 ? "s" : ""}
              </span>
            )}
            {enCoursCount > 0 && (
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
                {enCoursCount} en cours
              </span>
            )}
            <button onClick={load} className="text-xs font-bold text-gray-500 hover:text-[#0D1F3C] transition-colors px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
              Actualiser
            </button>
          </div>
        </div>

        <WorkflowGuide />

        <div className="flex gap-2 mb-4 flex-wrap">
          {([
            { key: "en_cours",  label: "En cours",   count: enCoursCount },
            { key: "complete",  label: "Complétés",  count: completeCount },
            { key: "all",       label: "Tous",       count: virements.length },
            { key: "annule",    label: "Annulés",    count: annuleCount },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                filter === key
                  ? key === "annule"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-[#0D1F3C] text-white border-[#0D1F3C]"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none ${
                  filter === key ? "bg-white/20 text-white" : key === "annule" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#FFD500] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Banknote className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Aucun virement trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(v => (
              <VirementCard key={v.id} v={v} onRefresh={load} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
