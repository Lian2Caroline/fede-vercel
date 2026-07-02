import { useState } from "react";

const TERRITORIES = [
  {
    id: "nouvelle-caledonie",
    name: "Nouvelle-Calédonie",
    flag: "🇳🇨",
    color: "from-teal-600 to-cyan-700",
    accent: "teal",
    description: "Territoire du Pacifique Sud avec des dispositifs spécifiques d'aide économique locale.",
    aides: [
      { nom: "FIDES (Fonds d'Investissement et de Développement Économique et Social)", montant: "Jusqu'à 5 000 000 XPF", domaine: "Développement économique" },
      { nom: "Aide à la Création d'Entreprise (ACE)", montant: "Jusqu'à 500 000 XPF", domaine: "Entrepreneuriat" },
      { nom: "Subvention Développement Agricole", montant: "Jusqu'à 2 000 000 XPF", domaine: "Agriculture" },
      { nom: "DEFI Jeunes Calédonie", montant: "Jusqu'à 150 000 XPF", domaine: "Jeunesse / Projets" },
      { nom: "Aide à la Formation Professionnelle", montant: "Prise en charge totale", domaine: "Formation" },
    ],
    contact: "DRDFE Nouvelle-Calédonie",
    population: "270 000 hab.",
    superficie: "18 575 km²",
  },
  {
    id: "martinique",
    name: "Martinique",
    flag: "🇲🇶",
    color: "from-blue-700 to-indigo-800",
    accent: "blue",
    description: "Région et département d'outre-mer avec accès aux fonds européens et nationaux.",
    aides: [
      { nom: "FEDER (Fonds Européen de Développement Régional)", montant: "Jusqu'à 2 000 000 €", domaine: "Innovation / Numérique" },
      { nom: "Aide Régionale à l'Investissement (ARI)", montant: "Jusqu'à 500 000 €", domaine: "Investissement entreprise" },
      { nom: "LEADER (Agriculture et Développement Rural)", montant: "Jusqu'à 300 000 €", domaine: "Agriculture / Rural" },
      { nom: "BPI France Outre-Mer", montant: "Variable selon projet", domaine: "Innovation / Startup" },
      { nom: "Subvention CTM Jeunesse", montant: "Jusqu'à 15 000 €", domaine: "Projets jeunes" },
    ],
    contact: "Collectivité Territoriale de Martinique",
    population: "360 000 hab.",
    superficie: "1 128 km²",
  },
  {
    id: "polynesie-francaise",
    name: "Polynésie française",
    flag: "🇵🇫",
    color: "from-sky-500 to-blue-600",
    accent: "sky",
    description: "Collectivité d'outre-mer avec une large autonomie et ses propres dispositifs d'aides.",
    aides: [
      { nom: "Aide à la Création d'Activités (SEFI)", montant: "Jusqu'à 1 000 000 XPF", domaine: "Création d'entreprise" },
      { nom: "Fonds de Développement des Archipels (FDA)", montant: "Jusqu'à 5 000 000 XPF", domaine: "Développement archipels" },
      { nom: "Subvention Tourisme Durable", montant: "Jusqu'à 3 000 000 XPF", domaine: "Tourisme" },
      { nom: "Aide au Logement Social (ALS)", montant: "Variable", domaine: "Logement" },
      { nom: "Fonds de Solidarité Prioritaire (FSP)", montant: "Selon projet", domaine: "Solidarité / Social" },
    ],
    contact: "Direction des Ressources Humaines — Pays",
    population: "280 000 hab.",
    superficie: "3 521 km²",
  },
  {
    id: "guadeloupe",
    name: "Guadeloupe",
    flag: "🇬🇵",
    color: "from-emerald-600 to-green-700",
    accent: "emerald",
    description: "Région ultrapériphérique européenne bénéficiant des fonds structurels de l'UE.",
    aides: [
      { nom: "FEDER Guadeloupe 2021–2027", montant: "Jusqu'à 3 000 000 €", domaine: "Économie / Numérique" },
      { nom: "FSE+ (Formation & Emploi)", montant: "Jusqu'à 500 000 €", domaine: "Emploi / Formation" },
      { nom: "Plan de Relance Outre-Mer", montant: "Variable", domaine: "Relance économique" },
      { nom: "Subvention Conseil Régional Guadeloupe", montant: "Jusqu'à 200 000 €", domaine: "Projets locaux" },
      { nom: "ADIE Microfinancement (don)", montant: "Jusqu'à 10 000 €", domaine: "Micro-entreprise" },
    ],
    contact: "Région Guadeloupe — Direction Économique",
    population: "390 000 hab.",
    superficie: "1 628 km²",
  },
  {
    id: "reunion",
    name: "La Réunion",
    flag: "🇷🇪",
    color: "from-orange-500 to-red-600",
    accent: "orange",
    description: "Île de l'océan Indien, région la plus peuplée d'outre-mer, dotée de nombreux fonds.",
    aides: [
      { nom: "FEDER Réunion 2021–2027", montant: "Jusqu'à 4 000 000 €", domaine: "Innovation / Transition écologique" },
      { nom: "Aides aux Entreprises — Région Réunion", montant: "Jusqu'à 300 000 €", domaine: "Développement PME" },
      { nom: "Fond Social Européen (FSE+)", montant: "Jusqu'à 1 000 000 €", domaine: "Emploi / Inclusion" },
      { nom: "Dispositif NACRE Réunion", montant: "Jusqu'à 25 000 €", domaine: "Création / Reprise d'entreprise" },
      { nom: "Subvention Cohésion Sociale DEETS", montant: "Variable", domaine: "Social / Associations" },
    ],
    contact: "Région Réunion — DEETS",
    population: "880 000 hab.",
    superficie: "2 512 km²",
  },
];

const STATS = [
  { label: "Territoires couverts", value: "5", icon: "🗺️" },
  { label: "Programmes d'aides", value: "25+", icon: "📋" },
  { label: "Fonds disponibles", value: "€450M+", icon: "💰" },
  { label: "Projets financés / an", value: "3 500+", icon: "🚀" },
];

const CATEGORIES = [
  { icon: "🏗️", label: "Développement économique" },
  { icon: "🌱", label: "Agriculture & Rural" },
  { icon: "💻", label: "Numérique & Innovation" },
  { icon: "🏠", label: "Logement social" },
  { icon: "🎓", label: "Formation & Emploi" },
  { icon: "🌊", label: "Environnement & Tourisme" },
];

const STEPS = [
  { num: "01", title: "Identifiez votre territoire", desc: "Sélectionnez votre collectivité pour voir les dispositifs adaptés à votre zone géographique." },
  { num: "02", title: "Choisissez votre projet", desc: "Parcourez les aides selon votre domaine : économique, social, culturel ou environnemental." },
  { num: "03", title: "Constituez votre dossier", desc: "Nous vous guidons pas à pas dans la préparation et soumission de votre candidature." },
  { num: "04", title: "Obtenez votre financement", desc: "Suivez l'avancement de votre dossier jusqu'à l'obtention et le versement de la subvention." },
];

function TerritoryCard({ territory, isSelected, onClick }: { territory: typeof TERRITORIES[0]; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] ${
        isSelected ? "border-white shadow-2xl scale-[1.02]" : "border-white/20 hover:border-white/50"
      }`}
    >
      <div className={`bg-gradient-to-br ${territory.color} p-5`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{territory.flag}</span>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">{territory.name}</h3>
            <p className="text-white/70 text-xs">{territory.population}</p>
          </div>
        </div>
        <p className="text-white/80 text-xs leading-relaxed">{territory.description}</p>
      </div>
    </button>
  );
}

function AideCard({ aide }: { aide: typeof TERRITORIES[0]["aides"][0] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors duration-200">
      <div className="flex justify-between items-start gap-3 mb-2">
        <h4 className="text-white font-semibold text-sm leading-snug flex-1">{aide.nom}</h4>
        <span className="text-xs bg-white/15 text-white/90 px-2 py-1 rounded-full whitespace-nowrap font-medium">{aide.domaine}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-400 font-bold text-sm">{aide.montant}</span>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"aides" | "contact">("aides");

  const territory = TERRITORIES.find((t) => t.id === selectedTerritory);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">F</div>
            <span className="font-bold text-lg tracking-tight">FinanceDOM</span>
            <span className="text-xs text-white/40 border border-white/20 rounded-full px-2 py-0.5 hidden sm:block">Subventions non remboursables</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#territoires" className="text-white/60 hover:text-white text-sm transition-colors hidden md:block">Territoires</a>
            <a href="#comment" className="text-white/60 hover:text-white text-sm transition-colors hidden md:block">Comment ça marche</a>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Déposer un dossier
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-300 text-sm mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Financements 2024–2027 ouverts aux candidatures
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-300 bg-clip-text text-transparent">
            Financements non<br />remboursables pour<br />les territoires ultramarins
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Découvrez toutes les subventions disponibles en Nouvelle-Calédonie, Martinique, Polynésie française, Guadeloupe et La Réunion.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-900/50">
              Explorer les aides
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all">
              En savoir plus
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors cursor-pointer">
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TERRITORIES */}
      <section id="territoires" className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Choisissez votre territoire</h2>
          <p className="text-white/50">Cliquez sur votre collectivité pour voir les dispositifs d'aide disponibles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {TERRITORIES.map((t) => (
            <TerritoryCard
              key={t.id}
              territory={t}
              isSelected={selectedTerritory === t.id}
              onClick={() => {
                setSelectedTerritory(selectedTerritory === t.id ? null : t.id);
                setActiveTab("aides");
              }}
            />
          ))}
        </div>

        {/* DETAIL PANEL */}
        {territory && (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-3xl overflow-hidden animate-in fade-in duration-300">
            <div className={`bg-gradient-to-r ${territory.color} p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{territory.flag}</span>
                  <div>
                    <h3 className="text-white font-extrabold text-2xl">{territory.name}</h3>
                    <div className="flex gap-4 mt-1 text-white/70 text-sm">
                      <span>{territory.population}</span>
                      <span>•</span>
                      <span>{territory.superficie}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedTerritory(null)} className="text-white/60 hover:text-white text-2xl">✕</button>
              </div>
            </div>

            <div className="border-b border-white/10 flex">
              <button
                onClick={() => setActiveTab("aides")}
                className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "aides" ? "text-white border-b-2 border-indigo-400" : "text-white/50 hover:text-white"}`}
              >
                Aides disponibles ({territory.aides.length})
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "contact" ? "text-white border-b-2 border-indigo-400" : "text-white/50 hover:text-white"}`}
              >
                Contact & Organisme
              </button>
            </div>

            <div className="p-6">
              {activeTab === "aides" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {territory.aides.map((aide) => (
                    <AideCard key={aide.nom} aide={aide} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-bold text-base mb-2">Organisme référent</h4>
                    <p className="text-white/70">{territory.contact}</p>
                  </div>
                  <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-5">
                    <h4 className="text-indigo-300 font-bold text-base mb-2">Déposer votre candidature</h4>
                    <p className="text-white/60 text-sm mb-4">Notre équipe vous accompagne dans la constitution de votre dossier jusqu'à l'obtention du financement.</p>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
                      Prendre contact
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section id="comment" className="bg-white/2 border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Comment obtenir votre financement</h2>
            <p className="text-white/50 max-w-xl mx-auto">Un accompagnement sur mesure de A à Z pour maximiser vos chances d'obtenir une subvention non remboursable.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-indigo-500/50 to-transparent z-0" />
                )}
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                  <div className="text-4xl font-extrabold text-indigo-500/30 mb-3">{step.num}</div>
                  <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative bg-gradient-to-r from-indigo-700 to-purple-700 rounded-3xl p-10 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-white mb-3">Prêt à financer votre projet ?</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">Rejoignez des milliers de porteurs de projets qui ont obtenu des financements non remboursables dans les territoires ultramarins.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors shadow-lg">
                Déposer mon dossier
              </button>
              <button className="bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/30 hover:bg-white/20 transition-colors">
                Simuler mon éligibilité
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">F</div>
              <span className="font-bold text-white">FinanceDOM</span>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {["Nouvelle-Calédonie", "Martinique", "Polynésie française", "Guadeloupe", "La Réunion"].map((t) => (
                <span key={t} className="text-xs text-white/40 border border-white/10 rounded-full px-3 py-1">{t}</span>
              ))}
            </div>
            <p className="text-white/30 text-xs">© 2024 FinanceDOM — Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
