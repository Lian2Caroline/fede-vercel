import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  BookOpen, LayoutDashboard, FolderOpen, CreditCard, Banknote, Users, Star,
  ChevronRight, Shield, LogIn, CheckCircle, AlertCircle, Info, Settings,
  ArrowRight, Rocket, Clock, FileCheck, MessageSquare, BadgeCheck, Landmark,
  CircleDot,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Step { num: number; title: string; desc: string }
interface Section {
  id: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  subtitle: string;
  steps: Step[];
  tips?: string[];
}

// ── Contenu ───────────────────────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  { icon: FileCheck,    color: "#7C3AED", label: "Dossier déposé",        desc: "Le porteur crée son dossier et charge ses documents." },
  { icon: MessageSquare,color: "#0891B2", label: "Accusé de réception",   desc: "Vous accusez réception — le dossier passe en instruction." },
  { icon: BadgeCheck,   color: "#059669", label: "Rapport d'éligibilité", desc: "Vous envoyez le rapport analysant l'éligibilité du projet." },
  { icon: FileCheck,    color: "#D97706", label: "Contrat de mission",    desc: "Vous envoyez le contrat ; le porteur le signe et le renvoie." },
  { icon: CreditCard,   color: "#DC2626", label: "Frais émis",            desc: "Vous émettez la facture de frais (456 € TTC) depuis le dossier." },
  { icon: Landmark,     color: "#0D1F3C", label: "Décision favorable",    desc: "Le financement est accordé — notification envoyée au porteur." },
  { icon: Banknote,     color: "#16A34A", label: "Virement des fonds",    desc: "Vous créez et suivez le virement jusqu'au versement final." },
];

const SECTIONS: Section[] = [
  {
    id: "demarrage",
    icon: Rocket,
    color: "#0D1F3C",
    bg: "#EEF1F8",
    title: "Premier démarrage — par où commencer",
    subtitle: "Checklist initiale avant de traiter des dossiers",
    steps: [
      { num: 1, title: "Configurer les coordonnées bancaires", desc: "Allez dans Paramètres → onglet « Coordonnées bancaires » et renseignez IBAN, BIC, bénéficiaire et libellé de virement (ex. FRAIS INSTRUCTION [REF_FRAIS]). Ces informations s'insèrent automatiquement dans chaque email de facture." },
      { num: 2, title: "Vérifier l'adresse e-mail d'envoi", desc: "Dans Paramètres → onglet « Contact & notifications », confirmez que l'email support (support@fede-financement.com) et le numéro de téléphone sont corrects. Ils apparaissent dans tous les documents générés." },
      { num: 3, title: "Tester l'envoi d'email", desc: "Créez un dossier de test et effectuez un accusé de réception. Vérifiez que l'email arrive bien chez le destinataire, sans spam. Si ce n'est pas le cas, contactez l'équipe technique." },
      { num: 4, title: "Vérifier les avis en attente", desc: "Allez dans Modération des avis et approuvez ou rejetez les témoignages en attente avant que la plateforme soit ouverte au public." },
    ],
    tips: [
      "Le libellé de virement doit contenir [REF_FRAIS] pour que la référence de facture s'insère automatiquement.",
      "Sans coordonnées bancaires configurées, les emails de frais n'incluront pas les informations de paiement.",
    ],
  },
  {
    id: "connexion",
    icon: LogIn,
    color: "#0D1F3C",
    bg: "#EEF1F8",
    title: "Connexion sécurisée",
    subtitle: "Accéder à l'espace conseillers",
    steps: [
      { num: 1, title: "Ouvrir la page de connexion", desc: "Rendez-vous sur l'URL de l'espace conseillers FEDE et cliquez sur « Connexion »." },
      { num: 2, title: "Saisir vos identifiants", desc: "Entrez votre adresse e-mail admin et votre mot de passe." },
      { num: 3, title: "Vérification TOTP (si activée)", desc: "Ouvrez votre application d'authentification (Google Authenticator ou Authy) et saisissez le code à 6 chiffres affiché. Le code change toutes les 30 secondes — utilisez-le immédiatement." },
      { num: 4, title: "Session active", desc: "La session admin est valable 8 heures. Au-delà, une nouvelle vérification est requise automatiquement." },
    ],
    tips: [
      "Ne partagez jamais votre code TOTP.",
      "Si le code est refusé, vérifiez que l'heure de votre téléphone est bien synchronisée (Paramètres → Date et heure → Automatique).",
    ],
  },
  {
    id: "tableau-de-bord",
    icon: LayoutDashboard,
    color: "#2563EB",
    bg: "#EFF6FF",
    title: "Tableau de bord",
    subtitle: "Vue d'ensemble de l'activité",
    steps: [
      { num: 1, title: "Consulter les statistiques", desc: "La page d'accueil affiche le nombre total de dossiers, les dossiers en instruction, les frais perçus ce mois et les validations récentes." },
      { num: 2, title: "Dossiers récents", desc: "La liste des derniers dossiers soumis est visible directement. Cliquez sur un dossier pour y accéder immédiatement." },
      { num: 3, title: "Badge messages non lus", desc: "L'icône « Dossiers & Messagerie » dans la barre de navigation affiche un badge rouge si des messages de porteurs n'ont pas encore été lus. Traitez-les en priorité." },
    ],
  },
  {
    id: "dossiers",
    icon: FolderOpen,
    color: "#7C3AED",
    bg: "#F5F3FF",
    title: "Dossiers & Messagerie",
    subtitle: "Gérer les demandes de financement",
    steps: [
      { num: 1, title: "Lister et filtrer", desc: "La page affiche tous les dossiers avec leur statut, territoire, montant demandé et date de dépôt. Utilisez les onglets ou filtres pour isoler les dossiers « En instruction », « En attente de signature », etc." },
      { num: 2, title: "Ouvrir un dossier", desc: "Cliquez sur « Voir » pour accéder au détail complet : informations du porteur, description du projet, documents déposés et historique des événements." },
      { num: 3, title: "Faire avancer le statut", desc: "Dans le panneau de droite, les boutons d'action suivent l'ordre logique du traitement : Accuser réception → Envoyer l'éligibilité → Envoyer le contrat → Marquer signé → Décision favorable → Confirmer paiement. Chaque action génère un email automatique au porteur." },
      { num: 4, title: "Messagerie intégrée", desc: "Chaque dossier dispose d'un fil de messages avec le porteur. Rédigez votre message dans la zone de texte et envoyez. Le porteur est notifié par email dans son espace client." },
      { num: 5, title: "Consulter les documents", desc: "L'onglet « Documents » liste toutes les pièces déposées par le porteur. Cliquez sur un document pour le visualiser ou le télécharger avant de prendre votre décision." },
      { num: 6, title: "Émettre des frais depuis le dossier", desc: "Cliquez sur « Émettre des frais » dans le panneau latéral pour créer une ligne de facturation. Renseignez le montant (456 € TTC standard), l'intitulé et l'échéance (30 jours recommandés). Un email est envoyé automatiquement au porteur." },
    ],
    tips: [
      "Les statuts suivent un ordre logique mais peuvent être ajustés manuellement si nécessaire.",
      "Un dossier sans documents obligatoires déposés ne peut pas avancer vers la phase de contrat.",
      "Les messages non lus sont indiqués par un badge rouge dans la navigation — vérifiez-les quotidiennement.",
    ],
  },
  {
    id: "frais",
    icon: CreditCard,
    color: "#D97706",
    bg: "#FFFBEB",
    title: "Frais d'instruction",
    subtitle: "Suivi des paiements porteurs",
    steps: [
      { num: 1, title: "Accéder à la liste des frais", desc: "La page liste toutes les lignes de frais émises, avec le statut (En attente / Payé), le montant TTC, la référence de facture et l'échéance." },
      { num: 2, title: "Filtrer par statut", desc: "Utilisez les onglets « En attente » et « Payés » pour trier rapidement et identifier les factures qui nécessitent un suivi." },
      { num: 3, title: "Vérifier le virement reçu", desc: "Lorsqu'un porteur vous informe avoir effectué son virement, vérifiez votre relevé bancaire que le montant et le libellé correspondent (la référence de facture, ex. FI-2026-XXXXX)." },
      { num: 4, title: "Marquer payé", desc: "Une fois le virement confirmé sur votre compte, cliquez sur « Marquer payé » sur la ligne concernée. Le statut du dossier se met à jour et le porteur reçoit une confirmation." },
    ],
    tips: [
      "Les frais d'instruction standard FEDE sont de 456 € TTC (Article L1611-2 CGCT).",
      "L'échéance recommandée est de 30 jours après émission.",
      "Un frais peut être supprimé uniquement avant d'être marqué payé.",
    ],
  },
  {
    id: "virements",
    icon: Banknote,
    color: "#059669",
    bg: "#ECFDF5",
    title: "Virements des fonds",
    subtitle: "Suivi des versements aux porteurs",
    steps: [
      { num: 1, title: "Accéder à la liste", desc: "Cette section liste tous les ordres de virement associés aux dossiers dont le financement a été accordé (statut « Favorable »)." },
      { num: 2, title: "Créer un virement", desc: "Depuis un dossier au statut « Favorable », cliquez sur « Créer un virement » et renseignez le montant, le libellé et les coordonnées bancaires du porteur." },
      { num: 3, title: "Suivre les étapes de déblocage", desc: "Chaque virement passe par plusieurs étapes progressives (ex. 25%, 50%, 75%, 100%). Mettez à jour l'étape au fil de l'exécution bancaire réelle. Le porteur est notifié à chaque déblocage." },
      { num: 4, title: "Clôturer le virement", desc: "Une fois la dernière étape validée, le dossier passe automatiquement au statut « Versé ». Le porteur reçoit une notification de clôture." },
    ],
    tips: [
      "Le pourcentage affiché au porteur dans son espace correspond directement à l'étape renseignée ici.",
    ],
  },
  {
    id: "utilisateurs",
    icon: Users,
    color: "#0891B2",
    bg: "#ECFEFF",
    title: "Utilisateurs",
    subtitle: "Consulter et gérer les comptes porteurs",
    steps: [
      { num: 1, title: "Consulter la liste des comptes", desc: "La page affiche tous les comptes inscrits avec leur nom, e-mail, territoire et statut de vérification (email vérifié ou non)." },
      { num: 2, title: "Repérer les anomalies", desc: "Un badge rouge « Bloqué » signale un compte ayant dépassé les tentatives de connexion autorisées. Cela peut indiquer une tentative de piratage ou un utilisateur qui a oublié son mot de passe." },
      { num: 3, title: "Consulter les informations de sécurité", desc: "Pour chaque utilisateur : dernière IP de connexion, nombre de tentatives échouées, statut TOTP activé ou non." },
      { num: 4, title: "Identifier les conseillers", desc: "Les comptes avec le rôle « admin » sont identifiés par un badge violet. Les porteurs standard n'ont pas de badge." },
    ],
    tips: [
      "La modification des rôles se fait directement en base de données pour des raisons de sécurité.",
      "Un compte bloqué se débloque automatiquement après un délai, ou manuellement via la base de données.",
    ],
  },
  {
    id: "avis",
    icon: Star,
    color: "#B5872A",
    bg: "#FFFBEB",
    title: "Modération des avis",
    subtitle: "Gérer les témoignages affichés sur le site",
    steps: [
      { num: 1, title: "Consulter les avis en attente", desc: "La page liste tous les avis déposés par les porteurs. Chaque avis est « En attente » par défaut jusqu'à votre action." },
      { num: 2, title: "Approuver un avis", desc: "Cliquez sur « Approuver » pour que l'avis soit visible sur la page publique du site FEDE. Faites-le pour les témoignages authentiques et positifs." },
      { num: 3, title: "Rejeter un avis", desc: "Cliquez sur « Rejeter » pour masquer un avis inapproprié ou non conforme. L'avis reste en base mais n'est plus affiché publiquement." },
      { num: 4, title: "Ajouter un avis manuellement", desc: "Cliquez sur « + Ajouter un avis » pour saisir un témoignage (utile pour les retours recueillis par téléphone ou e-mail). Les avis créés manuellement sont approuvés automatiquement." },
      { num: 5, title: "Supprimer un avis", desc: "Cliquez sur l'icône poubelle pour supprimer définitivement un avis. Cette action est irréversible." },
    ],
    tips: [
      "Seuls les avis « Approuvés » apparaissent sur la page publique.",
      "Un avis avec note 5 étoiles et montant de financement affiché a plus d'impact sur la conversion.",
    ],
  },
  {
    id: "parametres",
    icon: Settings,
    color: "#475569",
    bg: "#F8FAFC",
    title: "Paramètres",
    subtitle: "Configurer la plateforme",
    steps: [
      { num: 1, title: "Coordonnées bancaires", desc: "Renseignez l'IBAN, BIC, bénéficiaire, domiciliation bancaire et libellé de virement. Ces données s'insèrent automatiquement dans tous les emails de frais envoyés aux porteurs. Utilisez [REF_FRAIS] dans le libellé pour l'auto-complétion." },
      { num: 2, title: "Contact & notifications", desc: "Configurez l'email de support, le numéro de téléphone et l'adresse postale affichés dans les documents et emails générés." },
      { num: 3, title: "Sauvegarder les modifications", desc: "Cliquez sur « Enregistrer » après chaque modification. Les changements sont pris en compte immédiatement pour les prochains emails et documents générés." },
    ],
    tips: [
      "Ces paramètres affectent tous les documents générés automatiquement — vérifiez-les avant de traiter un premier dossier.",
    ],
  },
];

// ── Sous-composants ───────────────────────────────────────────────────────────

function StepCard({ step }: { step: Step }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0D1F3C] text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {step.num}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 mb-0.5">{step.title}</p>
        <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}

function TipBox({ tips }: { tips: string[] }) {
  return (
    <div className="mt-4 bg-[#FFFBEB] border border-[#F0D98C] rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-[#B5872A] text-xs font-bold uppercase tracking-wide mb-1">
        <Info className="w-3.5 h-3.5" /> Bon à savoir
      </div>
      {tips.map((tip, i) => (
        <div key={i} className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-[#B5872A] mt-0.5 shrink-0" />
          <p className="text-xs text-[#92650A] leading-relaxed">{tip}</p>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminGuide() {
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="bg-[#0D1F3C] rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #FFD500 0%, transparent 60%)" }} />
          <div className="flex items-center gap-4 mb-4 relative">
            <div className="w-12 h-12 rounded-xl bg-[#FFD500]/20 border border-[#FFD500]/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#FFD500]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Guide d'utilisation</h1>
              <p className="text-white/50 text-sm">Espace Conseillers FEDE — Comment procéder</p>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed relative max-w-2xl">
            Ce guide décrit chaque section de l'espace conseillers étape par étape.
            Commencez par la section <strong className="text-[#FFD500]">Premier démarrage</strong> si vous accédez
            à la plateforme pour la première fois, puis suivez le flux de traitement des dossiers.
          </p>
        </div>

        {/* Workflow visuel */}
        <div className="bg-white border border-[#DDE2EC] rounded-2xl p-6 mb-8">
          <h2 className="text-xs font-bold text-[#FFD500] uppercase tracking-widest mb-1">Parcours type d'un dossier</h2>
          <p className="text-xs text-slate-400 mb-5">Du dépôt initial au versement final — dans l'ordre</p>
          <div className="flex flex-col gap-0">
            {WORKFLOW_STEPS.map((s, i) => {
              const Icon = s.icon;
              const isLast = i === WORKFLOW_STEPS.length - 1;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2"
                      style={{ background: s.color + "18", borderColor: s.color }}>
                      <Icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" style={{ minHeight: 20 }} />}
                  </div>
                  <div className={`pb-4 ${isLast ? "" : ""}`}>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{s.label}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table des matières */}
        <div className="bg-white border border-[#DDE2EC] rounded-2xl p-6 mb-8">
          <h2 className="text-xs font-bold text-[#FFD500] uppercase tracking-widest mb-4">Table des matières</h2>
          <div className="grid grid-cols-2 gap-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <a key={s.id} href={`#${s.id}`}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: s.bg }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium">{s.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-[#FFD500] transition-colors" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Sections détaillées */}
        <div className="space-y-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} id={section.id}
                className="bg-white border border-[#DDE2EC] rounded-2xl overflow-hidden scroll-mt-8">
                <div className="flex items-center gap-4 p-6 border-b border-[#DDE2EC]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: section.bg }}>
                    <Icon className="w-5 h-5" style={{ color: section.color }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0D1F3C]">{section.title}</h2>
                    <p className="text-xs text-slate-400">{section.subtitle}</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {section.steps.map((step) => (
                    <StepCard key={step.num} step={step} />
                  ))}
                  {section.tips && section.tips.length > 0 && (
                    <TipBox tips={section.tips} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rappels sécurité */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700 mb-2">Rappels de sécurité</p>
              <ul className="text-xs text-red-600 space-y-1.5">
                <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 shrink-0" /> Ne transmettez jamais votre mot de passe ou votre code TOTP à un tiers.</li>
                <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 shrink-0" /> Déconnectez-vous toujours après votre session, surtout sur un ordinateur partagé.</li>
                <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 shrink-0" /> En cas de suspicion de compromission, changez votre mot de passe immédiatement et contactez l'équipe technique.</li>
                <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 shrink-0" /> L'accès à cet espace est réservé aux conseillers habilités FEDE — ne partagez pas l'URL de connexion.</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6 pb-2">
          FEDE · Guide v1.0 · Espace Conseillers · support@fede-financement.com
        </p>
      </div>
    </AdminLayout>
  );
}
