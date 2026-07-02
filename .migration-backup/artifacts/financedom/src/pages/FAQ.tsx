import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, ArrowLeft, Search, Shield, Euro, Clock, FileText, Globe, ArrowRight, ShieldAlert } from "lucide-react";

const FAQ_CATEGORIES = [
  {
    id: "general",
    label: "Généralités",
    icon: Globe,
    questions: [
      {
        q: "Qu'est-ce que CapSubvention et quel est son rôle ?",
        r: "CapSubvention est la plateforme officielle de demande et de suivi des subventions non remboursables pour les porteurs de projets résidant ou opérant dans les 5 territoires d'Outre-Mer français : Martinique, Guadeloupe, La Réunion, Nouvelle-Calédonie et Polynésie française. Opérant dans le cadre juridique défini par l'Article L1611-2 du Code Général des Collectivités Territoriales (CGCT), notre plateforme connecte les porteurs de projets éligibles avec les organismes financeurs publics et européens compétents.",
      },
      {
        q: "Qu'est-ce qu'une subvention non remboursable ?",
        r: "Une subvention non remboursable est une aide financière accordée par l'État, une collectivité territoriale ou l'Union Européenne, qui n'a pas à être restituée une fois versée. Contrairement à un prêt bancaire, elle ne génère aucun endettement, aucune charge d'intérêts et n'alourdit pas votre bilan financier. Elle est définitivement acquise dès lors que les conditions d'attribution sont respectées et que le projet est réalisé conformément au plan approuvé par l'organisme financeur.",
      },
      {
        q: "Pourquoi ces financements existent-ils spécifiquement pour les DOM/COM ?",
        r: "Les territoires d'Outre-Mer français présentent des handicaps structurels reconnus par le droit européen (article 349 TFUE) : éloignement géographique, insularité, dépendance aux importations, marchés locaux restreints et difficultés d'accès au crédit bancaire classique. Pour corriger ces déséquilibres, l'Union Européenne a accordé à ces régions un accès privilégié aux fonds structurels européens (FEDER, FSE+, FEADER), complété par des programmes nationaux spécifiques de l'État français. L'objectif est de stimuler le développement économique, social et environnemental de ces territoires.",
      },
      {
        q: "Quels territoires sont couverts par CapSubvention ?",
        r: "CapSubvention couvre les 5 territoires suivants : la Martinique, la Guadeloupe, La Réunion, la Nouvelle-Calédonie et la Polynésie française. Chaque territoire bénéficie de dispositifs spécifiques adaptés à ses réalités économiques, culturelles et géographiques propres. Les dispositifs disponibles, les montants et les conditions d'éligibilité peuvent varier d'un territoire à l'autre.",
      },
      {
        q: "Puis-je déposer un dossier si je n'habite pas encore le territoire concerné ?",
        r: "En règle générale, le porteur de projet doit être domicilié dans le territoire concerné ou y avoir son siège social. Certains dispositifs permettent toutefois des exceptions pour les projets d'installation. Nous vous recommandons de créer votre compte et de déposer votre dossier pour que nos experts puissent analyser votre situation spécifique.",
      },
    ],
  },
  {
    id: "eligibilite",
    label: "Éligibilité",
    icon: Shield,
    questions: [
      {
        q: "Qui peut déposer un dossier de demande de financement ?",
        r: "Peuvent déposer un dossier : les personnes physiques majeures (entrepreneurs individuels, micro-entrepreneurs, professions libérales), les personnes morales (SARL, SAS, SA, EURL, coopératives), les associations loi 1901 ou leurs équivalents locaux, les collectivités et leurs établissements publics, les groupements d'intérêt économique (GIE), les agriculteurs et groupements agricoles, et les artisans. La condition principale est que le porteur soit établi ou réside dans l'un des 5 territoires couverts.",
      },
      {
        q: "Quels types de projets sont éligibles ?",
        r: "Les projets éligibles couvrent un large spectre : création et développement d'entreprise, innovation et transformation numérique, agriculture et pêche, environnement et énergies renouvelables, tourisme durable, logement et habitat social, formation professionnelle et insertion, culture et sport, santé et action sociale, et projets associatifs d'utilité locale. Chaque dispositif a ses propres critères d'éligibilité sectorielle.",
      },
      {
        q: "Mon projet peut-il être refusé ? Pour quelles raisons ?",
        r: "Oui, un dossier peut être refusé ou déclaré non recevable dans plusieurs cas : le projet ne relève pas du secteur éligible au dispositif sollicité, le porteur ne remplit pas les conditions de résidence ou de statut juridique, le projet est déjà réalisé ou en cours de réalisation avant la demande, le dossier est incomplet malgré les demandes de compléments, le projet présente un risque économique ou financier trop élevé selon les critères de l'organisme financeur, ou le budget prévisionnel est irréaliste ou incohérent. En cas de refus, vous recevez une notification motivée.",
      },
      {
        q: "Est-ce que je peux cumuler plusieurs subventions pour le même projet ?",
        r: "Le cumul est possible dans certaines limites. La règle générale est que le total des aides publiques perçues (subventions, bonifications de taux, garanties, avances remboursables) ne peut excéder les plafonds fixés par les règlements européens de minimis (généralement 300 000€ sur 3 ans pour les PME, hors secteurs spécifiques) et ne peut pas dépasser 100% des dépenses éligibles du projet. Nos experts analysent les possibilités de cumul et vous orientent vers la combinaison optimale.",
      },
      {
        q: "Mon projet porte sur plusieurs territoires. Comment déposer ma demande ?",
        r: "Si votre projet s'étend sur plusieurs territoires couverts par CapSubvention, vous devez déposer un dossier distinct pour chaque volet territorial, en précisant les activités et les coûts spécifiques à chaque territoire. Nos experts vous accompagnent pour optimiser la structuration multi-territoriale de votre demande.",
      },
    ],
  },
  {
    id: "frais",
    label: "Frais d'instruction",
    icon: Euro,
    questions: [
      {
        q: "À quoi correspondent exactement les frais d'instruction de 456€ TTC ?",
        r: "Les frais d'instruction (380€ HT / 456€ TTC — TVA 20%) sont des frais administratifs réglementaires prévus par l'Article L1611-2 du Code Général des Collectivités Territoriales (CGCT). Ils couvrent : l'analyse administrative et la vérification de conformité des pièces justificatives, l'expertise économique et financière du projet par des experts agréés, la certification des documents par des professionnels accrédités, la constitution du dossier final auprès de l'organisme financeur, et le suivi du dossier jusqu'à sa transmission.",
      },
      {
        q: "Quand les frais d'instruction sont-ils prélevés ?",
        r: "Les frais d'instruction sont émis uniquement une fois votre financement formellement confirmé par l'organisme compétent. Vous recevez d'abord une notification officielle d'accord de financement, puis une facture de 456€ TTC. Le règlement de cette facture est la formalité qui scelle votre accord et déclenche la transmission finale de votre dossier. Vous ne payez jamais en amont d'une décision — vous payez parce que vous avez obtenu.",
      },
      {
        q: "Que se passe-t-il si aucun financement n'est accordé ?",
        r: "Si votre dossier n'aboutit pas à un accord de financement, aucun frais ne vous est demandé. Notre modèle est simple : les frais d'instruction sont la formalité de confirmation d'un accord obtenu. Pas d'accord, pas de frais. Dans le cas exceptionnel où une convention déjà signée serait annulée pour des raisons extérieures et indépendantes de votre volonté, notre équipe examinerait la situation au cas par cas.",
      },
      {
        q: "Puis-je payer les frais d'instruction en plusieurs fois ?",
        r: "Actuellement, les frais d'instruction de 456€ TTC sont payables en une seule fois via votre espace personnel (carte bancaire Visa ou Mastercard). Le paiement en plusieurs fois n'est pas disponible pour le moment. Si cette contrainte vous pose des difficultés, contactez notre équipe support pour étudier des solutions alternatives.",
      },
      {
        q: "Puis-je déduire ces frais fiscalement ?",
        r: "Oui, dans la plupart des cas, les frais d'instruction constituent des charges d'exploitation déductibles du résultat fiscal pour les entreprises et les travailleurs indépendants. Pour les associations et les collectivités, les conditions de déductibilité varient selon leur régime fiscal. Une facture officielle vous est remise pour justifier ces dépenses auprès de votre comptable ou des services fiscaux.",
      },
    ],
  },
  {
    id: "delais",
    label: "Délais & Processus",
    icon: Clock,
    questions: [
      {
        q: "Combien de temps prend l'ensemble du processus, de l'inscription au versement ?",
        r: "De la création de votre compte au versement effectif de la subvention, le délai global est généralement compris entre 45 et 120 jours selon la complexité du projet, la complétude du dossier initial et le dispositif de financement visé. Voici les grandes étapes : constitution du dossier (1–5 jours), instruction administrative (30–90 jours), paiement des frais et transmission (2–5 jours), validation par l'organisme financeur (15–30 jours). Un dossier bien constitué dès le départ réduit considérablement les délais.",
      },
      {
        q: "Comment savoir où en est mon dossier ?",
        r: "Votre espace personnel CapSubvention centralise toutes les informations sur l'avancement de votre dossier en temps réel. Chaque changement de statut (soumis, en instruction, frais émis, transmis, validé, versé) déclenche une notification email et une mise à jour de votre tableau de bord. Vous pouvez également envoyer des messages à votre conseiller directement depuis votre espace.",
      },
      {
        q: "Que se passe-t-il si mon dossier est incomplet ?",
        r: "Si votre dossier est incomplet, nos experts vous envoient une demande de compléments détaillée précisant les pièces manquantes ou insuffisantes. Vous avez alors un délai de 15 jours (prolongeable sur demande) pour fournir les éléments requis. Passé ce délai sans réponse, votre dossier peut être mis en attente ou archivé. Nous vous recommandons de traiter ces demandes en priorité pour éviter tout retard supplémentaire.",
      },
      {
        q: "La subvention est-elle versée en une seule fois ?",
        r: "Cela dépend du dispositif de financement et du montant accordé. Pour les petits montants (inférieurs à 30 000€), le versement est généralement effectué en une seule tranche. Pour les projets plus importants, le versement peut être échelonné en 2 ou 3 tranches liées à l'avancement du projet (versement initial, versement intermédiaire sur justificatifs de réalisation, versement final). Les modalités sont précisées dans la convention de subvention signée avec l'organisme financeur.",
      },
    ],
  },
  {
    id: "documents",
    label: "Documents & Sécurité",
    icon: FileText,
    questions: [
      {
        q: "Quels documents dois-je préparer avant de déposer mon dossier ?",
        r: "Les documents essentiels à préparer en amont sont : une pièce d'identité valide (CNI ou passeport recto/verso), un justificatif de domicile de moins de 3 mois, un RIB au nom du porteur ou de l'entité, un extrait Kbis ou les statuts de l'entité (pour les sociétés et associations), une description détaillée du projet (2 à 5 pages), un plan de financement prévisionnel (tableau recettes/dépenses), et des devis ou estimations de coûts. Des documents supplémentaires peuvent être requis selon le dispositif visé.",
      },
      {
        q: "Mes documents sont-ils sécurisés sur la plateforme ?",
        r: "La sécurité de vos documents est une priorité absolue. Toutes les transmissions sont chiffrées via TLS 1.3. Les documents sont stockés sur des serveurs sécurisés situés en France, conformément aux exigences du RGPD. L'accès à vos documents est strictement limité aux experts en charge de votre dossier et aux agents des organismes financeurs compétents. Aucune donnée n'est transmise à des tiers commerciaux.",
      },
      {
        q: "Quels formats de fichiers sont acceptés ?",
        r: "Les formats de fichiers acceptés sont : PDF (recommandé pour sa compatibilité universelle), JPEG et PNG pour les photos de documents, DOCX pour les documents texte, et XLSX pour les tableaux financiers. Chaque fichier ne doit pas dépasser 20 MB. Pour les documents volumineux, nous recommandons de les compresser avant l'envoi ou de les diviser en plusieurs fichiers.",
      },
      {
        q: "Mes données personnelles sont-elles protégées conformément au RGPD ?",
        r: "Oui, CapSubvention respecte intégralement le Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679). Vous disposez des droits suivants sur vos données : droit d'accès, droit de rectification, droit à l'effacement, droit à la portabilité, et droit d'opposition. Pour exercer ces droits, contactez notre Délégué à la Protection des Données (DPD) à l'adresse dpo@capsubvention.com. Vos données sont conservées pendant la durée légale applicable aux dossiers de subventions publiques.",
      },
      {
        q: "Puis-je modifier mon dossier après l'avoir soumis ?",
        r: "Une fois soumis, votre dossier passe en phase d'instruction et ne peut plus être modifié directement. Si vous souhaitez apporter des corrections ou des compléments, vous devez contacter votre conseiller via la messagerie de votre espace personnel. Les modifications importantes (changement de projet, modification du montant demandé, changement de territoire) peuvent nécessiter le dépôt d'un nouveau dossier.",
      },
    ],
  },
  {
    id: "securite",
    label: "Sécurité & Arnaques",
    icon: ShieldAlert,
    questions: [
      {
        q: "CapSubvention dispose-t-il d'un canal Telegram ou d'une page Facebook officielle ?",
        r: "Non, absolument pas. CapSubvention n'est présent sur aucun réseau social grand public et ne dispose d'aucun canal Telegram officiel. Tout compte, groupe Telegram, page Facebook, Instagram, TikTok ou WhatsApp non vérifiable se réclamant de CapSubvention est une usurpation d'identité. Ces faux comptes sont utilisés par des escrocs pour vous soutirer de l'argent. Nos seuls canaux officiels sont la plateforme capsubvention.com et l'application mobile CapSubvention (APK disponible exclusivement en téléchargement sur capsubvention.com). Signalez immédiatement ces comptes frauduleux aux autorités (cybermalveillance.gouv.fr) et à notre équipe : support@capsubvention.com.",
      },
      {
        q: "CapSubvention peut-il me demander de transférer des fonds sur un autre compte ?",
        r: "Jamais. CapSubvention ne vous demandera JAMAIS de transférer des fonds sur un compte tiers, de recharger une carte, de payer des \"frais de déblocage\", une \"caution de versement\" ou une \"taxe douanière\" à une personne physique ou à un compte externe à notre plateforme. Les seuls frais légitimes de CapSubvention sont les frais d'instruction administrative (456 € TTC, Article L1611-2 CGCT), payables exclusivement et sécurisément depuis votre espace personnel sur capsubvention.com, et uniquement après confirmation officielle de votre subvention par l'organisme compétent. Toute autre demande de paiement est une escroquerie.",
      },
      {
        q: "Un agent ou conseiller CapSubvention peut-il me contacter pour mes informations bancaires ?",
        r: "Non, jamais. Aucun membre de notre équipe — qu'il s'agisse d'un Conseiller CapSubvention, d'un chargé de dossier, d'un expert financier, d'un agent partenaire, d'un auditeur ou de tout autre représentant — ne vous contactera par téléphone, SMS, e-mail non officiel ou messagerie externe pour vous demander : votre mot de passe, votre numéro de carte bancaire, votre CVV, un code SMS de validation, votre RIB complet ou toute information confidentielle. Raccrochez immédiatement et signalez cet appel à support@capsubvention.com.",
      },
      {
        q: "Comment identifier une communication officielle de CapSubvention ?",
        r: "Les communications officielles de CapSubvention proviennent exclusivement des adresses e-mail se terminant par @capsubvention.com. Nos seuls canaux officiels sont le site capsubvention.com et l'application mobile CapSubvention (APK téléchargeable uniquement depuis capsubvention.com — ne l'installez jamais depuis une autre source). Vérifiez toujours l'URL dans votre navigateur (https://www.capsubvention.com). Nous ne communiquons jamais via des numéros de téléphone personnels, des applications de messagerie tierces (WhatsApp, Telegram, Signal) ou des adresses Gmail/Hotmail/Yahoo. En cas de doute sur une communication reçue, contactez-nous directement via votre espace personnel ou à l'adresse support@capsubvention.com avant d'agir.",
      },
      {
        q: "Que faire si j'ai été victime d'une arnaque se réclamant de CapSubvention ?",
        r: "Agissez immédiatement : 1. Contactez votre banque pour bloquer les virements ou transactions frauduleuses. 2. Portez plainte auprès de la gendarmerie ou police nationale. 3. Signalez l'arnaque sur cybermalveillance.gouv.fr (service officiel gouvernemental). 4. Informez-nous à support@capsubvention.com avec tous les détails (captures d'écran, numéros, adresses e-mail des escrocs) pour que nous puissions alerter nos utilisateurs. Conservez toutes les preuves : messages, reçus de virement, captures d'écran.",
      },
    ],
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("general");
  const [search, setSearch] = useState("");

  const allQuestions = FAQ_CATEGORIES.flatMap(c => c.questions.map(q => ({ ...q, cat: c.id })));
  const filtered = search.trim()
    ? allQuestions.filter(q => q.q.toLowerCase().includes(search.toLowerCase()) || q.r.toLowerCase().includes(search.toLowerCase()))
    : null;

  const activeQuestions = filtered ?? FAQ_CATEGORIES.find(c => c.id === activeCategory)?.questions ?? [];

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
              Déposer un dossier
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] py-20 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Questions fréquentes</h1>
          <p className="text-white/65 text-lg mb-8">Toutes les réponses sur le fonctionnement de CapSubvention et les financements non remboursables.</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-[#6B7896] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/95 text-[#0D1F3C] rounded-xl px-4 py-3.5 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5872A] placeholder-[#8B9BB4] shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!search && (
          <div className="flex flex-wrap gap-3 mb-8">
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === cat.id ? 'bg-[#0D1F3C] text-white shadow-md' : 'bg-white border border-[#DDE2EC] text-[#4B5574] hover:border-[#0D1F3C]/30 hover:text-[#0D1F3C]'}`}
              >
                <cat.icon className="w-4 h-4" /> {cat.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#F1F4FA] text-[#6B7896]'}`}>
                  {cat.questions.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {search && filtered && (
          <div className="mb-6 text-[#5B6580] text-sm">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour "<strong>{search}</strong>"
          </div>
        )}

        <div className="space-y-3">
          {(search ? filtered! : activeQuestions).map((item, i) => {
            const key = `${activeCategory}-${i}`;
            return (
              <div key={key} className="border border-[#DDE2EC] rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => setOpenItem(openItem === key ? null : key)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-[#FAFBFD] transition-colors"
                >
                  <span className="font-semibold text-[#0D1F3C] text-sm pr-4 leading-snug">{item.q}</span>
                  <span className="text-[#B5872A] shrink-0">
                    {openItem === key ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>
                {openItem === key && (
                  <div className="px-6 pb-6 border-t border-[#F1F4FA] pt-4 bg-[#FAFBFD]">
                    <p className="text-[#4B5574] text-sm leading-relaxed">{item.r}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!search && activeQuestions.length === 0 && (
          <div className="text-center py-12 text-[#8B9BB4]">Aucune question dans cette catégorie.</div>
        )}

        <div className="mt-12 bg-white border border-[#DDE2EC] rounded-2xl p-8 text-center shadow-sm">
          <div className="text-[#0D1F3C] font-bold text-lg mb-2">Vous n'avez pas trouvé votre réponse ?</div>
          <p className="text-[#5B6580] text-sm mb-6">Notre équipe support est disponible du lundi au vendredi, de 8h à 18h.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:support@capsubvention.com" className="inline-flex items-center gap-2 bg-[#0D1F3C] hover:bg-[#162B52] text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md text-sm">
              Écrire au support
            </a>
            <Link href="/register" className="inline-flex items-center gap-2 border border-[#DDE2EC] hover:border-[#0D1F3C] text-[#0D1F3C] font-semibold px-6 py-3 rounded-lg transition-all text-sm">
              Déposer mon dossier <ArrowRight className="w-4 h-4" />
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
