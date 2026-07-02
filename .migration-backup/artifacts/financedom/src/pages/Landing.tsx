import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Check, Shield, FileText, Building, Lightbulb, Sprout,
  Home, GraduationCap, Landmark, Star, ArrowRight,
  Globe, Award, TrendingUp, Clock, Users, Euro,
  CheckCircle, AlertTriangle, Phone, Mail, MapPin,
  Smartphone, Download
} from "lucide-react";
import { CSLogo } from "@/components/CSLogo";
import { TERRITORIES } from "@/lib/constants";

const HERO_SLIDES = [
  {
    bg: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=80",
    gradient: "from-[#0D1F3C]/92 via-[#0D1F3C]/80 to-[#1A3561]/70",
    tag: "Programme officiel de l'État français — Période 2025–2027",
    h1: "Obtenez votre financement\nnon remboursable\nen Outre-Mer",
    highlight: "non remboursable",
    sub: "Jusqu'à 80 % de votre projet financé sans remboursement. Accédez aux dispositifs réservés aux porteurs de projets des 5 territoires ultramarins.",
  },
  {
    bg: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1920&q=80",
    gradient: "from-[#0D1F3C]/90 via-[#0A2840]/80 to-[#1A3561]/65",
    tag: "FEDER · FSE+ · BPI France · AFD · Caisse des Dépôts",
    h1: "Des fonds publics et\neuropéens pour\nfinancer vos ambitions",
    highlight: "fonds publics et\neuropéens",
    sub: "Grâce aux programmes structurels européens et nationaux, l'État investit directement dans le développement de vos territoires. Profitez-en.",
  },
  {
    bg: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80",
    gradient: "from-[#0D1F3C]/88 via-[#142845]/78 to-[#1A3561]/60",
    tag: "100% en ligne · Accompagné · Sécurisé",
    h1: "Un processus simplifié,\nsuivi personnalisé,\nune réponse rapide",
    highlight: "processus simplifié",
    sub: "Déposez votre dossier entièrement en ligne. Nos experts agréés vous accompagnent de la soumission jusqu'au versement de votre subvention.",
  },
];

const TICKER_ITEMS = [
  "🔴 EN DIRECT — Enveloppes 2025–2027 ouvertes : Martinique · Guadeloupe · La Réunion · Polynésie · Nouvelle-Calédonie",
  "💶 FEDER 2025 : jusqu'à 1 000 000€ selon le dispositif et l'éligibilité de votre projet",
  "✅ Cadre légal : Article L1611-2 CGCT — Programme encadré par la législation française",
  "📲 Application mobile officielle disponible — Téléchargez l'APK exclusivement sur capsubvention.com",
  "🏆 3 500+ dossiers validés en 2024 — Montant moyen accordé : 87 000€ par projet",
  "⚡ FSE+ Emploi & Formation : Guadeloupe & Martinique — Dossiers acceptés jusqu'au 30 septembre 2025",
  "🛡️ Seuls canaux officiels : capsubvention.com et l'application mobile CapSubvention",
  "📋 Délai d'instruction : 30 à 90 jours — Notification officielle par e-mail @capsubvention.com",
  "🌴 Polynésie française — SEFI & Contrat de Développement : 50 000€ à 850 000€ par projet éligible",
  "💡 Innovation numérique : FEDER Transition numérique — financement jusqu'à 70% du budget projet",
  "🏗️ Réhabilitation logement social : FEDER Habitat — Réunion, Guadeloupe, Martinique",
  "📞 Support dédié : lundi–vendredi 8h–18h — Heure locale du territoire concerné",
];

const TYPES_PROJETS = [
  { icon: Building, label: "Création & développement d'entreprise", desc: "Financement des coûts de démarrage, acquisitions d'équipements, constitution du fonds de roulement initial et premiers investissements productifs.", badge: "Très demandé" },
  { icon: Lightbulb, label: "Innovation & Transformation numérique", desc: "Soutien aux projets de R&D, digitalisation des processus, développement de solutions technologiques innovantes et start-ups à fort potentiel.", badge: null },
  { icon: Sprout, label: "Agriculture, Pêche & Environnement", desc: "Exploitations agricoles, aquaculture, pêche artisanale, énergies renouvelables, projets de développement durable et d'économie circulaire.", badge: null },
  { icon: Home, label: "Logement & Habitat social", desc: "Construction neuve, réhabilitation de logements dégradés, amélioration énergétique et accès au logement social pour les ménages modestes.", badge: null },
  { icon: GraduationCap, label: "Formation professionnelle & Emploi", desc: "Dispositifs d'insertion, apprentissage, formation continue, création d'emplois durables et accompagnement à la reconversion professionnelle.", badge: "FSE+" },
  { icon: Landmark, label: "Associations, Culture & Sport", desc: "Projets associatifs d'utilité sociale, manifestations culturelles, infrastructures sportives et initiatives citoyennes à impact territorial.", badge: null },
];

const PROCESS_STEPS = [
  {
    n: "01", icon: FileText, title: "Création du compte & Dépôt du dossier",
    desc: "Créez votre compte sécurisé en 5 minutes. Renseignez votre projet, son territoire, son secteur et le montant sollicité. Notre formulaire guidé vous accompagne à chaque champ.",
    detail: "Délai estimé : 1 à 3 jours",
    color: "from-[#0D1F3C] to-[#1A3561]"
  },
  {
    n: "02", icon: Shield, title: "Téléchargement des pièces justificatives",
    desc: "Déposez vos documents via votre espace personnel sécurisé : pièce d'identité, justificatif de domicile, plan de financement, description du projet, RIB et tout document complémentaire.",
    detail: "Liste complète fournie après inscription",
    color: "from-[#1A3561] to-[#265494]"
  },
  {
    n: "03", icon: Star, title: "Instruction & Expertise administrative",
    desc: "Nos experts analysent la conformité et l'éligibilité de votre dossier. Lorsque votre financement est confirmé par l'organisme compétent, vous recevez une notification officielle d'accord. Les frais d'instruction (456€ TTC) sont alors émis — c'est le signal que votre subvention est accordée.",
    detail: "Délai moyen : 30 à 90 jours",
    color: "from-[#265494] to-[#B5872A]",
    highlight: true
  },
  {
    n: "04", icon: CheckCircle, title: "Validation & Versement de la subvention",
    desc: "Après paiement des frais et validation finale, votre dossier est transmis à l'organisme financeur. La subvention est versée directement sur votre compte bancaire.",
    detail: "Versement sous 15 à 30 jours",
    color: "from-[#1B6E3D] to-[#1A3561]"
  },
];

const AVIS = [
  { name: "Sandrine K.", territoire: "Martinique", projet: "Commerce alimentaire", note: 5, texte: "Grâce à CapSubvention, j'ai obtenu 28 000€ pour l'ouverture de ma boutique. Le processus était clair, le suivi irréprochable. Je recommande vivement à tous les porteurs de projets martiniquais.", date: "Mars 2025" },
  { name: "Jean-Pierre M.", territoire: "Guadeloupe", projet: "Élevage bovin", note: 5, texte: "La plateforme est très professionnelle et bien organisée. Mon conseiller a répondu à toutes mes questions. J'ai reçu ma subvention agricole en moins de 60 jours. Impeccable.", date: "Février 2025" },
  { name: "Moana T.", territoire: "Polynésie française", projet: "Tourisme durable", note: 5, texte: "Je n'aurais jamais pensé pouvoir financer mon projet de tourisme éco-responsable sans apport. CapSubvention m'a permis d'accéder à un financement SEFI de 35 000€. Un dispositif qui change vraiment les choses.", date: "Janvier 2025" },
  { name: "Thierry A.", territoire: "La Réunion", projet: "Startup numérique", note: 4, texte: "Très satisfait de la rapidité de traitement. Le dossier a été instruit en 45 jours. Seul bémol : la liste des documents à fournir est longue, mais c'est inévitable pour des fonds publics.", date: "Avril 2025" },
  { name: "Isabelle R.", territoire: "Nouvelle-Calédonie", projet: "Association culturelle", note: 5, texte: "Notre association a bénéficié d'une subvention ACE Entrepreneuriat pour nos activités culturelles. L'espace de suivi est parfait, les notifications en temps réel sont très pratiques.", date: "Mars 2025" },
  { name: "Bertrand N.", territoire: "Guadeloupe", projet: "Rénovation logement", note: 5, texte: "J'ai réhabilité 4 logements sociaux grâce au financement FEDER Guadeloupe. La plateforme CapSubvention a simplifié toutes les démarches administratives. Un vrai gain de temps.", date: "Décembre 2024" },
  { name: "Claudine O.", territoire: "Martinique", projet: "Formation professionnelle", note: 5, texte: "En tant que formatrice indépendante, j'ai pu financer ma certification grâce au FSE+. Le conseiller en charge de mon dossier était à l'écoute et compétent. Je recommande à 100%.", date: "Janvier 2025" },
  { name: "Henri B.", territoire: "La Réunion", projet: "Énergie solaire", note: 5, texte: "Projet d'installation de panneaux solaires financé à 65% par le FEDER Réunion. CapSubvention a rendu ce projet possible. Sans cette aide, nous n'aurions jamais pu investir.", date: "Février 2025" },
];

const FAQ_ITEMS = [
  {
    q: "Qu'est-ce qu'une subvention non remboursable et en quoi est-elle différente d'un prêt ?",
    r: "Une subvention non remboursable est une aide financière accordée par l'État, une collectivité ou l'Union Européenne qui n'a pas à être restituée, contrairement à un prêt bancaire. Elle est versée définitivement dès lors que les conditions d'attribution sont respectées et que le projet est réalisé conformément au plan approuvé. C'est une opportunité unique pour financer une partie substantielle de votre investissement sans créer de dette et sans alourdir votre bilan financier."
  },
  {
    q: "Qui peut déposer un dossier sur CapSubvention ?",
    r: "Toute personne physique ou morale dont le projet est implanté dans l'un des 5 territoires couverts : Nouvelle-Calédonie, Martinique, Polynésie française, Guadeloupe et La Réunion. Sont éligibles : les entrepreneurs individuels, les TPE/PME, les associations, les collectivités locales, les agriculteurs, les artisans et les porteurs de projets à but non lucratif. Chaque dispositif dispose de critères d'éligibilité spécifiques que nos experts vérifient lors de l'instruction du dossier."
  },
  {
    q: "Pourquoi ce type de financement a-t-il été mis en place pour les DOM/COM ?",
    r: "Les territoires d'Outre-Mer français présentent des caractéristiques économiques spécifiques : éloignement géographique, insularité, coûts de transport élevés, marchés locaux restreints et difficultés d'accès au crédit bancaire classique. Pour compenser ces handicaps structurels reconnus par le droit européen (article 349 TFUE), l'Union Européenne et l'État français ont mis en place des fonds structurels dédiés (FEDER, FSE+, FEADER) et des aides nationales spécifiques visant à stimuler le développement économique local."
  },
  {
    q: "Quel est le montant moyen des subventions accordées ?",
    r: "Le montant varie selon le dispositif, le territoire et la nature du projet. Les subventions accordées via notre plateforme s'échelonnent généralement entre 5 000€ et 150 000€ pour les projets individuels. Pour les projets d'envergure (infrastructures, immobilier professionnel, équipements industriels), certains dispositifs permettent d'aller au-delà. Le taux de financement oscille entre 30% et 80% du coût total éligible selon les cas."
  },
  {
    q: "À quoi correspondent les frais d'instruction de 456€ TTC ?",
    r: "Les frais d'instruction (380€ HT / 456€ TTC) sont des frais administratifs réglementaires prévus par l'Article L1611-2 du Code Général des Collectivités Territoriales (CGCT). Ils couvrent les coûts liés à l'analyse de votre dossier par nos experts agréés : vérification de la conformité administrative, expertise de la viabilité économique du projet, certification des pièces justificatives et constitution du dossier final auprès de l'organisme financeur. Ces frais ne sont émis qu'une fois votre financement confirmé par l'organisme compétent — ils constituent la formalité officielle qui scelle l'accord obtenu. Vous ne payez jamais pour une simple chance."
  },
  {
    q: "Quels sont les délais de traitement de mon dossier ?",
    r: "Une fois votre dossier complet soumis, le délai d'instruction est en moyenne de 30 à 90 jours calendaires. Ce délai varie selon la complexité du projet, le dispositif de financement visé et le territoire concerné. Des délais plus courts (moins de 30 jours) sont possibles pour les dossiers simples et bien constitués. Vous êtes informé en temps réel de l'avancement de votre dossier via votre espace personnel et par notifications email."
  },
  {
    q: "Puis-je cumuler plusieurs subventions pour le même projet ?",
    r: "Oui, le cumul de subventions est possible dans certaines limites fixées par les règlements européens et nationaux. La règle générale est que le montant total des aides publiques perçues ne peut excéder un certain plafond (variable selon le secteur et la taille de l'entreprise) ni dépasser 100% des dépenses éligibles. Nos experts vous conseillent sur les meilleures combinaisons de financements disponibles pour votre projet."
  },
  {
    q: "Mon dossier peut-il être refusé ? Que se passe-t-il dans ce cas ?",
    r: "Oui, un dossier peut être refusé si le projet ne répond pas aux critères d'éligibilité du dispositif sollicité (secteur non couvert, territoire non éligible, porteur non qualifié) ou si le dossier est incomplet malgré les relances. En cas de refus, vous recevez une notification motivée et, dans de nombreux cas, nos experts vous orientent vers d'autres dispositifs alternatifs potentiellement adaptés à votre situation."
  },
  {
    q: "Le dispositif CapSubvention est-il une structure officielle et agrée ?",
    r: "CapSubvention est la plateforme de demande et de suivi des subventions non remboursables pour les territoires d'Outre-Mer, opérant dans le cadre juridique défini par l'Article L1611-2 du CGCT. Nos experts sont agréés par les organismes financeurs partenaires (FEDER, FSE+, BPI France, AFD, Caisse des Dépôts). Toutes les transactions sont sécurisées et les frais d'instruction sont facturés conformément à la réglementation en vigueur."
  },
  {
    q: "Mes données personnelles sont-elles protégées ?",
    r: "Oui, la protection de vos données est une priorité absolue. Nous respectons strictement le Règlement Général sur la Protection des Données (RGPD). Vos données sont hébergées sur des serveurs sécurisés situés en France, chiffrées en transit (TLS/SSL) et au repos. Elles ne sont utilisées qu'aux fins strictement nécessaires à l'instruction de votre dossier et ne sont jamais cédées à des tiers commerciaux."
  },
];

const PARTENAIRES = [
  "Union Européenne — FEDER/FSE+", "BPI France", "Agence Française de Développement",
  "Caisse des Dépôts et Consignations", "Régions d'Outre-Mer", "État Français — DEETS",
  "FEADER Agriculture", "Banque des Territoires"
];

const CHIFFRES = [
  { val: "5", lbl: "Territoires couverts", icon: Globe },
  { val: "70+", lbl: "Dispositifs actifs", icon: Award },
  { val: "3 500+", lbl: "Projets financés / an", icon: TrendingUp },
  { val: "94%", lbl: "Taux de satisfaction", icon: Star },
];

export default function Landing() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [phoneScreen, setPhoneScreen] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const slideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    slideTimerRef.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % HERO_SLIDES.length);
    }, 6000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (slideTimerRef.current) clearInterval(slideTimerRef.current); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPhoneScreen(s => (s + 1) % 4), 4200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setProgressWidth(0);
    const t = setTimeout(() => setProgressWidth(68), 120);
    return () => clearTimeout(t);
  }, [phoneScreen]);

  const goSlide = (idx: number) => {
    setSlideIdx(idx);
    startTimer();
  };

  const prevSlide = () => { goSlide((slideIdx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); };
  const nextSlide = () => { goSlide((slideIdx + 1) % HERO_SLIDES.length); };

  const slide = HERO_SLIDES[slideIdx];

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A2235]">

      {/* ── TOP TICKER BAR ── */}
      <div className="bg-[#0D1F3C] text-white overflow-hidden relative h-9 flex items-center">
        <div className="shrink-0 bg-[#B5872A] px-4 h-full flex items-center z-10 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-r border-white/10">
          INFO OFFICIELLE
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track flex gap-12 text-xs text-white/80 whitespace-nowrap py-2 pl-8">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-2 shrink-0">
                {item}
                <span className="text-[#B5872A] text-base font-bold mx-2 opacity-60">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#DDE2EC] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="cursor-pointer">
            <CSLogo size="md" variant="dark" showText subtitle="Plateforme officielle de financements publics" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <a href="#pourquoi" className="px-3 py-2 text-sm text-[#4B5574] hover:text-[#0D1F3C] font-medium transition-colors">Pourquoi ?</a>
            <a href="#projets" className="px-3 py-2 text-sm text-[#4B5574] hover:text-[#0D1F3C] font-medium transition-colors">Projets éligibles</a>
            <a href="#processus" className="px-3 py-2 text-sm text-[#4B5574] hover:text-[#0D1F3C] font-medium transition-colors">Processus</a>
            <Link href="/faq" className="px-3 py-2 text-sm text-[#4B5574] hover:text-[#0D1F3C] font-medium transition-colors">FAQ</Link>
            <Link href="/avis" className="px-3 py-2 text-sm text-[#4B5574] hover:text-[#0D1F3C] font-medium transition-colors">Avis</Link>
            <a href="#app-mobile" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[#B5872A] hover:text-[#8A6520] font-semibold transition-colors">
              <Smartphone className="w-3.5 h-3.5" />
              Application
            </a>
            <div className="w-px h-5 bg-[#DDE2EC] mx-2" />
            <Link href="/login" className="px-4 py-2 text-sm text-[#0D1F3C] font-semibold hover:bg-[#F1F4FA] rounded-lg transition-colors">Connexion</Link>
            <Link href="/register" className="ml-1 px-4 py-2 text-sm bg-[#0D1F3C] hover:bg-[#162B52] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95">
              Déposer un dossier
            </Link>
          </div>

          <button className="md:hidden p-2 text-[#0D1F3C]" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="space-y-1.5">
              <div className={`h-0.5 w-6 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <div className={`h-0.5 w-6 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <div className={`h-0.5 w-6 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#DDE2EC] px-6 py-4 space-y-3">
            {["#pourquoi:Pourquoi ?", "#projets:Projets éligibles", "#processus:Processus"].map(l => {
              const [href, label] = l.split(":");
              return <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-[#4B5574]">{label}</a>;
            })}
            <Link href="/faq" className="block py-2 text-sm font-medium text-[#4B5574]">FAQ</Link>
            <Link href="/avis" className="block py-2 text-sm font-medium text-[#4B5574]">Avis</Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" className="text-center py-2.5 border border-[#0D1F3C] text-[#0D1F3C] font-semibold rounded-lg text-sm">Connexion</Link>
              <Link href="/register" className="text-center py-2.5 bg-[#0D1F3C] text-white font-semibold rounded-lg text-sm">Déposer un dossier</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO CAROUSEL ── */}
      <section className="relative text-white min-h-[620px] md:min-h-[680px] flex flex-col justify-center overflow-hidden">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === slideIdx ? 1 : 0 }}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${s.bg}')` }} />
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
          </div>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div key={slideIdx} className="float-up">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/80 mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 bg-[#B5872A] rounded-full animate-pulse shrink-0" />
                {slide.tag}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 whitespace-pre-line">
                {slide.h1.split(slide.highlight).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="text-[#D4A847]">{slide.highlight}</span>}
                  </span>
                ))}
              </h1>
              <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-lg">{slide.sub}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="group bg-[#B5872A] hover:bg-[#C99A30] text-white font-bold px-7 py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2">
                  Déposer mon dossier <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#pourquoi" className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-lg transition-all backdrop-blur-sm">
                  En savoir plus
                </a>
              </div>
              <div className="mt-4">
                <a
                  href="/capsubvention-app.apk"
                  download="CapSubvention.apk"
                  className="group inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/18 border border-[#B5872A]/60 hover:border-[#B5872A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all backdrop-blur-sm hover:-translate-y-0.5 shadow-lg"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#B5872A] shadow-md group-hover:bg-[#C99A30] transition-colors">
                    <Download className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span>
                    Télécharger l'app Android
                    <span className="block text-white/45 text-[10px] font-normal leading-none mt-0.5">APK officiel · Version 1.0</span>
                  </span>
                </a>
              </div>
            </div>

            <div className="hidden md:flex justify-center items-center">
              <div className="relative">
                {/* Halo lumineux derrière le téléphone */}
                <div className="absolute inset-0 -m-10 rounded-full bg-[#B5872A]/12 blur-3xl pointer-events-none" />

                <svg width="240" height="490" viewBox="0 0 260 530" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-2xl">
                  <defs>
                    <linearGradient id="hpgBody" x1="0" y1="0" x2="0" y2="530" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#2A3A55"/>
                      <stop offset="100%" stopColor="#1A2640"/>
                    </linearGradient>
                    <linearGradient id="hpgBorder" x1="0" y1="0" x2="260" y2="530" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#B5872A" stopOpacity="0.8"/>
                      <stop offset="50%" stopColor="rgba(255,255,255,0.15)"/>
                      <stop offset="100%" stopColor="#B5872A" stopOpacity="0.4"/>
                    </linearGradient>
                    <linearGradient id="hpgProgress" x1="0" y1="0" x2="140" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#B5872A"/>
                      <stop offset="100%" stopColor="#D4A847"/>
                    </linearGradient>
                  </defs>
                  {/* Châssis */}
                  <rect x="3" y="3" width="254" height="524" rx="42" fill="url(#hpgBody)" stroke="url(#hpgBorder)" strokeWidth="1.5"/>
                  {/* Écran */}
                  <rect x="12" y="12" width="236" height="506" rx="35" fill="#0A1829"/>
                  {/* Encoche */}
                  <rect x="88" y="17" width="84" height="20" rx="10" fill="#060F1E"/>
                  {/* Barre status */}
                  <text x="30" y="30" fontFamily="Arial" fontSize="8" fill="rgba(255,255,255,0.3)">9:41</text>
                  <rect x="210" y="22" width="22" height="10" rx="3" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
                  <rect x="211" y="23" width="16" height="8" rx="2" fill="#22C55E" opacity="0.7"/>
                  {/* Header app */}
                  <rect x="12" y="46" width="236" height="54" fill="#061320"/>
                  <rect x="12" y="99" width="236" height="1" fill="#B5872A" opacity="0.2"/>
                  <rect x="28" y="58" width="30" height="30" rx="8" fill="#1A3561"/>
                  <text x="43" y="78" textAnchor="middle" fontFamily="Arial Black" fontWeight="900" fontSize="12" fill="#D4A847">CS</text>
                  <text x="68" y="71" fontFamily="Arial" fontWeight="700" fontSize="10.5" fill="white">CapSubvention</text>
                  <text x="68" y="83" fontFamily="Arial" fontSize="8" fill="rgba(255,255,255,0.35)">Mon espace</text>
                  <rect x="208" y="60" width="26" height="26" rx="8" fill="rgba(181,135,42,0.15)"/>
                  <circle cx="221" cy="66" r="5" fill="#B5872A"/>
                  <text x="221" y="70" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="7" fill="white">2</text>
                  {/* Carte statut */}
                  <rect x="22" y="111" width="216" height="82" rx="14" fill="#112240" stroke="#B5872A" strokeWidth="0.6" strokeOpacity="0.35"/>
                  <text x="36" y="129" fontFamily="Arial" fontSize="7.5" fill="rgba(255,255,255,0.35)">DOSSIER N° CS-2025-0843</text>
                  <circle cx="40" cy="143" r="4" fill="#22C55E" opacity="0.85"/>
                  <text x="50" y="147" fontFamily="Arial" fontWeight="700" fontSize="9" fill="white">Instruction en cours</text>
                  <rect x="36" y="156" width="164" height="5" rx="2.5" fill="#1A3561"/>
                  <rect x="36" y="156" width="110" height="5" rx="2.5" fill="url(#hpgProgress)" opacity="0.9"/>
                  <text x="36" y="183" fontFamily="Arial" fontSize="7.5" fill="rgba(255,255,255,0.3)">Avancement : 68% · Étape 3/5</text>
                  {/* 3 actions rapides */}
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <rect x={22 + i * 76} y="206" width="64" height="60" rx="13" fill="#112240" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
                      <text x={54 + i * 76} y="233" textAnchor="middle" fontSize="17">
                        {["📄","💬","🔔"][i]}
                      </text>
                      <text x={54 + i * 76} y="253" textAnchor="middle" fontFamily="Arial" fontSize="7" fill="rgba(255,255,255,0.45)">
                        {["Documents","Messages","Alertes"][i]}
                      </text>
                      {i === 1 && <circle cx={82} cy="211" r="5.5" fill="#B5872A"/>}
                      {i === 1 && <text x="82" y="215" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="7" fill="white">3</text>}
                    </g>
                  ))}
                  {/* Historique */}
                  <text x="28" y="290" fontFamily="Arial" fontWeight="700" fontSize="8.5" fill="rgba(255,255,255,0.4)">HISTORIQUE DU DOSSIER</text>
                  {[
                    { y: 304, color: "#22C55E", label: "Dossier déposé", date: "02 Jan 2025", done: true },
                    { y: 340, color: "#22C55E", label: "Pièces validées", date: "15 Jan 2025", done: true },
                    { y: 376, color: "#B5872A", label: "Instruction en cours", date: "En cours…", done: false },
                    { y: 412, color: "#334155", label: "Décision finale", date: "— à venir —", done: false },
                  ].map((step, i) => (
                    <g key={i}>
                      <circle cx="36" cy={step.y + 5} r="5" fill={step.done ? step.color : "#1E293B"} stroke={step.color} strokeWidth="1.2"/>
                      {i < 3 && <line x1="36" y1={step.y + 10} x2="36" y2={step.y + 31} stroke={step.done && i < 2 ? "#22C55E" : "#1E293B"} strokeWidth="1.5" strokeDasharray={step.done ? "0" : "3,2"}/>}
                      <text x="50" y={step.y + 9} fontFamily="Arial" fontWeight={step.done ? "700" : "400"} fontSize="9" fill={step.done ? "white" : "rgba(255,255,255,0.28)"}>{step.label}</text>
                      <text x="50" y={step.y + 21} fontFamily="Arial" fontSize="7.5" fill={step.done ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.18)"}>{step.date}</text>
                    </g>
                  ))}
                  {/* Bottom nav */}
                  <rect x="12" y="466" width="236" height="52" fill="#060F1E"/>
                  <rect x="12" y="466" width="236" height="1" fill="rgba(255,255,255,0.05)"/>
                  {["🏠","📁","💬","👤"].map((icon, i) => (
                    <g key={i}>
                      <text x={42 + i * 60} y="487" textAnchor="middle" fontSize="15">{icon}</text>
                      {i === 0 && <rect x={29} y="503" width="26" height="2.5" rx="1.25" fill="#B5872A"/>}
                    </g>
                  ))}
                  <rect x="95" y="513" width="70" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
                </svg>

                {/* Badges flottants */}
                <div className="absolute -left-10 top-20 bg-white rounded-2xl shadow-2xl px-3 py-2 flex items-center gap-2 border border-[#DDE2EC]">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">✅</div>
                  <div>
                    <div className="text-[#0D1F3C] font-bold text-xs">Dossier validé</div>
                    <div className="text-[#6B7896] text-[10px]">il y a 2 heures</div>
                  </div>
                </div>

                <div className="absolute -right-10 top-48 bg-white rounded-2xl shadow-2xl px-3 py-2 flex items-center gap-2 border border-[#DDE2EC]">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">💶</div>
                  <div>
                    <div className="text-[#0D1F3C] font-bold text-xs">12 500€</div>
                    <div className="text-[#6B7896] text-[10px]">Subvention obtenue</div>
                  </div>
                </div>

                <div className="absolute -left-8 bottom-24 bg-white rounded-2xl shadow-2xl px-3 py-2 flex items-center gap-2 border border-[#DDE2EC]">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">🔔</div>
                  <div>
                    <div className="text-[#0D1F3C] font-bold text-xs">Nouveau message</div>
                    <div className="text-[#6B7896] text-[10px]">Votre conseiller</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-white/10">
            {CHIFFRES.map((c) => (
              <div key={c.lbl} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-[#D4A847] mb-1">{c.val}</div>
                <div className="text-white/55 text-xs">{c.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === slideIdx ? 'w-6 bg-[#D4A847]' : 'bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
      </section>

      {/* ── INSTITUTION OFFICIELLE BANDEAU ── */}
      <div className="bg-[#F1F4FA] border-y border-[#DDE2EC]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#0D1F3C] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#D4A847]" />
            </div>
            <div>
              <div className="font-bold text-[#0D1F3C] text-sm">Structure gouvernementale agréée</div>
              <div className="text-[#6B7896] text-xs">Article L1611-2 du Code Général des Collectivités Territoriales</div>
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-[#DDE2EC] mx-4" />
          <div className="text-[#4B5574] text-xs sm:text-sm leading-relaxed text-center sm:text-left">
            CapSubvention est la plateforme officielle de demande de financements non remboursables pour les porteurs de projets des territoires d'Outre-Mer. Une subvention non remboursable est une aide financière accordée par l'État, une collectivité ou l'Union Européenne qui n'a pas à être restituée, contrairement à un prêt bancaire. Elle est versée définitivement dès lors que les conditions d'attribution sont respectées — une opportunité unique pour financer votre projet sans créer de dette.
          </div>
          <div className="shrink-0 sm:ml-auto">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5 text-xs font-semibold">
              <Check className="w-3 h-3" /> Dossiers 2025-2027 ouverts
            </span>
          </div>
        </div>
      </div>

      {/* ── POURQUOI CE DISPOSITIF ── */}
      <section id="pourquoi" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="text-[#B5872A] text-sm font-bold uppercase tracking-widest mb-3">Contexte institutionnel</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D1F3C] mb-6 leading-tight">
                Pourquoi ces financements non remboursables ont-ils été créés ?
              </h2>
              <div className="space-y-5 text-[#4B5574] leading-relaxed">
                <p>
                  Les territoires d'Outre-Mer français — Martinique, Guadeloupe, La Réunion, Nouvelle-Calédonie et Polynésie française — font face à des <strong className="text-[#0D1F3C]">contraintes structurelles spécifiques</strong> reconnues au niveau européen et national : éloignement géographique, insularité, dépendance aux importations, marchés locaux limités, difficultés d'accès au crédit bancaire et coûts de production élevés.
                </p>
                <p>
                  Pour corriger ces déséquilibres, l'Union Européenne, en application de l'<strong className="text-[#0D1F3C]">article 349 du Traité sur le Fonctionnement de l'Union Européenne (TFUE)</strong>, a octroyé aux régions ultrapériphériques un accès privilégié aux fonds structurels : FEDER (développement régional), FSE+ (emploi et formation) et FEADER (agriculture).
                </p>
                <p>
                  L'État français complète ce dispositif avec ses propres programmes nationaux (BPI France, AFD, Caisse des Dépôts, DEETS) pour constituer une enveloppe globale de plusieurs centaines de millions d'euros destinée à soutenir le tissu économique et social de ces territoires jusqu'en 2027.
                </p>
                <p>
                  <strong className="text-[#0D1F3C]">CapSubvention est la passerelle</strong> qui vous permet d'accéder à ces financements publics de façon simple, sécurisée et accompagnée — sans avoir à naviguer seul dans des méandres administratifs complexes.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: Award, title: "Cadre légal européen", desc: "Dispositifs encadrés par le TFUE art. 349, les règlements FEDER/FSE+ 2021–2027 et le droit national français.", color: "bg-[#0D1F3C]/5 text-[#0D1F3C]" },
                { icon: AlertTriangle, title: "Pourquoi agir avant 2027 ?", desc: "L'actuelle période de programmation s'achève en 2027. Au-delà, les enveloppes non consommées sont réaffectées. Les dossiers tardifs risquent de rater cette fenêtre de financement.", color: "bg-[#B5872A]/10 text-[#B5872A]" },
                { icon: Users, title: "Qui bénéficie concrètement ?", desc: "Entrepreneurs, agriculteurs, associations, collectivités, artisans, porteurs de projets innovants et tout acteur contribuant au développement économique local.", color: "bg-[#1B6E3D]/8 text-[#1B6E3D]" },
                { icon: TrendingUp, title: "Impact prouvé", desc: "En 2024, plus de 3 500 projets ont bénéficié de financements non remboursables dans les DOM/COM. La programmation 2021-2027 mobilise plusieurs milliards d'euros pour les territoires ultramarins.", color: "bg-[#265494]/8 text-[#265494]" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-5 bg-[#F8F9FC] rounded-xl border border-[#E8EDF5] hover:border-[#0D1F3C]/20 hover:shadow-sm transition-all">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${item.color} bg-opacity-100`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#0D1F3C] text-sm mb-1">{item.title}</div>
                    <div className="text-[#5B6580] text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── POURQUOI AGIR MAINTENANT ── */}
      <section className="bg-gradient-to-br from-[#0D1F3C] to-[#162B52] py-20 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#B5872A]/20 border border-[#B5872A]/30 rounded-full px-4 py-1.5 text-sm text-[#D4A847] font-semibold mb-4">
              <Clock className="w-4 h-4" /> Fenêtre de financement limitée
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Pourquoi déposer votre dossier maintenant ?</h2>
            <p className="text-white/65 text-lg max-w-2xl mx-auto">Chaque année d'attente est une opportunité manquée. Voici pourquoi il est essentiel d'agir dès aujourd'hui.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { n: "01", title: "Enveloppes budgétaires limitées", desc: "Les fonds disponibles ne sont pas illimités. Les programmations FEDER/FSE+ 2025–2027 ont des plafonds définis. Passé un certain seuil de demandes, les enveloppes se ferment.", icon: Euro },
              { n: "02", title: "Délai de traitement de 30 à 90 jours", desc: "Entre le dépôt de votre dossier et le versement effectif, il faut compter minimum 2 à 3 mois. Chaque semaine de retard repousse l'obtention de votre financement.", icon: Clock },
              { n: "03", title: "Fin de période de programmation en 2027", desc: "L'actuelle période de programmation européenne s'achève en 2027. Les dossiers déposés trop tard risquent de ne plus trouver de dispositif éligible disponible.", icon: AlertTriangle },
            ].map((r) => (
              <div key={r.n} className="bg-white/8 border border-white/12 rounded-2xl p-7 hover:bg-white/12 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#B5872A]/25 flex items-center justify-center mb-5">
                  <r.icon className="w-6 h-6 text-[#D4A847]" />
                </div>
                <div className="text-[#D4A847] font-extrabold text-sm mb-2">{r.n}</div>
                <h3 className="font-bold text-white text-lg mb-3">{r.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/register" className="inline-flex items-center gap-2 bg-[#B5872A] hover:bg-[#C99A30] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl active:scale-95 text-base">
              Commencer ma demande maintenant <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="mt-4 text-white/40 text-sm">Inscription gratuite • Dossier en ligne • Pas de déplacement</div>
          </div>
        </div>
      </section>

      {/* ── TYPES DE PROJETS ── */}
      <section id="projets" className="bg-[#F1F4FA] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[#B5872A] text-sm font-bold uppercase tracking-widest mb-3">Secteurs éligibles</div>
            <h2 className="text-3xl font-extrabold text-[#0D1F3C] mb-3">Quels projets peuvent être financés ?</h2>
            <p className="text-[#5B6580] max-w-2xl mx-auto leading-relaxed">Les subventions non remboursables couvrent un large spectre d'activités économiques, sociales et environnementales. Voici les principaux secteurs éligibles.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TYPES_PROJETS.map((tp) => (
              <div key={tp.label} className="bg-white rounded-xl border border-[#DDE2EC] p-6 hover:border-[#0D1F3C]/30 hover:shadow-lg transition-all group cursor-default">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#0D1F3C]/5 group-hover:bg-[#0D1F3C]/10 rounded-xl flex items-center justify-center text-[#0D1F3C] transition-colors">
                    <tp.icon className="w-6 h-6" />
                  </div>
                  {tp.badge && (
                    <span className="bg-[#B5872A]/10 text-[#B5872A] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#B5872A]/20">{tp.badge}</span>
                  )}
                </div>
                <h3 className="font-bold text-[#0D1F3C] text-base mb-2">{tp.label}</h3>
                <p className="text-[#5B6580] text-sm leading-relaxed">{tp.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="inline-flex items-center gap-2 text-[#0D1F3C] font-semibold text-sm hover:underline">
              Vérifier l'éligibilité de mon projet <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROCESSUS ── */}
      <section id="processus" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[#B5872A] text-sm font-bold uppercase tracking-widest mb-3">Processus 100 % en ligne</div>
            <h2 className="text-3xl font-extrabold text-[#0D1F3C] mb-3">Comment obtenir votre financement ?</h2>
            <p className="text-[#5B6580] max-w-xl mx-auto">Un processus structuré, transparent et accompagné, de la soumission jusqu'au versement.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-0">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.n} className="relative flex flex-col">
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-0.5 bg-gradient-to-r from-[#DDE2EC] to-[#DDE2EC] z-0" />
                )}
                <div className={`relative text-center px-4 py-6 rounded-2xl border transition-all ${step.highlight ? 'bg-[#FBF5E0] border-[#B5872A]/30 shadow-md' : 'bg-[#F8F9FC] border-[#DDE2EC]'}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-[#B5872A] font-extrabold text-xs tracking-widest mb-1">{step.n}</div>
                  <h3 className="font-bold text-[#0D1F3C] text-base mb-3">{step.title}</h3>
                  <p className="text-[#5B6580] text-xs leading-relaxed mb-3">{step.desc}</p>
                  <div className="flex items-center justify-center gap-1 text-[#6B7896] text-[10px] font-semibold">
                    <Clock className="w-3 h-3" /> {step.detail}
                  </div>
                  {step.highlight && (
                    <div className="mt-3 bg-[#B5872A] text-white text-[10px] font-bold px-3 py-1.5 rounded-full inline-block">
                      ✓ Accord obtenu → Frais de confirmation : 456€ TTC
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/processus" className="inline-flex items-center gap-2 text-[#0D1F3C] border border-[#DDE2EC] hover:border-[#0D1F3C] px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-[#F1F4FA]">
              Voir le processus complet détaillé <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARTENAIRES ── */}
      <div className="bg-[#F1F4FA] border-y border-[#DDE2EC] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-[#8B9BB4] text-[10px] uppercase tracking-widest font-bold mb-6">Organismes financeurs & partenaires institutionnels</div>
          <div className="flex flex-wrap justify-center gap-3">
            {PARTENAIRES.map((p) => (
              <div key={p} className="bg-white border border-[#DDE2EC] rounded-full px-5 py-2 text-sm text-[#0D1F3C] font-medium hover:border-[#0D1F3C]/30 transition-colors">{p}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AVIS DÉFILANTS ── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[#B5872A] text-sm font-bold uppercase tracking-widest mb-3">Témoignages</div>
              <h2 className="text-3xl font-extrabold text-[#0D1F3C]">Ce que disent nos bénéficiaires</h2>
            </div>
            <Link href="/avis" className="hidden md:inline-flex items-center gap-2 text-[#0D1F3C] font-semibold text-sm hover:underline">
              Voir tous les avis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="reviews-track flex gap-5 w-max">
            {[...AVIS, ...AVIS].map((a, i) => (
              <div key={i} className="w-80 shrink-0 bg-[#F8F9FC] border border-[#DDE2EC] rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(a.note)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#B5872A] text-[#B5872A]" />)}
                  {[...Array(5 - a.note)].map((_, j) => <Star key={j} className="w-4 h-4 text-[#DDE2EC]" />)}
                </div>
                <p className="text-[#4B5574] text-sm leading-relaxed mb-4 line-clamp-4">« {a.texte} »</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#0D1F3C] text-sm">{a.name}</div>
                    <div className="text-[#8B9BB4] text-xs">{a.projet} · {a.territoire}</div>
                  </div>
                  <div className="text-[#8B9BB4] text-xs">{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-10">
          <Link href="/avis" className="inline-flex items-center gap-2 text-[#0D1F3C] border border-[#DDE2EC] hover:border-[#0D1F3C] px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-[#F1F4FA] md:hidden">
            Voir tous les avis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-[#F1F4FA] py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[#B5872A] text-sm font-bold uppercase tracking-widest mb-3">Questions fréquentes</div>
            <h2 className="text-3xl font-extrabold text-[#0D1F3C] mb-3">Tout ce que vous devez savoir</h2>
            <p className="text-[#5B6580]">Des réponses claires et précises à vos questions les plus courantes.</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.slice(0, 6).map((item, i) => (
              <div key={i} className="border border-[#DDE2EC] rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-[#F8F9FC] transition-colors"
                >
                  <span className="font-semibold text-[#0D1F3C] text-sm pr-4 leading-snug">{item.q}</span>
                  <span className="text-[#B5872A] shrink-0">
                    {openFaq === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-[#4B5574] text-sm leading-relaxed border-t border-[#F1F4FA] pt-4 bg-[#FAFBFD]">
                    {item.r}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="inline-flex items-center gap-2 text-[#0D1F3C] border border-[#DDE2EC] hover:border-[#0D1F3C] px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-white">
              Voir toutes les questions ({FAQ_ITEMS.length} au total) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ALERTE SÉCURITÉ ANTI-ARNAQUE ── */}
      <section className="py-16 bg-[#FFF8F0] border-y border-amber-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <h3 className="text-[#0D1F3C] font-extrabold text-lg">Avertissement officiel — Protégez-vous des arnaques</h3>
              </div>
              <p className="text-[#4B5574] text-sm leading-relaxed mb-5">
                Des individus malveillants usurpent l'identité de <strong>CapSubvention</strong> pour escroquer des porteurs de projets. Voici ce que vous devez impérativement savoir pour vous protéger :
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: "❌", title: "Aucun canal Telegram ni Facebook officiel", desc: "Tout groupe ou compte sur ces réseaux se réclamant de CapSubvention est une arnaque. Nous n'y sommes pas présents." },
                  { icon: "❌", title: "Nous ne demandons jamais de virement vers un tiers", desc: "Méfiez-vous de toute demande de \"frais de déblocage\", \"caution\", ou virement sur un compte externe. C'est une escroquerie." },
                  { icon: "❌", title: "Aucun agent ne vous contacte pour vos données bancaires", desc: "Nos Conseillers, agents, chargés de dossier ou experts ne vous demanderont jamais votre mot de passe, numéro de carte ou RIB complet." },
                  { icon: "✅", title: "Nos seuls canaux officiels : capsubvention.com et l'application mobile CapSubvention", desc: "Vérifiez l'URL de votre navigateur. Nos seules communications officielles proviennent de @capsubvention.com. L'APK est disponible uniquement en téléchargement sur capsubvention.com — ne l'installez jamais depuis une autre source." },
                ].map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${i === 3 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-100"}`}>
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className={`font-bold text-sm ${i === 3 ? "text-green-800" : "text-red-800"}`}>{item.title}</div>
                      <div className={`text-xs mt-0.5 leading-relaxed ${i === 3 ? "text-green-700" : "text-red-600"}`}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[#6B7896] text-xs">
                <Mail className="w-3.5 h-3.5 text-[#B5872A]" />
                <span>Signaler une arnaque ou un doute : <strong className="text-[#0D1F3C]">support@capsubvention.com</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APPLICATION MOBILE ── */}
      <section id="app-mobile" className="py-24 bg-gradient-to-br from-[#060F1E] via-[#0D1F3C] to-[#162B52] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#B5872A]/6 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#1A3561]/80 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/[0.03] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/[0.03] rounded-full" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT — contenu */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#B5872A]/15 border border-[#B5872A]/30 rounded-full px-4 py-1.5 text-[#D4A847] text-sm font-semibold mb-6">
                <Smartphone className="w-4 h-4" />
                Application mobile officielle
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                Suivez votre dossier<br />
                <span className="text-[#D4A847]">où que vous soyez</span>
              </h2>
              <p className="text-white/55 text-lg leading-relaxed mb-10">
                Déposez vos documents, consultez l'avancement de votre demande et échangez avec votre conseiller directement depuis votre smartphone Android.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-10">
                {[
                  { icon: "📲", label: "Dépôt de documents" },
                  { icon: "📊", label: "Suivi en temps réel" },
                  { icon: "💬", label: "Messagerie intégrée" },
                  { icon: "🔔", label: "Notifications push" },
                  { icon: "🔒", label: "Connexion sécurisée 2FA" },
                  { icon: "📂", label: "Espace personnel" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.09] rounded-xl px-3.5 py-3 hover:bg-white/[0.09] transition-colors">
                    <span className="text-base">{f.icon}</span>
                    <span className="text-white/75 text-sm font-medium">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Bouton téléchargement */}
              <div className="flex flex-col sm:flex-row gap-4 items-start mb-6">
                <a
                  href="/capsubvention-app.apk"
                  download="CapSubvention.apk"
                  className="group flex items-center gap-3 bg-[#B5872A] hover:bg-[#C99A30] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-2xl hover:shadow-[#B5872A]/40 hover:-translate-y-0.5 active:scale-95"
                >
                  <Download className="w-5 h-5 group-hover:animate-bounce" />
                  Télécharger l'APK Android
                </a>
                <div className="flex flex-col justify-center pt-1">
                  <div className="text-white/45 text-xs font-semibold">Version 1.0 · Android 7.0+</div>
                  <div className="text-white/25 text-[11px] mt-1 leading-relaxed">
                    Activez « Sources inconnues »<br />dans vos paramètres Android
                  </div>
                </div>
              </div>

              {/* Avertissement sécurité */}
              <div className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3.5">
                <Shield className="w-4 h-4 text-[#B5872A] flex-shrink-0 mt-0.5" />
                <p className="text-white/40 text-xs leading-relaxed">
                  <strong className="text-white/60">Application officielle CapSubvention.</strong> Disponible exclusivement sur capsubvention.com — ne téléchargez jamais depuis une source tierce.
                </p>
              </div>
            </div>

            {/* RIGHT — phone mockup animé */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative select-none">
                <div className="absolute inset-0 -m-16 rounded-full bg-[#B5872A]/10 blur-3xl pointer-events-none" />

                {/* Châssis téléphone */}
                <div className="relative w-[258px] h-[528px] rounded-[44px] bg-gradient-to-b from-[#2A3A55] to-[#1A2640] shadow-[0_0_60px_rgba(0,0,0,0.6)] ring-[1.5px] ring-[#B5872A]/50">

                  {/* Boutons latéraux */}
                  <div className="absolute -right-[3px] top-24 w-[3px] h-10 bg-[#2A3A55] rounded-r-sm" />
                  <div className="absolute -left-[3px] top-20 w-[3px] h-7 bg-[#2A3A55] rounded-l-sm" />
                  <div className="absolute -left-[3px] top-32 w-[3px] h-7 bg-[#2A3A55] rounded-l-sm" />

                  {/* Écran (zone clippée) */}
                  <div className="absolute inset-[10px] rounded-[36px] bg-[#060F1E] overflow-hidden">

                    {/* Barre de statut */}
                    <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-5 z-30 bg-[#060F1E]">
                      <span className="text-white/30 text-[9px] font-semibold">9:41</span>
                      <div className="absolute left-1/2 -translate-x-1/2 w-20 h-5 bg-[#060F1E] rounded-b-2xl" />
                      <div className="flex items-center gap-1">
                        <div className="flex gap-[2px] items-end h-3">
                          {[3,5,7,9].map((h,i) => <div key={i} className="w-[2px] bg-white/30 rounded-full" style={{height: h}} />)}
                        </div>
                        <div className="w-5 h-2.5 rounded-[3px] border border-white/20 relative ml-1">
                          <div className="absolute inset-[1.5px] right-[2px] bg-[#22C55E]/70 rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* SCREEN 0 — Dashboard */}
                    <div className={`absolute inset-0 transition-all duration-500 ${phoneScreen === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                      {/* Header */}
                      <div className="pt-8 px-4 pb-3 bg-[#060F1E] border-b border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#1A3561] flex items-center justify-center">
                              <span className="text-[#D4A847] font-black text-[10px]">CS</span>
                            </div>
                            <div>
                              <div className="text-white font-bold text-[11px] leading-none">CapSubvention</div>
                              <div className="text-white/30 text-[8px] mt-0.5">Mon espace</div>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="w-8 h-8 rounded-xl bg-[#B5872A]/15 flex items-center justify-center">
                              <span className="text-sm">🔔</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#B5872A] rounded-full flex items-center justify-center">
                              <span className="text-[7px] text-white font-bold">2</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Carte dossier */}
                      <div className="mx-3 mt-3 bg-[#112240] rounded-2xl p-3.5 border border-[#B5872A]/20">
                        <div className="text-white/30 text-[8px] font-semibold mb-1.5 tracking-wider">DOSSIER N° CS-2025-0843</div>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                          <span className="text-white font-bold text-[10px]">Instruction en cours</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1A3561] rounded-full overflow-hidden mb-1.5">
                          <div className="h-full bg-gradient-to-r from-[#B5872A] to-[#D4A847] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressWidth}%` }} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/25 text-[8px]">Avancement · Étape 3/5</span>
                          <span className="text-[#D4A847] text-[8px] font-bold">{progressWidth}%</span>
                        </div>
                      </div>
                      {/* Actions rapides */}
                      <div className="flex gap-2 mx-3 mt-2.5">
                        {[["📄","Documents"],["💬","Messages"],["🔔","Alertes"]].map(([icon, lbl], i) => (
                          <div key={i} className="flex-1 bg-[#112240] rounded-xl py-2.5 flex flex-col items-center gap-1 border border-white/5 relative">
                            <span className="text-base">{icon}</span>
                            <span className="text-white/40 text-[7px]">{lbl}</span>
                            {i === 1 && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#B5872A] rounded-full flex items-center justify-center"><span className="text-[7px] text-white font-bold">3</span></div>}
                          </div>
                        ))}
                      </div>
                      {/* Timeline */}
                      <div className="mx-3 mt-3">
                        <div className="text-white/25 text-[7.5px] font-bold tracking-wider mb-2">HISTORIQUE</div>
                        {[
                          { label: "Dossier déposé", date: "02 Jan 2025", done: true, color: "#22C55E" },
                          { label: "Pièces validées", date: "15 Jan 2025", done: true, color: "#22C55E" },
                          { label: "Instruction en cours", date: "En cours…", done: false, color: "#B5872A" },
                          { label: "Décision finale", date: "— à venir —", done: false, color: "#334155" },
                        ].map((s, i) => (
                          <div key={i} className="flex items-start gap-2.5 mb-2 last:mb-0">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full border-[1.5px] mt-0.5 flex-shrink-0" style={{ borderColor: s.color, backgroundColor: s.done ? s.color : 'transparent' }} />
                              {i < 3 && <div className="w-[1px] h-4 mt-0.5" style={{ backgroundColor: s.done && i < 2 ? '#22C55E' : '#1E293B' }} />}
                            </div>
                            <div>
                              <div className="text-[9px] font-semibold leading-none" style={{ color: s.done ? 'white' : 'rgba(255,255,255,0.25)' }}>{s.label}</div>
                              <div className="text-[7.5px] mt-0.5" style={{ color: s.done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)' }}>{s.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Bottom nav */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#060F1E] border-t border-white/5 flex items-center justify-around px-2">
                        {[["🏠","Accueil",true],["📁","Dossier",false],["💬","Messages",false],["👤","Profil",false]].map(([icon, lbl, active], i) => (
                          <div key={i} className="flex flex-col items-center gap-0.5">
                            <span className="text-sm">{icon}</span>
                            <span className={`text-[6px] ${active ? 'text-[#D4A847]' : 'text-white/20'}`}>{lbl as string}</span>
                            {active && <div className="w-3 h-[2px] bg-[#B5872A] rounded-full" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SCREEN 1 — Messagerie */}
                    <div className={`absolute inset-0 transition-all duration-500 ${phoneScreen === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                      <div className="pt-8 px-4 pb-3 bg-[#060F1E] border-b border-white/5 flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-[#B5872A]" />
                        <span className="text-white font-bold text-[11px]">Messagerie</span>
                        <div className="ml-auto w-5 h-5 bg-[#B5872A] rounded-full flex items-center justify-center">
                          <span className="text-[7px] text-white font-bold">3</span>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-2.5 mt-1">
                        {/* Conseillère info */}
                        <div className="flex items-center gap-2 bg-[#112240] rounded-xl p-2.5 border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A3561] to-[#B5872A] flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-[10px]">MB</span>
                          </div>
                          <div>
                            <div className="text-white text-[9px] font-bold">Mme Beaumont</div>
                            <div className="text-[#22C55E] text-[7px] flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />En ligne · Conseillère</div>
                          </div>
                        </div>
                        {/* Bulles de chat */}
                        <div className="bg-[#112240] rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%] self-start">
                          <p className="text-white/80 text-[8.5px] leading-relaxed">Bonjour, votre dossier est en cours de traitement. Avez-vous des pièces complémentaires ?</p>
                          <span className="text-white/20 text-[7px]">14:32</span>
                        </div>
                        <div className="bg-[#1A3561] rounded-xl rounded-tr-sm px-3 py-2 max-w-[80%] self-end">
                          <p className="text-white/80 text-[8.5px] leading-relaxed">Oui, je viens de les uploader. Merci !</p>
                          <span className="text-white/20 text-[7px] block text-right">14:35</span>
                        </div>
                        <div className="bg-[#112240] rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%] self-start">
                          <p className="text-white/80 text-[8.5px] leading-relaxed">Parfait ! Votre dossier est complet. Décision sous 15 jours.</p>
                          <span className="text-white/20 text-[7px]">14:41</span>
                        </div>
                        {/* Typing indicator */}
                        <div className="flex items-center gap-1.5 self-start mt-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1A3561] to-[#B5872A] flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-[7px]">MB</span>
                          </div>
                          <div className="bg-[#112240] rounded-xl px-3 py-2 flex items-center gap-1">
                            {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full phone-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
                          </div>
                        </div>
                        {/* Barre de saisie */}
                        <div className="absolute bottom-3 left-3 right-3 h-9 bg-[#112240] rounded-2xl border border-white/10 flex items-center px-3">
                          <span className="text-white/20 text-[8.5px]">Votre message…</span>
                          <div className="ml-auto w-6 h-6 bg-[#B5872A] rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px]">↑</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SCREEN 2 — Validation */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${phoneScreen === 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95 pointer-events-none'}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-[#0A2015] to-[#060F1E]" />
                      <div className="relative flex flex-col items-center px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#22C55E]/15 border-2 border-[#22C55E]/40 flex items-center justify-center mb-5">
                          <div className="w-14 h-14 rounded-full bg-[#22C55E]/25 flex items-center justify-center">
                            <span className="text-3xl">✅</span>
                          </div>
                        </div>
                        <div className="text-[#22C55E] font-black text-lg leading-tight mb-1">Dossier approuvé !</div>
                        <div className="text-white/40 text-[9px] mb-6">FEDER Martinique · Décision officielle</div>
                        <div className="bg-[#112240] rounded-2xl px-6 py-4 border border-[#22C55E]/20 w-full mb-4">
                          <div className="text-white/40 text-[8px] mb-1">MONTANT ACCORDÉ</div>
                          <div className="text-[#D4A847] font-black text-3xl">45 000€</div>
                          <div className="text-white/25 text-[7.5px] mt-1">Subvention non remboursable</div>
                        </div>
                        <div className="w-full bg-[#22C55E] rounded-2xl py-3 text-white font-bold text-[10px]">
                          Voir les détails du financement
                        </div>
                        <div className="mt-4 text-white/20 text-[7.5px]">Notification reçue le 15 Avr 2025 · 11h28</div>
                      </div>
                    </div>

                    {/* SCREEN 3 — Versement */}
                    <div className={`absolute inset-0 flex flex-col transition-all duration-500 ${phoneScreen === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                      <div className="pt-8 px-4 pb-3 bg-[#060F1E] border-b border-white/5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B5872A]" />
                        <span className="text-white font-bold text-[11px]">Versement</span>
                      </div>
                      <div className="flex flex-col items-center pt-8 px-5">
                        <div className="text-white/30 text-[8.5px] font-semibold tracking-wider mb-2">VIREMENT EN COURS</div>
                        <div className="text-[#D4A847] font-black text-[42px] leading-none mb-1">45 000€</div>
                        <div className="text-white/30 text-[8.5px] mb-8">vers votre compte · BIC FR76 ···· 0843</div>
                        {/* Étapes virement */}
                        <div className="w-full space-y-2 mb-6">
                          {[
                            { label: "Subvention accordée", done: true },
                            { label: "Virement initié", done: true },
                            { label: "En cours de traitement", done: false, active: true },
                            { label: "Crédité sur votre compte", done: false },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? 'bg-[#22C55E]' : s.active ? 'bg-[#B5872A] animate-pulse' : 'bg-[#1E293B] border border-white/10'}`}>
                                {s.done && <span className="text-white text-[8px] font-bold">✓</span>}
                                {s.active && <span className="text-white text-[8px] font-bold">→</span>}
                              </div>
                              <span className={`text-[9px] font-medium ${s.done || s.active ? 'text-white' : 'text-white/25'}`}>{s.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="w-full bg-[#112240] rounded-2xl p-3.5 border border-white/5 text-center">
                          <div className="text-white/30 text-[7.5px] mb-0.5">Arrivée estimée</div>
                          <div className="text-white font-bold text-[11px]">2 à 5 jours ouvrés</div>
                        </div>
                      </div>
                    </div>

                  </div>{/* fin écran */}

                  {/* Indicateur d'écran (dots) */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {[0,1,2,3].map(i => (
                      <button key={i} onClick={() => setPhoneScreen(i)} className={`rounded-full transition-all duration-300 ${phoneScreen === i ? 'w-5 h-1.5 bg-[#B5872A]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`} />
                    ))}
                  </div>

                </div>{/* fin châssis */}

                {/* Badges flottants dynamiques */}
                <div className={`absolute -left-12 top-20 bg-white rounded-2xl shadow-2xl px-3 py-2.5 flex items-center gap-2.5 border border-[#DDE2EC] transition-all duration-500 ${phoneScreen === 0 || phoneScreen === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs">✅</div>
                  <div>
                    <div className="text-[#0D1F3C] font-bold text-xs">{phoneScreen === 2 ? 'Dossier approuvé' : 'Dossier validé'}</div>
                    <div className="text-[#6B7896] text-[10px]">il y a 2 heures</div>
                  </div>
                </div>

                <div className={`absolute -right-12 top-48 bg-white rounded-2xl shadow-2xl px-3 py-2.5 flex items-center gap-2.5 border border-[#DDE2EC] transition-all duration-500 ${phoneScreen === 2 || phoneScreen === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}>
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-sm">💶</div>
                  <div>
                    <div className="text-[#0D1F3C] font-bold text-xs">45 000€</div>
                    <div className="text-[#6B7896] text-[10px]">Subvention accordée</div>
                  </div>
                </div>

                <div className={`absolute -left-12 bottom-32 bg-white rounded-2xl shadow-2xl px-3 py-2.5 flex items-center gap-2.5 border border-[#DDE2EC] transition-all duration-500 ${phoneScreen === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm">💬</div>
                  <div>
                    <div className="text-[#0D1F3C] font-bold text-xs">Nouveau message</div>
                    <div className="text-[#6B7896] text-[10px]">Mme Beaumont · Conseillère</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 left-4 w-32 h-32 border-2 border-white rounded-full" />
              <div className="absolute bottom-4 right-4 w-48 h-48 border-2 border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white rounded-full" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#B5872A]/20 border border-[#B5872A]/30 rounded-full px-4 py-1.5 text-sm text-[#D4A847] font-semibold mb-6">
                <span className="w-2 h-2 bg-[#D4A847] rounded-full animate-pulse" /> Dossiers en cours d'acceptation
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Prêt à financer votre projet ?</h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                Rejoignez les 3 500+ porteurs de projets qui ont bénéficié de financements non remboursables grâce à CapSubvention. L'inscription est gratuite, le processus 100 % en ligne.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register" className="bg-[#B5872A] hover:bg-[#C99A30] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl active:scale-95 text-base">
                  Créer mon compte gratuitement
                </Link>
                <Link href="/login" className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-8 py-4 rounded-xl transition-all text-base">
                  J'ai déjà un compte
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-white/50 text-xs">
                <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Inscription gratuite</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Processus 100% en ligne</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Aucun déplacement requis</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Données chiffrées RGPD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080F1E] py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0D1F3C] to-[#265494] flex items-center justify-center font-bold text-white text-xs shadow-md">CS</div>
                <div>
                  <div className="font-bold text-white text-sm">CapSubvention</div>
                  <div className="text-white/30 text-[10px]">Plateforme officielle</div>
                </div>
              </div>
              <p className="text-white/35 text-xs leading-relaxed mb-4">Plateforme d'accès aux financements non remboursables pour les territoires d'Outre-Mer français, encadrée par l'Article L1611-2 CGCT.</p>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-[#B5872A]" />
                <span className="text-white/30 text-xs">Données hébergées en France</span>
              </div>
            </div>
            <div>
              <div className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-4">Territoires</div>
              {TERRITORIES.map((t) => (
                <div key={t.name} className="text-white/35 text-xs py-1.5 hover:text-white/60 transition-colors cursor-default">{t.name}</div>
              ))}
            </div>
            <div>
              <div className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-4">Navigation</div>
              {[
                { label: "Comment ça marche", href: "/processus" },
                { label: "Projets éligibles", href: "#projets" },
                { label: "FAQ complète", href: "/faq" },
                { label: "Témoignages", href: "/avis" },
                { label: "📱 Application Android", href: "#app-mobile" },
                { label: "Connexion", href: "/login" },
                { label: "Créer un compte", href: "/register" },
              ].map((l) => (
                <div key={l.label} className="py-1.5">
                  <Link href={l.href} className="text-white/35 text-xs hover:text-white/60 transition-colors">{l.label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-4">Contact & Support</div>
              <div className="space-y-3 text-white/35 text-xs">
                <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-[#B5872A]" /> support@capsubvention.com</div>
                <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-[#B5872A]" /> +33 (0) 800 123 456</div>
                <div className="flex items-start gap-2"><MapPin className="w-3 h-3 text-[#B5872A] mt-0.5" /> <span>Disponible pour les 5 territoires<br/>d'Outre-Mer français</span></div>
                <div className="pt-2 text-white/20">Lun – Ven : 8h00 – 18h00 (heure Paris)</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20">
            <span>© 2025 CapSubvention — Tous droits réservés — Article L1611-2 CGCT</span>
            <div className="flex gap-5">
              {["Mentions légales", "Politique de confidentialité", "CGU", "Accessibilité"].map(l => (
                <span key={l} className="cursor-pointer hover:text-white/45 transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
