export const TERRITORIES = [
  { id: "nouvelle-caledonie", name: "Nouvelle-Calédonie", flag: "NC", code: "NC", fonds: ["FIDES", "ACE Entrepreneuriat", "Subvention Agricole", "DEFI Jeunes", "Formation Pro"] },
  { id: "martinique", name: "Martinique", flag: "MQ", code: "MQ", fonds: ["FEDER 2021–2027", "FSE+ Emploi & Formation", "LEADER Agriculture & Rural", "BPI France Outre-Mer", "Subvention CTM"] },
  { id: "polynesie-francaise", name: "Polynésie française", flag: "PF", code: "PF", fonds: ["SEFI", "FDA Archipels", "Tourisme Durable", "ALS Logement", "FSP Solidarité"] },
  { id: "guadeloupe", name: "Guadeloupe", flag: "GP", code: "GP", fonds: ["FEDER Guadeloupe", "FSE+", "Plan de Relance", "Subvention Région", "ADIE Microfinancement"] },
  { id: "reunion", name: "La Réunion", flag: "RE", code: "RE", fonds: ["FEDER Réunion", "Aide Région Réunion", "FSE+", "NACRE", "DEETS Cohésion"] },
];

export const SECTEURS = ["Création d'entreprise", "Innovation & Numérique", "Agriculture & Pêche", "Environnement & Énergie", "Tourisme", "Logement social", "Formation & Emploi", "Culture & Sport", "Santé & Social", "Autre"];

export const TYPES_PORTEURS = ["Entrepreneur individuel", "Association", "Collectivité", "Entreprise", "Groupement"];

export const STATUS_COLORS: Record<string, string> = {
  "Brouillon": "bg-gray-100 text-gray-600 border-gray-200",
  "Soumis": "bg-blue-50 text-blue-700 border-blue-200",
  "En instruction": "bg-amber-50 text-amber-700 border-amber-200",
  "Frais émis": "bg-orange-50 text-orange-700 border-orange-200",
  "En attente de paiement": "bg-orange-50 text-orange-700 border-orange-200",
  "Paiement reçu": "bg-teal-50 text-teal-700 border-teal-200",
  "Validé": "bg-green-50 text-green-700 border-green-200",
  "Refusé": "bg-red-50 text-red-700 border-red-200",
  "brouillon": "bg-gray-100 text-gray-600 border-gray-200",
  "soumis": "bg-blue-50 text-blue-700 border-blue-200",
  "en_instruction": "bg-amber-50 text-amber-700 border-amber-200",
  "expertise": "bg-violet-50 text-violet-700 border-violet-200",
  "contrat_envoye": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "en_attente": "bg-amber-50 text-amber-700 border-amber-200",
  "valide": "bg-green-50 text-green-700 border-green-200",
  "verse": "bg-teal-50 text-teal-700 border-teal-200",
  "rejete": "bg-red-50 text-red-700 border-red-200",
  "manquant": "bg-red-50 text-red-700 border-red-200",
  "paye": "bg-green-50 text-green-700 border-green-200",
  "annule": "bg-gray-50 text-gray-700 border-gray-200",
};
