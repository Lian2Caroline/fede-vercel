export const TERRITORIES = [
  { id: "nouvelle-caledonie", name: "Nouvelle-Calédonie", flag: "🇳🇨", code: "NC" },
  { id: "martinique", name: "Martinique", flag: "🇲🇶", code: "MQ" },
  { id: "polynesie-francaise", name: "Polynésie française", flag: "🇵🇫", code: "PF" },
  { id: "guadeloupe", name: "Guadeloupe", flag: "🇬🇵", code: "GP" },
  { id: "reunion", name: "La Réunion", flag: "🇷🇪", code: "RE" },
];

export const STATUS_COLORS: Record<string, string> = {
  "Brouillon": "bg-gray-100 text-gray-600 border-gray-200",
  "Soumis": "bg-blue-50 text-blue-700 border-blue-200",
  "En instruction": "bg-amber-50 text-amber-700 border-amber-200",
  "Frais émis": "bg-orange-50 text-orange-700 border-orange-200",
  "En attente de paiement": "bg-orange-50 text-orange-700 border-orange-200",
  "Paiement reçu": "bg-teal-50 text-teal-700 border-teal-200",
  "Validé": "bg-green-50 text-green-700 border-green-200",
  "Refusé": "bg-red-50 text-red-700 border-red-200",
};
