import { Link } from "wouter";
import { ArrowLeft, ArrowRight, FileText, Shield, Star, CheckCircle, Clock, AlertTriangle, Upload, Euro, Bell, Check, Users, Phone } from "lucide-react";

const ETAPES_DETAIL = [
  {
    n: "01",
    title: "Création de votre compte et vérification d'éligibilité",
    color: "from-[#0D1F3C] to-[#1A3561]",
    icon: Users,
    duree: "10 à 30 minutes",
    description: "Tout commence par la création de votre espace personnel sécurisé sur CapSubvention. Cette étape est entièrement gratuite et sans engagement.",
    sousetapes: [
      "Renseignez vos informations personnelles (nom, prénom, adresse email, téléphone)",
      "Sélectionnez votre territoire parmi les 5 DOM/COM éligibles",
      "Choisissez votre statut de porteur de projet (entrepreneur individuel, société, association, collectivité)",
      "Validez votre adresse email via le lien de confirmation envoyé automatiquement",
      "Accédez à votre espace personnel sécurisé",
    ],
    bon_a_savoir: "Votre compte vous donne accès à tous vos dossiers, documents, messages et notifications en temps réel. Aucune installation logicielle n'est nécessaire.",
    docs: [],
  },
  {
    n: "02",
    title: "Constitution et dépôt de votre dossier de demande",
    color: "from-[#1A3561] to-[#265494]",
    icon: FileText,
    duree: "1 à 3 jours",
    description: "Depuis votre espace personnel, vous constituez votre dossier de demande en renseignant toutes les informations nécessaires à l'instruction de votre demande.",
    sousetapes: [
      "Décrivez votre projet : titre, secteur d'activité, objectifs et impacts attendus",
      "Précisez votre territoire et le dispositif de financement visé",
      "Indiquez le montant total de votre projet et votre apport personnel",
      "Joignez la description détaillée de votre plan de financement prévisionnel",
      "Soumettez votre dossier pour pré-validation administrative",
    ],
    bon_a_savoir: "Un formulaire guidé vous accompagne à chaque étape. En cas de doute sur un champ, notre équipe support répond sous 24h.",
    docs: [
      "Description détaillée du projet (2 à 5 pages)",
      "Plan de financement prévisionnel (tableau recettes/dépenses)",
      "Business plan si applicable",
    ],
  },
  {
    n: "03",
    title: "Téléchargement des pièces justificatives",
    color: "from-[#265494] to-[#3B72B5]",
    icon: Upload,
    duree: "1 à 5 jours selon disponibilité des documents",
    description: "Une fois votre dossier créé, vous devez télécharger l'ensemble des pièces justificatives requises via votre espace personnel sécurisé. Tous les formats courants sont acceptés (PDF, JPG, PNG, DOCX).",
    sousetapes: [
      "Connectez-vous à votre espace personnel",
      "Accédez à la rubrique 'Mes documents'",
      "Téléchargez chaque document dans la rubrique correspondante",
      "Vérifiez que chaque document est lisible et en cours de validité",
      "Validez la complétude de votre dossier documentaire",
    ],
    bon_a_savoir: "La liste exacte des documents varie selon le dispositif et le territoire. Les pièces manquantes génèrent une alerte dans votre espace. Chaque document est chiffré lors du transfert et stocké sur des serveurs sécurisés en France.",
    docs: [
      "Pièce d'identité valide (CNI ou passeport recto/verso)",
      "Justificatif de domicile de moins de 3 mois",
      "Relevé d'Identité Bancaire (RIB) au nom du porteur",
      "Extrait Kbis (sociétés) ou statuts (associations) de moins de 3 mois",
      "Liasses fiscales des 2 derniers exercices (si entreprise existante)",
      "Devis de fournisseurs ou chiffrages estimatifs",
      "CV du ou des dirigeants du projet",
    ],
  },
  {
    n: "04",
    title: "Instruction administrative et expertise du dossier",
    color: "from-[#3B72B5] to-[#B5872A]",
    icon: Shield,
    duree: "30 à 90 jours",
    description: "C'est l'étape centrale du processus. Nos experts agréés procèdent à une analyse approfondie de votre dossier selon les critères d'éligibilité du dispositif visé.",
    sousetapes: [
      "Vérification administrative : conformité des documents et des informations déclarées",
      "Analyse de l'éligibilité : adéquation entre votre projet et les critères du dispositif",
      "Expertise économique et financière : viabilité, pertinence et impact du projet",
      "Certification des pièces justificatives par nos experts accrédités",
      "Constitution du dossier final pour l'organisme financeur",
      "Émission de la notification d'instruction (positive ou négative avec motivation)",
    ],
    bon_a_savoir: "À chaque étape clé de l'instruction, vous recevez une notification par email et dans votre espace personnel. En cas de dossier incomplet, nos experts vous contactent pour demander les compléments nécessaires.",
    docs: [],
    highlight: true,
    frais: true,
  },
  {
    n: "05",
    title: "Confirmation du financement & règlement des frais",
    color: "from-[#B5872A] to-[#C99A30]",
    icon: Euro,
    duree: "48h après confirmation",
    description: "Une fois votre financement confirmé par l'organisme compétent, les frais d'instruction réglementaires sont émis conformément à l'Article L1611-2 du CGCT. Ces frais sont la formalité officielle qui scelle l'accord — vous ne les réglez qu'après avoir la certitude d'obtenir votre subvention.",
    sousetapes: [
      "Réception de la notification officielle de confirmation de financement",
      "Émission d'une facture officielle de 380€ HT / 456€ TTC en confirmation de l'accord",
      "Paiement sécurisé en ligne via votre espace personnel (carte bancaire)",
      "Confirmation de paiement et finalisation administrative du dossier",
      "Transmission du dossier certifié à l'organisme financeur pour versement",
    ],
    bon_a_savoir: "Ces frais confirment que vous avez obtenu ce que vous demandiez. Ils ne sont jamais émis avant que votre financement soit formellement accordé — c'est leur rôle de formalité de confirmation qui les distingue d'une simple avance ou d'un risque financier.",
    docs: ["Facture officielle CapSubvention (380€ HT / 456€ TTC)"],
    montant: "456€ TTC",
  },
  {
    n: "06",
    title: "Validation finale et versement de la subvention",
    color: "from-[#1B6E3D] to-[#145830]",
    icon: CheckCircle,
    duree: "15 à 30 jours après validation",
    description: "Après paiement des frais d'instruction, votre dossier finalisé est transmis à l'organisme financeur compétent pour validation définitive et mise en paiement.",
    sousetapes: [
      "Transmission du dossier certifié à l'organisme financeur (FEDER, FSE+, BPI, etc.)",
      "Validation définitive par le comité de sélection de l'organisme",
      "Émission de la convention de subvention officielle",
      "Signature électronique de la convention via votre espace personnel",
      "Versement de la subvention sur votre compte bancaire (RIB fourni)",
      "Notification de versement et clôture du dossier",
    ],
    bon_a_savoir: "Le versement est effectué en totalité ou en plusieurs tranches selon les modalités du dispositif. Vous êtes notifié par email dès que le virement est initié.",
    docs: [],
  },
];

const GARANTIES = [
  { icon: Shield, title: "Processus 100% sécurisé", desc: "Toutes les communications et les paiements transitent par des connexions chiffrées TLS/SSL. Vos données sont hébergées en France." },
  { icon: Bell, title: "Notifications en temps réel", desc: "Chaque étape de votre dossier déclenche une notification email et une mise à jour de votre espace personnel." },
  { icon: Clock, title: "Délais respectés", desc: "Nous nous engageons à respecter les délais d'instruction annoncés. Tout dépassement vous est signalé avec une explication." },
  { icon: Phone, title: "Support dédié", desc: "Notre équipe support est disponible du lundi au vendredi de 8h à 18h pour répondre à toutes vos questions." },
];

export default function ProcessusDetail() {
  return (
    <div className="min-h-screen bg-[#F1F4FA] font-sans text-[#1A2235]">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#DDE2EC] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0D1F3C] to-[#265494] flex items-center justify-center font-bold text-white text-xs shadow-md">CS</div>
            <div>
              <div className="font-extrabold text-[#0D1F3C] text-base">CapSubvention</div>
              <div className="text-[#6B7896] text-[10px] hidden sm:block">Plateforme officielle de financements publics</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-[#4B5574] hover:text-[#0D1F3C] font-medium flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm bg-[#0D1F3C] hover:bg-[#162B52] text-white font-semibold rounded-lg transition-all shadow-md">
              Commencer mon dossier
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] py-20 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#B5872A]/20 border border-[#B5872A]/30 rounded-full px-4 py-1.5 text-sm text-[#D4A847] font-semibold mb-6">
            Processus 100% en ligne
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Comment obtenir votre subvention non remboursable ?</h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto">Un guide complet et détaillé de chaque étape, de l'inscription jusqu'au versement de votre financement.</p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/50 text-sm">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Durée totale : 45 à 120 jours</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Processus entièrement en ligne</span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Données sécurisées RGPD</span>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {ETAPES_DETAIL.map((etape, i) => (
            <div key={i} className={`relative bg-white border rounded-2xl overflow-hidden shadow-sm ${etape.highlight ? 'border-[#B5872A]/40 shadow-md' : 'border-[#DDE2EC]'}`}>
              {etape.highlight && (
                <div className="bg-[#FBF5E0] border-b border-[#B5872A]/20 px-6 py-2 flex items-center gap-2 text-sm text-[#B5872A] font-semibold">
                  <AlertTriangle className="w-4 h-4" /> Étape clé — C'est ici que votre accord de financement est prononcé
                </div>
              )}
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${etape.color} flex flex-col items-center justify-center shrink-0 shadow-md`}>
                    <div className="text-white/60 text-[10px] font-bold">{etape.n}</div>
                    <etape.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-xl font-extrabold text-[#0D1F3C]">{etape.title}</h3>
                      {etape.montant && (
                        <span className="bg-[#B5872A] text-white text-xs font-bold px-3 py-1 rounded-full">{etape.montant}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7896] text-sm mb-4">
                      <Clock className="w-4 h-4" /> {etape.duree}
                    </div>
                    <p className="text-[#4B5574] leading-relaxed mb-6">{etape.description}</p>

                    <div className="mb-6">
                      <div className="text-[#0D1F3C] font-bold text-sm mb-3">Étapes détaillées :</div>
                      <div className="space-y-2">
                        {etape.sousetapes.map((s, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#0D1F3C]/8 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[#0D1F3C] text-[10px] font-bold">{j + 1}</span>
                            </div>
                            <span className="text-[#4B5574] text-sm leading-relaxed">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {etape.docs.length > 0 && (
                      <div className="bg-[#F8F9FC] border border-[#DDE2EC] rounded-xl p-4 mb-4">
                        <div className="text-[#0D1F3C] font-bold text-sm mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Documents à fournir
                        </div>
                        <div className="space-y-1.5">
                          {etape.docs.map((d, j) => (
                            <div key={j} className="flex items-center gap-2 text-[#4B5574] text-sm">
                              <Check className="w-3 h-3 text-green-500 shrink-0" /> {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {etape.bon_a_savoir && (
                      <div className="bg-[#EEF2FF] border border-[#C7D2F6] rounded-xl p-4">
                        <div className="text-[#3B5AC2] font-bold text-xs uppercase tracking-wide mb-1.5">Bon à savoir</div>
                        <div className="text-[#3B5AC2]/80 text-sm leading-relaxed">{etape.bon_a_savoir}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* GARANTIES */}
        <div className="mt-16 bg-white border border-[#DDE2EC] rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#0D1F3C] mb-2">Nos engagements qualité</h2>
            <p className="text-[#5B6580] text-sm">Tout au long du processus, CapSubvention s'engage à vous offrir un service fiable et transparent.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {GARANTIES.map((g) => (
              <div key={g.title} className="flex items-start gap-4 p-4 bg-[#F8F9FC] rounded-xl border border-[#DDE2EC]">
                <div className="w-10 h-10 rounded-lg bg-[#0D1F3C]/8 flex items-center justify-center shrink-0">
                  <g.icon className="w-5 h-5 text-[#0D1F3C]" />
                </div>
                <div>
                  <div className="font-bold text-[#0D1F3C] text-sm mb-1">{g.title}</div>
                  <div className="text-[#5B6580] text-xs leading-relaxed">{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-3">Prêt à commencer ?</h2>
          <p className="text-white/65 mb-6">L'inscription est gratuite. Déposez votre dossier maintenant et commencez votre démarche.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 bg-[#B5872A] hover:bg-[#C99A30] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl">
              Créer mon compte gratuitement <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/faq" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-xl transition-all">
              Consulter la FAQ
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-[#080F1E] py-8 text-center text-white/20 text-xs">
        © 2025 CapSubvention — Article L1611-2 CGCT — <Link href="/" className="hover:text-white/40">Retour à l'accueil</Link>
      </footer>
    </div>
  );
}
