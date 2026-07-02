import { useState } from "react";

const TERRITORIES = [
  { name: "Nouvelle-Calédonie", flag: "🇳🇨", fonds: "FIDES, ACE, DEFI Jeunes", montant: "jusqu'à 5 M XPF" },
  { name: "Martinique", flag: "🇲🇶", fonds: "FEDER, FSE+, LEADER, BPI", montant: "jusqu'à 2 M €" },
  { name: "Polynésie française", flag: "🇵🇫", fonds: "SEFI, FDA, FSP", montant: "jusqu'à 5 M XPF" },
  { name: "Guadeloupe", flag: "🇬🇵", fonds: "FEDER, FSE+, Plan Relance", montant: "jusqu'à 3 M €" },
  { name: "La Réunion", flag: "🇷🇪", fonds: "FEDER, NACRE, DEETS", montant: "jusqu'à 4 M €" },
];

const TYPES_PROJETS = [
  { icon: "🏢", label: "Création d'entreprise", desc: "Financement du démarrage, des équipements et du fonds de roulement" },
  { icon: "💡", label: "Innovation & Numérique", desc: "R&D, transformation digitale, développement de solutions technologiques" },
  { icon: "🌱", label: "Agriculture & Environnement", desc: "Exploitation agricole, pêche, développement durable, énergie renouvelable" },
  { icon: "🏠", label: "Logement social", desc: "Construction, réhabilitation, amélioration de l'habitat social" },
  { icon: "🎓", label: "Formation & Emploi", desc: "Insertion professionnelle, apprentissage, formation continue" },
  { icon: "🏛️", label: "Associations & Culture", desc: "Projets associatifs, culturels, sportifs et d'utilité sociale" },
];

const STEPS = [
  { n: "1", title: "Déposez votre dossier", desc: "Créez votre compte, renseignez votre projet et téléchargez les pièces justificatives en ligne." },
  { n: "2", title: "Instruction du dossier", desc: "Nos experts agréés analysent la recevabilité et la conformité de votre dossier de demande." },
  { n: "3", title: "Frais d'instruction", desc: "Des frais d'instruction réglementaires sont émis pour couvrir l'expertise et la certification de votre dossier." },
  { n: "4", title: "Versement de la subvention", desc: "Après validation, la subvention est transmise à l'organisme financeur pour versement sur votre compte." },
];

const PARTENAIRES = ["Union Européenne — FEDER/FSE+", "BPI France", "Agence Française de Développement", "Caisse des Dépôts", "Régions d'Outre-Mer", "État Français — DEETS"];

const FAQ = [
  { q: "Qu'est-ce qu'un financement non remboursable ?", r: "Il s'agit d'une subvention accordée par des organismes publics ou européens qui n'est pas à rembourser. Contrairement à un prêt, la somme perçue est définitivement acquise sous réserve du respect des conditions d'attribution." },
  { q: "Qui peut en bénéficier ?", r: "Toute personne physique ou morale résidant ou ayant son siège dans l'un des 5 territoires couverts : Nouvelle-Calédonie, Martinique, Polynésie française, Guadeloupe et La Réunion. Les porteurs de projet doivent répondre aux critères d'éligibilité propres à chaque dispositif." },
  { q: "Quels sont les délais de traitement ?", r: "Les délais varient selon le type de financement et le territoire. En moyenne, l'instruction d'un dossier dure entre 30 et 90 jours. Notre équipe vous informe en temps réel de l'avancement via votre espace personnel." },
  { q: "Le processus est-il entièrement en ligne ?", r: "Oui, l'intégralité du processus — de la création du compte au suivi du versement — est dématérialisé. Vous n'avez aucun déplacement à effectuer." },
];

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans text-[#1e293b]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-0 flex items-stretch justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#1a2f5e] to-[#2e5db3] flex items-center justify-center font-bold text-white text-xs">FD</div>
            <div>
              <span className="font-extrabold text-[#1a2f5e] text-base tracking-tight">FinanceDOM</span>
              <span className="hidden md:inline text-gray-400 text-xs ml-2">— Subventions non remboursables</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a href="#territoires" className="px-4 py-2 text-sm text-gray-600 hover:text-[#1a2f5e] font-medium hidden md:block">Territoires</a>
            <a href="#projets" className="px-4 py-2 text-sm text-gray-600 hover:text-[#1a2f5e] font-medium hidden md:block">Types de projets</a>
            <a href="#processus" className="px-4 py-2 text-sm text-gray-600 hover:text-[#1a2f5e] font-medium hidden md:block">Notre processus</a>
            <a href="#faq" className="px-4 py-2 text-sm text-gray-600 hover:text-[#1a2f5e] font-medium hidden md:block">FAQ</a>
            <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block" />
            <a href="#" className="px-4 py-2 text-sm text-[#1a2f5e] font-semibold hover:bg-gray-50 rounded-lg transition-colors">Connexion</a>
            <a href="#" className="ml-1 px-4 py-2 text-sm bg-[#1a2f5e] hover:bg-[#0f1f3d] text-white font-semibold rounded-lg transition-colors">Créer un compte</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#1a2f5e] via-[#1e3a7b] to-[#2e5db3] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Dispositifs 2024–2027 ouverts aux candidatures
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                Obtenez votre financement<br />
                <span className="text-[#d4b96a]">non remboursable</span><br />
                en Outre-Mer
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Accédez aux subventions publiques et européennes disponibles en Nouvelle-Calédonie, Martinique, Polynésie française, Guadeloupe et La Réunion. Processus 100% en ligne, accompagné par des experts agréés.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="bg-[#b8963e] hover:bg-[#d4b96a] text-white font-bold px-7 py-3.5 rounded-lg transition-colors shadow-lg">
                  Déposer mon dossier
                </a>
                <a href="#processus" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-lg transition-colors">
                  Voir le processus
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-white/60 text-sm font-semibold uppercase tracking-wide mb-4">Territoires couverts</div>
                <div className="space-y-3">
                  {TERRITORIES.map((t) => (
                    <div key={t.name} className="flex items-center justify-between bg-white/8 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{t.flag}</span>
                        <div>
                          <div className="text-white text-sm font-semibold">{t.name}</div>
                          <div className="text-white/50 text-xs">{t.fonds}</div>
                        </div>
                      </div>
                      <div className="text-[#d4b96a] text-xs font-bold text-right">{t.montant}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-white/10">
            {[
              { val: "5", lbl: "Territoires couverts" },
              { val: "25+", lbl: "Dispositifs d'aides" },
              { val: "450M€+", lbl: "Fonds disponibles" },
              { val: "3 500+", lbl: "Projets financés / an" },
            ].map((s) => (
              <div key={s.lbl} className="text-center">
                <div className="text-3xl font-extrabold text-[#d4b96a]">{s.val}</div>
                <div className="text-white/50 text-sm mt-1">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALERT BAND */}
      <div className="bg-[#f8f4e8] border-y border-[#e8d9a0]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 text-sm">
          <span className="text-[#b8963e] font-bold text-base">ℹ</span>
          <span className="text-[#6b4c1e] font-medium">Information importante :</span>
          <span className="text-[#7a5a2a]">Des frais d'instruction réglementaires sont applicables lors du traitement de votre dossier. Ces frais couvrent l'expertise agréée et la certification de votre demande.</span>
        </div>
      </div>

      {/* TYPES DE PROJETS */}
      <section id="projets" className="bg-[#f4f6fb] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[#b8963e] text-sm font-bold uppercase tracking-widest mb-2">Secteurs éligibles</div>
            <h2 className="text-3xl font-extrabold text-[#1a2f5e] mb-3">Quels projets peuvent être financés ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Les subventions non remboursables couvrent un large spectre de projets à caractère économique, social ou environnemental.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TYPES_PROJETS.map((tp) => (
              <div key={tp.label} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#1a2f5e]/30 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{tp.icon}</div>
                <h3 className="font-bold text-[#1a2f5e] text-base mb-2">{tp.label}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{tp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESSUS */}
      <section id="processus" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[#b8963e] text-sm font-bold uppercase tracking-widest mb-2">Processus 100% en ligne</div>
            <h2 className="text-3xl font-extrabold text-[#1a2f5e] mb-3">Comment obtenir votre financement ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Un accompagnement structuré et transparent, de la soumission à l'obtention de votre subvention.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] right-0 h-px bg-gray-200 z-0" />
                )}
                <div className="relative text-center">
                  <div className="w-14 h-14 rounded-full bg-[#1a2f5e] text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4 relative z-10">
                    {step.n}
                  </div>
                  <h3 className="font-bold text-[#1a2f5e] text-base mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  {step.n === "3" && (
                    <span className="inline-block mt-2 bg-[#f8f4e8] text-[#b8963e] text-xs font-semibold border border-[#e8d9a0] rounded-full px-3 py-1">Frais d'instruction</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="bg-[#f4f6fb] py-12 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-gray-400 text-xs uppercase tracking-widest font-semibold mb-6">Organismes financeurs partenaires</div>
          <div className="flex flex-wrap justify-center gap-4">
            {PARTENAIRES.map((p) => (
              <div key={p} className="bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm text-[#1a2f5e] font-medium">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[#b8963e] text-sm font-bold uppercase tracking-widest mb-2">Questions fréquentes</div>
            <h2 className="text-3xl font-extrabold text-[#1a2f5e]">FAQ</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#1a2f5e] text-sm pr-4">{item.q}</span>
                  <span className="text-[#b8963e] text-lg font-bold shrink-0">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {item.r}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a2f5e] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Prêt à financer votre projet ?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto text-lg">Créez votre compte en moins de 5 minutes et déposez votre dossier de demande de financement non remboursable.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="bg-[#b8963e] hover:bg-[#d4b96a] text-white font-bold px-8 py-3.5 rounded-lg transition-colors shadow-lg">
              Créer mon compte gratuitement
            </a>
            <a href="#" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-lg transition-colors">
              Simuler mon éligibilité
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f1f3d] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-[#1a2f5e] to-[#2e5db3] flex items-center justify-center font-bold text-white text-xs">FD</div>
                <span className="font-bold text-white text-sm">FinanceDOM</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">Plateforme d'accès aux financements non remboursables pour les territoires d'outre-mer français.</p>
            </div>
            <div>
              <div className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-3">Territoires</div>
              {["Nouvelle-Calédonie", "Martinique", "Polynésie française", "Guadeloupe", "La Réunion"].map((t) => (
                <div key={t} className="text-white/40 text-xs py-1 hover:text-white/70 cursor-pointer transition-colors">{t}</div>
              ))}
            </div>
            <div>
              <div className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-3">Liens utiles</div>
              {["Comment ça marche", "Types de projets", "FAQ", "Connexion", "Créer un compte"].map((l) => (
                <div key={l} className="text-white/40 text-xs py-1 hover:text-white/70 cursor-pointer transition-colors">{l}</div>
              ))}
            </div>
            <div>
              <div className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-3">Contact</div>
              <div className="text-white/40 text-xs space-y-1">
                <div>support@financedom.fr</div>
                <div>+33 (0) 800 000 XXX</div>
                <div className="pt-1 text-white/25">Lun – Ven : 8h00 – 18h00</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/25">
            <span>© 2024 FinanceDOM — Tous droits réservés</span>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white/50">Mentions légales</span>
              <span className="cursor-pointer hover:text-white/50">Politique de confidentialité</span>
              <span className="cursor-pointer hover:text-white/50">CGU</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
