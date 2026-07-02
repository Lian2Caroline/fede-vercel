import { useState } from "react";
import { Link } from "wouter";
import { useNoCopy } from "@/hooks/use-no-copy";
import { ChevronDown, ChevronUp, ArrowLeft, Search, Shield, Euro, Clock, FileText, Globe, ArrowRight, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/useSEO";
import { CSLogo } from "@/components/CSLogo";

const CAT_LABEL_KEYS: Record<string, string> = {
  general: "faq_page.cat_general",
  eligibilite: "faq_page.cat_eligibility",
  frais: "faq_page.cat_fees",
  delais: "faq_page.cat_delays",
  documents: "faq_page.cat_docs",
  securite: "faq_page.cat_security",
};

const FAQ_CATEGORIES = [
  {
    id: "general",
    icon: Globe,
    questions: [
      { qKey: "faq_full.general_1_q", rKey: "faq_full.general_1_r" },
      { qKey: "faq_full.general_2_q", rKey: "faq_full.general_2_r" },
      { qKey: "faq_full.general_3_q", rKey: "faq_full.general_3_r" },
      { qKey: "faq_full.general_4_q", rKey: "faq_full.general_4_r" },
      { qKey: "faq_full.general_5_q", rKey: "faq_full.general_5_r" },
    ],
  },
  {
    id: "eligibilite",
    icon: Shield,
    questions: [
      { qKey: "faq_full.eligibilite_1_q", rKey: "faq_full.eligibilite_1_r" },
      { qKey: "faq_full.eligibilite_2_q", rKey: "faq_full.eligibilite_2_r" },
      { qKey: "faq_full.eligibilite_3_q", rKey: "faq_full.eligibilite_3_r" },
      { qKey: "faq_full.eligibilite_4_q", rKey: "faq_full.eligibilite_4_r" },
      { qKey: "faq_full.eligibilite_5_q", rKey: "faq_full.eligibilite_5_r" },
    ],
  },
  {
    id: "frais",
    icon: Euro,
    questions: [
      { qKey: "faq_full.frais_1_q", rKey: "faq_full.frais_1_r" },
      { qKey: "faq_full.frais_2_q", rKey: "faq_full.frais_2_r" },
      { qKey: "faq_full.frais_3_q", rKey: "faq_full.frais_3_r" },
      { qKey: "faq_full.frais_4_q", rKey: "faq_full.frais_4_r" },
      { qKey: "faq_full.frais_5_q", rKey: "faq_full.frais_5_r" },
    ],
  },
  {
    id: "delais",
    icon: Clock,
    questions: [
      { qKey: "faq_full.delais_1_q", rKey: "faq_full.delais_1_r" },
      { qKey: "faq_full.delais_2_q", rKey: "faq_full.delais_2_r" },
      { qKey: "faq_full.delais_3_q", rKey: "faq_full.delais_3_r" },
      { qKey: "faq_full.delais_4_q", rKey: "faq_full.delais_4_r" },
    ],
  },
  {
    id: "documents",
    icon: FileText,
    questions: [
      { qKey: "faq_full.documents_1_q", rKey: "faq_full.documents_1_r" },
      { qKey: "faq_full.documents_2_q", rKey: "faq_full.documents_2_r" },
      { qKey: "faq_full.documents_3_q", rKey: "faq_full.documents_3_r" },
      { qKey: "faq_full.documents_4_q", rKey: "faq_full.documents_4_r" },
      { qKey: "faq_full.documents_5_q", rKey: "faq_full.documents_5_r" },
    ],
  },
  {
    id: "securite",
    icon: ShieldAlert,
    questions: [
      { qKey: "faq_full.securite_1_q", rKey: "faq_full.securite_1_r" },
      { qKey: "faq_full.securite_2_q", rKey: "faq_full.securite_2_r" },
      { qKey: "faq_full.securite_3_q", rKey: "faq_full.securite_3_r" },
      { qKey: "faq_full.securite_4_q", rKey: "faq_full.securite_4_r" },
      { qKey: "faq_full.securite_5_q", rKey: "faq_full.securite_5_r" },
    ],
  },
];

export default function FAQ() {
  useNoCopy();
  const { t } = useTranslation();
  useSEO({
    title: t("nav_faq", "FAQ") + " — FEDE",
    description: t("faq_page.cat_general", "Questions fréquentes sur FEDE et les financements non remboursables en Europe."),
    path: "/faq",
  });
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("general");
  const [search, setSearch] = useState("");

  const allQuestions = FAQ_CATEGORIES.flatMap(c => c.questions.map(q => ({ q: t(q.qKey), r: t(q.rKey), cat: c.id })));
  const filtered = search.trim()
    ? allQuestions.filter(q => q.q.toLowerCase().includes(search.toLowerCase()) || q.r.toLowerCase().includes(search.toLowerCase()))
    : null;

  const activeQuestions = filtered ?? FAQ_CATEGORIES.find(c => c.id === activeCategory)?.questions.map(q => ({ q: t(q.qKey), r: t(q.rKey) })) ?? [];

  return (
    <div className="min-h-screen bg-[#F1F4FA] font-sans text-[#1A2235]">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#DDE2EC] shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
            <CSLogo size="sm" variant="dark" showText subtitle={t("nav.subtitle")} />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="text-sm text-[#4B5574] hover:text-[#0D1F3C] font-medium flex items-center gap-1">
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t("faq_page.back")}</span>
            </Link>
            <Link href="/register" className="whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#0D1F3C] hover:bg-[#162B52] text-white font-semibold rounded-lg transition-all shadow-md">
              {t("faq_page.submit")}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] py-20 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t("faq_page.hero_title")}</h1>
          <p className="text-white/65 text-lg mb-8">{t("faq_page.hero_sub")}</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-[#6B7896] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("faq_page.search")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/95 text-[#0D1F3C] rounded-xl px-4 py-3.5 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD500] placeholder-[#8B9BB4] shadow-lg"
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
                <cat.icon className="w-4 h-4" /> {t(CAT_LABEL_KEYS[cat.id])}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#F1F4FA] text-[#6B7896]'}`}>
                  {cat.questions.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {search && filtered && (
          <div className="mb-6 text-[#5B6580] text-sm">
            {filtered.length} {t("faq_page.results")} "<strong>{search}</strong>"
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
                  <span className="text-[#FFD500] shrink-0 bg-[#0D1F3C] rounded-lg p-0.5">
                    {openItem === key ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
          <div className="text-center py-12 text-[#8B9BB4]">{t("faq_page.no_q")}</div>
        )}

        <div className="mt-12 bg-white border border-[#DDE2EC] rounded-2xl p-8 text-center shadow-sm">
          <div className="text-[#0D1F3C] font-bold text-lg mb-2">{t("faq_page.contact_title")}</div>
          <p className="text-[#5B6580] text-sm mb-6">{t("faq_page.contact_sub")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:support@fede-financement.com" className="inline-flex items-center gap-2 bg-[#0D1F3C] hover:bg-[#162B52] text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md text-sm">
              {t("faq_page.write")}
            </a>
            <Link href="/register" className="inline-flex items-center gap-2 border border-[#DDE2EC] hover:border-[#0D1F3C] text-[#0D1F3C] font-semibold px-6 py-3 rounded-lg transition-all text-sm">
              {t("faq_page.file")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-[#080F1E] py-8 text-center text-white/20 text-xs">
        © 2025 FEDE — Article L1611-2 CGCT — <Link href="/" className="hover:text-white/40">{t("faq_page.back")}</Link>
      </footer>
    </div>
  );
}
