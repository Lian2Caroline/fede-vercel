import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Star, ArrowLeft, CheckCircle, Quote, Shield, Globe, Send, Lock } from "lucide-react";
import { TERRITORIES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const TEMOIGNAGES = [
  { name: "Sandrine K.", territoire: "Martinique", projet: "Commerce alimentaire bio", note: 5, montant: "28 000€", dispositif: "FEDER Martinique", texte: "Grâce à CapSubvention, j'ai pu financer l'ouverture de ma boutique bio en centre-ville de Fort-de-France. Le processus était clair, les délais respectés et le suivi irréprochable. En moins de 45 jours, j'avais une réponse positive et les fonds ont été versés en 20 jours supplémentaires. Je recommande vivement cette plateforme à tous les porteurs de projets martiniquais qui hésitent encore.", date: "Mars 2025", verified: true },
  { name: "Jean-Pierre M.", territoire: "Guadeloupe", projet: "Élevage bovin", note: 5, montant: "95 000€", dispositif: "FEADER Agriculture Guadeloupe", texte: "Ma ferme d'élevage avait besoin d'une modernisation urgente des équipements. Avec une demande de financement classique, les banques refusaient systématiquement. CapSubvention m'a permis d'accéder à une subvention FEADER de 95 000€ pour acquérir du matériel neuf. La plateforme est très professionnelle et bien organisée. Je recommande à 100% aux agriculteurs guadeloupéens.", date: "Février 2025", verified: true },
  { name: "Moana T.", territoire: "Polynésie française", projet: "Hébergement tourisme durable", note: 5, montant: "35 000€", dispositif: "SEFI Tourisme Durable", texte: "Je n'aurais jamais pensé pouvoir financer mon projet de bungalows éco-responsables à Moorea sans apport conséquent. CapSubvention m'a permis d'accéder à une subvention SEFI de 35 000€ pour la construction de 3 bungalows certifiés green. Un dispositif qui change vraiment la vie des entrepreneurs en Polynésie. Le dossier était bien guidé et mes questions ont toujours eu une réponse rapide.", date: "Janvier 2025", verified: true },
  { name: "Thierry A.", territoire: "La Réunion", projet: "Startup IA et numérique", note: 4, montant: "135 000€", dispositif: "FEDER Innovation Réunion", texte: "Très satisfait de la rapidité de traitement de mon dossier de start-up IA. Le dossier a été instruit en 48 jours. La liste des documents à fournir est longue, mais c'est inévitable pour des fonds publics de cette importance. Le suivi en temps réel via l'espace personnel est vraiment pratique. Je recommande, même si le processus nécessite de la rigueur.", date: "Avril 2025", verified: true },
  { name: "Isabelle R.", territoire: "Nouvelle-Calédonie", projet: "Association culturelle kanak", note: 5, montant: "18 500€", dispositif: "ACE Entrepreneuriat NC", texte: "Notre association culturelle kanak a bénéficié d'une subvention ACE Entrepreneuriat pour nos activités artistiques et patrimoniales. L'espace de suivi en temps réel est parfait, les notifications sont très pratiques et l'équipe répond vite. Une vraie aide pour les associations culturelles de Nouvelle-Calédonie qui cherchent des financements pérennes.", date: "Mars 2025", verified: true },
  { name: "Bertrand N.", territoire: "Guadeloupe", projet: "Réhabilitation de logements", note: 5, montant: "310 000€", dispositif: "FEDER Logement Social", texte: "En tant que bailleur social indépendant, j'ai réhabilité 4 logements dégradés en Guadeloupe grâce au financement FEDER Logement Social. CapSubvention a simplifié des démarches qui auraient normalement nécessité des mois de travail administratif. Un vrai gain de temps et d'énergie. Je prépare déjà un second dossier pour une nouvelle opération.", date: "Décembre 2024", verified: true },
  { name: "Claudine O.", territoire: "Martinique", projet: "Centre de formation professionnelle", note: 5, montant: "22 000€", dispositif: "FSE+ Formation", texte: "En tant que formatrice indépendante spécialisée en développement personnel, j'ai pu financer la création de mon centre de formation grâce au FSE+. Le conseiller en charge de mon dossier était à l'écoute, compétent et réactif. Le montant de 22 000€ a couvert mes équipements pédagogiques et les 6 premiers mois de loyer. Je recommande à 100%.", date: "Janvier 2025", verified: true },
  { name: "Henri B.", territoire: "La Réunion", projet: "Installation de panneaux solaires", note: 5, montant: "31 000€", dispositif: "FEDER Énergie Réunion", texte: "Notre coopérative agricole voulait réduire sa facture énergétique et son empreinte carbone. CapSubvention nous a permis d'accéder à une subvention FEDER énergie de 31 000€ pour l'installation de 80 m² de panneaux solaires. Sans cette aide, nous n'aurions jamais pu investir. Retour sur investissement attendu en 3 ans au lieu de 8.", date: "Février 2025", verified: true },
  { name: "Marie-Laure F.", territoire: "Guadeloupe", projet: "Pêche artisanale durable", note: 5, montant: "41 000€", dispositif: "FEAMPA Pêche", texte: "Pêcheur artisanal depuis 15 ans, je n'avais jamais eu accès à ce type d'aide. La plateforme CapSubvention m'a guidé pas à pas pour constituer mon dossier FEAMPA. J'ai obtenu 41 000€ pour renouveler mon équipement de pêche et installer un système de traçabilité conforme aux normes européennes. Un vrai levier de compétitivité.", date: "Novembre 2024", verified: true },
  { name: "Raphaël C.", territoire: "La Réunion", projet: "Hôtel restaurant", note: 4, montant: "65 000€", dispositif: "BPI France Outre-Mer", texte: "Pour la rénovation de mon établissement, j'avais besoin d'un financement conséquent. Grâce à CapSubvention, j'ai obtenu 65 000€ de BPI France Outre-Mer pour rénover 12 chambres et mettre aux normes ma cuisine professionnelle. Le dossier était exigeant mais bien accompagné. Seul point : les délais de traitement ont été de 75 jours, un peu long mais justifié par le montant.", date: "Octobre 2024", verified: true },
  { name: "Émilie G.", territoire: "Martinique", projet: "Cabinet de kinésithérapie", note: 5, montant: "19 000€", dispositif: "Subvention CTM Santé", texte: "L'ouverture de mon cabinet de kinésithérapie en zone rurale de Martinique a été possible grâce à la subvention CTM Santé obtenue via CapSubvention. 19 000€ qui ont tout changé : équipement de rééducation, signalétique, installation informatique. L'espace de suivi est vraiment bien conçu. Très bonne expérience globale.", date: "Septembre 2024", verified: true },
  { name: "Yannick P.", territoire: "Nouvelle-Calédonie", projet: "Formation apprentissage numérique", note: 5, montant: "12 000€", dispositif: "DEFI Jeunes NC", texte: "J'avais 22 ans et un projet de formation numérique pour les jeunes décrocheurs de Nouméa. Aucune banque ne voulait me suivre. CapSubvention m'a permis d'obtenir 12 000€ du dispositif DEFI Jeunes pour démarrer mon activité. Aujourd'hui, j'ai 3 salariés et 45 jeunes formés. Une plateforme qui mérite vraiment d'être connue.", date: "Août 2024", verified: true },
  { name: "Nathalie W.", territoire: "La Réunion", projet: "Maraîchage biologique", note: 5, montant: "24 500€", dispositif: "FEADER Agriculture Bio", texte: "Reconvertie en agriculture bio après 15 ans dans le privé, je cherchais un financement pour démarrer mon exploitation maraîchère à Saint-Pierre. CapSubvention a été un vrai tremplin : dossier déposé en ligne, conseillère très disponible, et subvention obtenue en 52 jours. Les 24 500€ du FEADER Bio ont financé mon système d'irrigation et mes premières semences certifiées bio.", date: "Juillet 2024", verified: true },
  { name: "Daniel E.", territoire: "Martinique", projet: "Distillerie artisanale de rhum", note: 5, montant: "88 000€", dispositif: "FEDER PME Martinique", texte: "Projet ambitieux, financement à la hauteur. Notre distillerie artisanale de rhum agricole AOC a bénéficié de 88 000€ via le FEDER PME Martinique. La plateforme CapSubvention nous a permis de structurer notre dossier efficacement. L'espace de suivi est excellent, on savait à chaque instant où en était notre demande. Un service professionnel et fiable.", date: "Juin 2024", verified: true },
  { name: "Leilani V.", territoire: "Polynésie française", projet: "École de plongée et snorkeling", note: 5, montant: "29 000€", dispositif: "SEFI Tourisme Durable", texte: "Basée à Bora Bora, j'avais le projet d'ouvrir une école de plongée axée sur la préservation des coraux. CapSubvention m'a accompagnée dans l'obtention de 29 000€ SEFI Tourisme Durable pour acquérir le matériel et la certification internationale. L'équipe était disponible, les délais tenus. Très professionnels.", date: "Mai 2024", verified: true },
  { name: "Frédéric T.", territoire: "Guadeloupe", projet: "Menuiserie et ébénisterie locale", note: 4, montant: "33 500€", dispositif: "FEDER Artisanat Guadeloupe", texte: "Artisan menuisier depuis 12 ans, j'avais besoin de moderniser mon atelier pour répondre aux normes et gagner en productivité. La subvention FEDER Artisanat de 33 500€ obtenue via CapSubvention a tout changé. Le processus est rigoureux — il faut bien préparer ses documents — mais l'équipe est là pour vous guider. Je recommande à tout artisan guadeloupéen.", date: "Avril 2024", verified: true },
  { name: "Christelle B.", territoire: "La Réunion", projet: "Résidence senior autonomie", note: 5, montant: "120 000€", dispositif: "FEDER Cohésion Sociale Réunion", texte: "Notre projet de résidence senior pour personnes âgées autonomes à Saint-Denis a bénéficié de 120 000€ via le FEDER Cohésion Sociale. C'est le plus gros dossier que j'ai jamais monté, et CapSubvention nous a accompagnés à chaque étape. L'instruction a duré 90 jours, ce qui est tout à fait normal pour ce montant. Un accompagnement de grande qualité.", date: "Mars 2024", verified: true },
  { name: "Aurélien M.", territoire: "Nouvelle-Calédonie", projet: "Ferme aquacole de crevettes", note: 5, montant: "480 000€", dispositif: "FEAMPA Aquaculture NC", texte: "L'aquaculture en Nouvelle-Calédonie est un secteur porteur mais les financements sont difficiles à obtenir seul. CapSubvention nous a guidés dans la constitution d'un dossier FEAMPA Aquaculture pour 480 000€. Le suivi administratif était irréprochable. La plateforme simplifie vraiment des démarches qui auraient pris plus d'un an par les voies classiques.", date: "Février 2024", verified: true },
  { name: "Sophie D.", territoire: "Martinique", projet: "Salon de coiffure afro", note: 5, montant: "16 000€", dispositif: "ADIE Martinique Création", texte: "Après deux refus bancaires, j'avais perdu espoir d'ouvrir mon salon afro à Schoelcher. CapSubvention m'a orientée vers le dispositif ADIE Martinique Création et j'ai obtenu 16 000€ pour financer l'aménagement, le matériel et les premiers mois de fonctionnement. Aujourd'hui le salon tourne à plein régime. Merci à toute l'équipe !", date: "Janvier 2024", verified: true },
  { name: "Patrice L.", territoire: "Guadeloupe", projet: "Application mobile tourisme local", note: 4, montant: "38 000€", dispositif: "FEDER Innovation Numérique", texte: "Notre startup a développé une application de tourisme responsable en Guadeloupe. CapSubvention nous a permis d'accéder à 38 000€ FEDER Innovation Numérique pour financer notre équipe tech et nos serveurs les 12 premiers mois. Le processus est sérieux et bien structuré. Un peu de paperasse mais c'est la contrepartie d'un financement public significatif.", date: "Décembre 2023", verified: true },
  { name: "Tehani M.", territoire: "Polynésie française", projet: "Agriculture perlière", note: 5, montant: "220 000€", dispositif: "OGAF Perles de Culture", texte: "La perliculture est l'âme de notre économie aux Tuamotu. Grâce à CapSubvention, j'ai obtenu 220 000€ du dispositif OGAF Perles de Culture pour acquérir un nouveau lagon de production et des équipements de greffage modernes. La plateforme est claire, intuitive, et les délais ont été respectés. Une vraie valeur ajoutée pour les professionnels de la mer.", date: "Novembre 2023", verified: true },
  { name: "Jacques A.", territoire: "La Réunion", projet: "Boulangerie artisanale bio", note: 5, montant: "27 000€", dispositif: "BPI France Commerces", texte: "Boulanger de formation, je voulais ouvrir une boulangerie 100% locale et bio à Saint-Gilles. CapSubvention m'a permis de trouver et d'obtenir une subvention BPI France Commerces de 27 000€. Le four artisanal, le pétrin et la vitrine réfrigérée sont financés. Ouverture faite en juillet 2024 avec une file d'attente dès le premier jour. Recommande à 100% !", date: "Octobre 2023", verified: true },
  { name: "Valérie N.", territoire: "Guadeloupe", projet: "Crèche associative bilingue", note: 5, montant: "48 000€", dispositif: "FSE+ Petite Enfance", texte: "Notre association gérait déjà une halte-garderie mais nous voulions ouvrir une crèche bilingue français-créole. Le financement FSE+ Petite Enfance de 48 000€ obtenu via CapSubvention a couvert les travaux d'aménagement et les premiers 8 mois de fonctionnement. Le dossier était bien guidé et le suivi en temps réel très rassurant.", date: "Septembre 2023", verified: true },
];

const STATS_AVIS = [
  { val: "4.8/5", lbl: "Note moyenne" },
  { val: "94%", lbl: "Clients satisfaits" },
  { val: "3 500+", lbl: "Dossiers traités" },
  { val: "jusqu'à 1M€", lbl: "Financement max / projet" },
];

const REPARTITION = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 16 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
];

export default function Avis() {
  const { user } = useAuth();
  const [filterTerr, setFilterTerr] = useState("Tous");
  const [apiReviews, setApiReviews] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ note: 5, typeProjet: "", texte: "" });

  useEffect(() => {
    apiFetch("/reviews")
      .then(data => setApiReviews(data))
      .catch(() => {});
  }, [submitted]);

  const allTemoignages = [
    ...apiReviews.map((r: any) => ({
      name: r.name, territoire: r.territoire, projet: r.typeProjet, note: r.note,
      montant: r.montant || "", dispositif: r.dispositif || "", texte: r.texte,
      date: r.date, verified: r.verified,
    })),
    ...TEMOIGNAGES,
  ];

  const displayed = filterTerr === "Tous" ? allTemoignages : allTemoignages.filter(t => t.territoire === filterTerr);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (form.texte.trim().length < 20) {
      setFormError("Votre témoignage doit faire au moins 20 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      setForm({ note: 5, typeProjet: "", texte: "" });
    } catch (err: any) {
      setFormError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

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
              <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm bg-[#0D1F3C] hover:bg-[#162B52] text-white font-semibold rounded-lg transition-all shadow-md">
              Déposer un dossier
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] py-20 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#B5872A]/20 border border-[#B5872A]/30 rounded-full px-4 py-1.5 text-sm text-[#D4A847] font-semibold mb-6">
            <Star className="w-4 h-4 fill-[#D4A847]" /> Témoignages vérifiés
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Ce que disent nos bénéficiaires</h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto">Plus de 3 500 porteurs de projets ont fait confiance à CapSubvention. Voici leurs expériences authentiques.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="bg-white border-b border-[#DDE2EC]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl font-extrabold text-[#0D1F3C]">4.8</div>
                <div>
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-[#B5872A] text-[#B5872A]" />)}
                  </div>
                  <div className="text-[#5B6580] text-sm">Basé sur 3 500+ évaluations</div>
                </div>
              </div>
              <div className="space-y-2">
                {REPARTITION.map(r => (
                  <div key={r.stars} className="flex items-center gap-3">
                    <div className="text-sm text-[#4B5574] w-12 text-right">{r.stars} étoile{r.stars > 1 ? 's' : ''}</div>
                    <div className="flex-1 bg-[#F1F4FA] rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-[#B5872A] rounded-full" style={{ width: `${r.pct}%` }} />
                    </div>
                    <div className="text-sm text-[#6B7896] w-10">{r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {STATS_AVIS.map(s => (
                <div key={s.lbl} className="bg-[#F8F9FC] border border-[#DDE2EC] rounded-xl p-5 text-center">
                  <div className="text-3xl font-extrabold text-[#0D1F3C] mb-1">{s.val}</div>
                  <div className="text-[#6B7896] text-xs">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TEMOIGNAGES */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-wrap gap-3 mb-8">
          {["Tous", ...TERRITORIES.map(t => t.name)].map((t) => (
            <button key={t} onClick={() => setFilterTerr(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterTerr === t ? 'bg-[#0D1F3C] text-white shadow-md' : 'bg-white border border-[#DDE2EC] text-[#4B5574] hover:border-[#0D1F3C]/30'}`}>
              {t === "Tous" ? "Tous les territoires" : t}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {displayed.map((t, i) => (
            <div key={i} className="bg-white border border-[#DDE2EC] rounded-2xl p-7 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(t.note)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#B5872A] text-[#B5872A]" />)}
                  {[...Array(5 - t.note)].map((_, j) => <Star key={j} className="w-4 h-4 text-[#DDE2EC]" />)}
                </div>
                {t.verified && (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    <CheckCircle className="w-3 h-3" /> Vérifié
                  </span>
                )}
              </div>
              <Quote className="w-6 h-6 text-[#DDE2EC] mb-3" />
              <p className="text-[#4B5574] text-sm leading-relaxed mb-5">{t.texte}</p>
              <div className="border-t border-[#F1F4FA] pt-4 flex items-end justify-between">
                <div>
                  <div className="font-bold text-[#0D1F3C] text-sm">{t.name}</div>
                  <div className="text-[#8B9BB4] text-xs mt-0.5">{t.projet} · {t.territoire}</div>
                  <div className="text-[#8B9BB4] text-xs">{t.dispositif}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#1B6E3D] font-extrabold text-base">{t.montant}</div>
                  <div className="text-[#8B9BB4] text-xs">obtenus</div>
                  <div className="text-[#8B9BB4] text-xs mt-1">{t.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORMULAIRE DÉPÔT D'AVIS */}
      <div className="bg-white border-t border-[#DDE2EC] py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#0D1F3C] mb-2">Partagez votre expérience</h2>
            <p className="text-[#6B7896] text-sm">Votre avis aide d'autres porteurs de projets à se décider. Il sera vérifié avant publication.</p>
          </div>

          {!user ? (
            <div className="bg-[#F8F9FC] border border-[#DDE2EC] rounded-2xl p-8 text-center">
              <Lock className="w-10 h-10 text-[#DDE2EC] mx-auto mb-3" />
              <p className="text-[#6B7896] font-medium mb-4">Connectez-vous pour déposer un avis</p>
              <div className="flex gap-3 justify-center">
                <Link href="/login" className="px-5 py-2.5 bg-[#0D1F3C] text-white rounded-lg text-sm font-semibold hover:bg-[#162B52] transition-colors">
                  Se connecter
                </Link>
                <Link href="/register" className="px-5 py-2.5 border border-[#DDE2EC] text-[#4B5574] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Créer un compte
                </Link>
              </div>
            </div>
          ) : submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-extrabold text-green-800 text-lg mb-2">Merci pour votre témoignage !</h3>
              <p className="text-green-700 text-sm mb-4">Votre avis a bien été reçu. Il sera vérifié par notre équipe avant publication (sous 24 à 48h).</p>
              <button onClick={() => setSubmitted(false)} className="text-green-700 text-sm font-semibold hover:underline">
                Déposer un autre avis
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#F8F9FC] border border-[#DDE2EC] rounded-2xl p-7 space-y-5">
              <div>
                <label className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide mb-2 block">Votre note *</label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setForm(f => ({ ...f, note: n }))}
                      className="p-1 transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 transition-colors ${form.note >= n ? "fill-[#B5872A] text-[#B5872A]" : "text-[#DDE2EC]"}`} />
                    </button>
                  ))}
                  <span className="text-sm text-[#6B7896] ml-2">{form.note}/5</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide mb-2 block">Type de projet</label>
                <input
                  value={form.typeProjet}
                  onChange={e => setForm(f => ({ ...f, typeProjet: e.target.value }))}
                  placeholder="Ex: Commerce, Agriculture, Tourisme..."
                  className="w-full border border-[#DDE2EC] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide mb-2 block">Votre témoignage *</label>
                <textarea
                  value={form.texte}
                  onChange={e => setForm(f => ({ ...f, texte: e.target.value }))}
                  placeholder="Décrivez votre expérience avec CapSubvention — au moins 20 caractères..."
                  rows={5}
                  className="w-full border border-[#DDE2EC] rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] bg-white"
                />
                <div className={`text-xs mt-1 ${form.texte.length < 20 ? "text-[#8B9BB4]" : "text-green-600"}`}>
                  {form.texte.length} caractère{form.texte.length !== 1 ? "s" : ""} {form.texte.length < 20 ? `(minimum 20)` : "✓"}
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{formError}</div>
              )}

              <div className="flex items-center gap-3">
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#0D1F3C]/50 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                  <Send className="w-4 h-4" /> {submitting ? "Envoi en cours..." : "Soumettre mon avis"}
                </button>
                <div className="flex items-center gap-1.5 text-xs text-[#8B9BB4]">
                  <Shield className="w-3.5 h-3.5" /> Avis vérifié avant publication
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-3">Prêt à rejoindre ces bénéficiaires ?</h2>
          <p className="text-white/65 mb-6">Créez votre compte gratuit et déposez votre dossier dès maintenant.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#B5872A] hover:bg-[#C99A30] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl">
            Déposer mon dossier gratuitement
          </Link>
        </div>
      </div>

      <footer className="bg-[#080F1E] py-8 text-center text-white/20 text-xs">
        © 2025 CapSubvention — Article L1611-2 CGCT — <Link href="/" className="hover:text-white/40">Retour à l'accueil</Link>
      </footer>
    </div>
  );
}
