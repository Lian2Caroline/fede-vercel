import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useNoCopy } from "@/hooks/use-no-copy";
import {
  ChevronDown, ChevronUp, Check, Shield, FileText, Building, Lightbulb, Sprout,
  Home, GraduationCap, Landmark, Star, ArrowRight,
  Globe, Award, TrendingUp, Clock, Users, Euro,
  CheckCircle, AlertTriangle, Phone, Mail, MapPin
} from "lucide-react";
import { CSLogo } from "@/components/CSLogo";
import { TERRITORIES } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileLangBar } from "@/components/MobileLangBar";
import { useSEO } from "@/hooks/useSEO";

const TYPES_PROJETS_STATIC = [
  { icon: Building, labelKey: "projects.types.business_label", descKey: "projects.types.business_desc", badgeKey: "projects.types.business_badge" },
  { icon: Lightbulb, labelKey: "projects.types.innovation_label", descKey: "projects.types.innovation_desc", badgeKey: null },
  { icon: Sprout, labelKey: "projects.types.agri_label", descKey: "projects.types.agri_desc", badgeKey: null },
  { icon: Home, labelKey: "projects.types.housing_label", descKey: "projects.types.housing_desc", badgeKey: null },
  { icon: GraduationCap, labelKey: "projects.types.training_label", descKey: "projects.types.training_desc", badgeKey: "projects.types.training_badge" },
  { icon: Landmark, labelKey: "projects.types.culture_label", descKey: "projects.types.culture_desc", badgeKey: null },
];

const PROCESS_STEPS_STATIC = [
  { n: "01", icon: FileText, titleKey: "process.steps.s1_title", descKey: "process.steps.s1_desc", detailKey: "process.steps.s1_detail", highlight: false },
  { n: "02", icon: Shield, titleKey: "process.steps.s2_title", descKey: "process.steps.s2_desc", detailKey: "process.steps.s2_detail", highlight: false },
  { n: "03", icon: Star, titleKey: "process.steps.s3_title", descKey: "process.steps.s3_desc", detailKey: "process.steps.s3_detail", highlight: true },
  { n: "04", icon: CheckCircle, titleKey: "process.steps.s4_title", descKey: "process.steps.s4_desc", detailKey: "process.steps.s4_detail", highlight: false },
];

const AVIS_META = [
  { name: "Sandrine K.", note: 5, textKey: "reviews.r1_text", projectKey: "reviews.r1_project", locationKey: "reviews.r1_location", dateKey: "reviews.r1_date" },
  { name: "Juan-Pedro M.", note: 5, textKey: "reviews.r2_text", projectKey: "reviews.r2_project", locationKey: "reviews.r2_location", dateKey: "reviews.r2_date" },
  { name: "Marco T.", note: 5, textKey: "reviews.r3_text", projectKey: "reviews.r3_project", locationKey: "reviews.r3_location", dateKey: "reviews.r3_date" },
  { name: "Thierry A.", note: 4, textKey: "reviews.r4_text", projectKey: "reviews.r4_project", locationKey: "reviews.r4_location", dateKey: "reviews.r4_date" },
  { name: "Isabelle R.", note: 5, textKey: "reviews.r5_text", projectKey: "reviews.r5_project", locationKey: "reviews.r5_location", dateKey: "reviews.r5_date" },
  { name: "Bertrand N.", note: 5, textKey: "reviews.r6_text", projectKey: "reviews.r6_project", locationKey: "reviews.r6_location", dateKey: "reviews.r6_date" },
  { name: "Claudine O.", note: 5, textKey: "reviews.r7_text", projectKey: "reviews.r7_project", locationKey: "reviews.r7_location", dateKey: "reviews.r7_date" },
  { name: "Henrik B.", note: 5, textKey: "reviews.r8_text", projectKey: "reviews.r8_project", locationKey: "reviews.r8_location", dateKey: "reviews.r8_date" },
];

const CHIFFRES_STATIC = [
  { val: "2021", lblKey: "stats.countries", icon: Globe },
  { val: "200+", lblKey: "stats.devices", icon: Award },
  { val: "3 500+", lblKey: "stats.projects", icon: TrendingUp },
  { val: "94%", lblKey: "stats.satisfaction", icon: Star },
];

export default function Landing() {
  useNoCopy();
  const { t } = useTranslation();
  useSEO({
    title: `FEDE — ${t("nav.subtitle")} | FEDER FSE+ 2025-2027`,
    description: t("hero.slide1_sub", "Jusqu'à 80 % de votre projet financé sans remboursement. Accédez aux dispositifs réservés aux porteurs de projets européens."),
    path: "/",
  });
  const faqItems = [
    { q: t("faq.q1"), r: t("faq.a1") },
    { q: t("faq.q2"), r: t("faq.a2") },
    { q: t("faq.q3"), r: t("faq.a3") },
    { q: t("faq.q4"), r: t("faq.a4") },
    { q: t("faq.q5"), r: t("faq.a5") },
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroVisible, setHeroVisible] = useState(true);
  const [photoSlide, setPhotoSlide] = useState(0);

  const beneficiaries = [
    { name: "Marie D.", jobKey: "hero.beneficiary1_job", amount: "85 000 €", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&h=920&fit=crop&q=85" },
    { name: "Thomas K.", jobKey: "hero.beneficiary2_job", amount: "120 000 €", photo: "https://plus.unsplash.com/premium_photo-1661766744094-781bbc4f2b55?fm=jpg&q=85&w=700&h=920&fit=crop" },
    { name: "Sofia R.", jobKey: "hero.beneficiary3_job", amount: "200 000 €", photo: "https://plus.unsplash.com/premium_photo-1661726660137-61b182d93809?fm=jpg&q=85&w=700&h=920&fit=crop" },
    { name: "Ahmed B.", jobKey: "hero.beneficiary4_job", amount: "65 000 €", photo: "https://plus.unsplash.com/premium_photo-1664301363292-c0fd7102f1b1?fm=jpg&q=85&w=700&h=920&fit=crop" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroVisible(false);
      setTimeout(() => {
        setHeroSlide(s => (s + 1) % 3);
        setHeroVisible(true);
      }, 500);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const photoTimer = setInterval(() => {
      setPhotoSlide(s => (s + 1) % 4);
    }, 3800);
    return () => clearInterval(photoTimer);
  }, []);
  const chiffres = CHIFFRES_STATIC.map(c => ({ ...c, lbl: t(c.lblKey) }));
  const tickerItems = [
    t("ticker.item1"), t("ticker.item2"), t("ticker.item3"), t("ticker.item4"),
    t("ticker.item5"), t("ticker.item6"), t("ticker.item7"), t("ticker.item8"),
    t("ticker.item9"), t("ticker.item10"), t("ticker.item11"), t("ticker.item12"),
  ];
  const partenaires = [
    t("landing.partner1"), t("landing.partner2"), t("landing.partner3"), t("landing.partner4"),
    t("landing.partner5"), t("landing.partner6"), t("landing.partner7"), t("landing.partner8"),
  ];
  const [contactInfo, setContactInfo] = useState({ telephone: "+33 (0) 800 123 456", email: "support@fede-financement.com", adresse: "Disponible pour toute l'Europe" });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/settings/contact`).then(r => r.ok ? r.json() : null).then(d => { if (d) setContactInfo(d); }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-[#0A1628]">

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-[#FFD500] text-[#0A1628] overflow-hidden relative h-9 flex items-center">
        <div className="shrink-0 bg-[#0D1F3C] text-white px-4 h-full flex items-center z-10 text-xs font-black uppercase tracking-widest whitespace-nowrap border-r border-[#0A1628]/20">
          {t("landing.info_badge")}
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track flex gap-12 text-xs text-[#0A1628]/75 font-medium whitespace-nowrap py-2 pl-8">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-2 shrink-0">
                {item}
                <span className="text-[#0A1628]/40 text-base font-bold mx-2">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-[#0D1F3C] border-b border-white/10 shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[68px] flex items-center justify-between">
          <Link href="/" className="cursor-pointer">
            <CSLogo size="md" variant="light" showText subtitle={t("nav.subtitle")} />
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            <a href="#pourquoi" className="px-4 py-2 text-sm text-white/60 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/8">{t("nav.why")}</a>
            <a href="#projets" className="px-4 py-2 text-sm text-white/60 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/8">{t("nav.projects")}</a>
            <a href="#processus" className="px-4 py-2 text-sm text-white/60 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/8">{t("nav.process")}</a>
            <Link href="/faq" className="px-4 py-2 text-sm text-white/60 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/8">{t("nav.faq")}</Link>
            <Link href="/avis" className="px-4 py-2 text-sm text-white/60 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/8">{t("nav.reviews")}</Link>
            <div className="w-px h-5 bg-white/15 mx-3" />
            <LanguageSelector variant="light" />
            <Link href="/login" className="px-4 py-2 text-sm text-white/80 font-semibold hover:bg-white/8 rounded-lg transition-colors">{t("nav.login")}</Link>
            <Link href="/register" className="ml-2 px-5 py-2.5 text-sm bg-[#FFD500] hover:bg-[#FFC900] text-[#0A1628] font-bold rounded-xl transition-all shadow-sm hover:shadow-lg active:scale-95">
              {t("nav.submit")}
            </Link>
          </div>

          <button className="md:hidden p-2 text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="space-y-1.5">
              <div className={`h-0.5 w-6 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <div className={`h-0.5 w-6 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <div className={`h-0.5 w-6 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#0D1F3C] border-t border-white/10 px-6 py-4 space-y-3">
            <a href="#pourquoi" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-white/70 hover:text-white">{t("nav.why")}</a>
            <a href="#projets" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-white/70 hover:text-white">{t("nav.projects")}</a>
            <a href="#processus" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-white/70 hover:text-white">{t("nav.process")}</a>
            <Link href="/faq" className="block py-2 text-sm font-medium text-white/70 hover:text-white">{t("nav.faq")}</Link>
            <Link href="/avis" className="block py-2 text-sm font-medium text-white/70 hover:text-white">{t("nav.reviews")}</Link>
            <MobileLangBar />
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" className="text-center py-2.5 border border-white/30 text-white font-semibold rounded-xl text-sm">{t("nav.login")}</Link>
              <Link href="/register" className="text-center py-2.5 bg-[#FFD500] text-[#0A1628] font-bold rounded-xl text-sm">{t("nav.submit")}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO + STATS — viewport wrapper ── */}
      <div className="flex flex-col lg:min-h-[calc(100vh-104px)]" style={{ minHeight: "600px" }}>

      {/* ── HERO — CINEMATIC FULL-BG ── */}
      <section className="relative flex flex-col overflow-hidden bg-[#08132A] flex-1">

        {/* ── Full-screen background image at ~35% opacity ── */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1800&q=80"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.35 }}
            aria-hidden="true"
          />
          {/* Strong left gradient so text stays very readable */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,19,42,0.97) 0%, rgba(8,19,42,0.85) 45%, rgba(8,19,42,0.55) 70%, rgba(8,19,42,0.3) 100%)" }} />
          {/* Top edge fade */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#08132A]/60 to-transparent" />
          {/* Gold radial glow — top right */}
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,213,0,0.07) 0%, transparent 65%)" }} />
        </div>

        {/* ── Hero: 2 columns on desktop ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] relative z-10">

          {/* LEFT — Text content */}
          <div className="flex items-start px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-8">
            <div className="w-full max-w-xl">

              {/* Slide indicator dots */}
              <div className="flex gap-2 mb-4 lg:mb-6">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => { setHeroVisible(false); setTimeout(() => { setHeroSlide(i); setHeroVisible(true); }, 400); }}
                    className={`h-1 rounded-full transition-all duration-500 ${heroSlide === i ? 'w-8 bg-[#FFD500]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>

              {/* Tag badge — slides in from left */}
              <div className={`transition-all duration-700 ease-out ${heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'}`}>
                <div className="inline-flex items-center gap-2 border border-[#FFD500]/30 bg-[#FFD500]/10 text-[#FFD500] text-xs font-black px-4 py-1.5 rounded-full mb-3 lg:mb-5 uppercase tracking-[0.18em]">
                  <span className="w-1.5 h-1.5 bg-[#FFD500] rounded-full animate-pulse" />
                  {t(`hero.slide${heroSlide + 1}_tag`)}
                </div>
              </div>

              {/* Headline — parts enter from opposite sides */}
              <h1 className="text-[clamp(1.8rem,3.3vw,3.7rem)] font-black leading-[1.08] tracking-tight text-white mb-2 lg:mb-3">
                {(() => {
                  const h1 = t(`hero.slide${heroSlide + 1}_h1`);
                  const highlight = t(`hero.slide${heroSlide + 1}_highlight`);
                  const parts = h1.split(highlight);
                  const before = parts[0] ?? "";
                  const after = parts.slice(1).join(highlight);
                  return (
                    <>
                      <span className="inline-block transition-all duration-700 ease-out"
                        style={{ transitionDelay: "80ms", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateX(0)" : "translateX(-50px)" }}>
                        {before}
                      </span>
                      <span className="inline-block text-[#FFD500] transition-all duration-700 ease-out"
                        style={{ transitionDelay: "160ms", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateX(0)" : "translateX(50px)" }}>
                        {highlight}
                      </span>
                      {after && (
                        <span className="inline-block transition-all duration-700 ease-out"
                          style={{ transitionDelay: "240ms", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateX(0)" : "translateX(-50px)" }}>
                          {after}
                        </span>
                      )}
                    </>
                  );
                })()}
              </h1>

              {/* Subtitle */}
              <p className="text-white/60 text-sm lg:text-base leading-relaxed mb-4 lg:mb-6 font-light transition-all duration-700 ease-out"
                style={{ transitionDelay: "320ms", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(18px)" }}>
                {t(`hero.slide${heroSlide + 1}_sub`)}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 transition-all duration-700 ease-out"
                style={{ transitionDelay: "420ms", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(18px)" }}>
                <Link href="/register" className="group inline-flex items-center gap-2 bg-[#FFD500] hover:bg-[#FFC900] text-[#0A1628] font-black px-6 py-3 lg:px-7 lg:py-3.5 rounded-xl transition-all shadow-lg shadow-[#FFD500]/25 hover:shadow-[#FFD500]/50 active:scale-95 text-sm lg:text-base">
                  {t("hero.cta_submit")}
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#pourquoi" className="inline-flex items-center gap-2 border border-white/25 text-white/80 font-semibold px-6 py-3 lg:px-7 lg:py-3.5 rounded-xl hover:border-white/50 hover:text-white transition-all text-sm lg:text-base backdrop-blur-sm bg-white/5">
                  {t("hero.cta_learn")}
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — Rotating beneficiary photos (desktop only) */}
          <div className="hidden lg:block relative overflow-hidden">
            {/* Left-edge fade to blend with dark bg */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#08132A] to-transparent z-10 pointer-events-none" />
            {/* Top fade */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#08132A]/60 to-transparent z-10 pointer-events-none" />

            {beneficiaries.map((b, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{ opacity: photoSlide === i ? 1 : 0 }}
              >
                <img
                  src={b.photo}
                  alt=""
                  className="w-full h-full object-cover object-center"
                />
                {/* Bottom gradient for bandeau readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08132A]/90 via-[#08132A]/20 to-transparent" />

                {/* Bandeau bénéficiaire */}
                <div className="absolute bottom-8 left-6 right-6 z-20">
                  <div className="bg-black/50 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FFD500]/20 border border-[#FFD500]/50 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-[#FFD500]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm leading-tight">{b.name}</div>
                        <div className="text-white/50 text-xs truncate">{t(b.jobKey)}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[#FFD500] font-black text-base leading-tight">{b.amount}</div>
                        <div className="text-white/35 text-[10px]">financé</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Vertical dot indicators */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 z-20">
              {beneficiaries.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoSlide(i)}
                  className={`rounded-full transition-all duration-500 ${photoSlide === i ? 'h-7 w-1.5 bg-[#FFD500]' : 'h-2 w-1.5 bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* ── Stats strip — always visible at bottom of viewport ── */}
      <div className="bg-[#06101F] border-t-2 border-[#B5872A]/40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 md:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {chiffres.map((c) => (
              <div key={c.lblKey} className="flex flex-col items-center py-2 px-6 group">
                <div className="text-3xl md:text-4xl font-black text-[#FFD500] tracking-tight leading-none mb-1.5">
                  {c.val}
                </div>
                <div className="text-white/70 text-xs font-medium text-center leading-snug group-hover:text-white/90 transition-colors">
                  {c.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      </div>{/* end viewport wrapper */}

      {/* ── PARTENAIRES INSTITUTIONNELS ── */}
      <div className="bg-[#F8F9FC] border-b border-[#E5E8F0] py-7 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-[#9AA4BC] text-[10px] uppercase tracking-[0.25em] font-bold mb-6 text-center">{t("landing.partners_title")}</div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {partenaires.map((p) => (
              <div key={p} className="bg-white border border-[#DDE2EC] rounded-lg px-5 py-2 text-sm text-[#4B5574] font-medium hover:border-[#FFD500] hover:shadow-sm transition-all">{p}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GARANTIES — 4 PILIERS ── */}
      <div className="bg-white border-b-2 border-[#E5E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E8F0] rounded-xl overflow-hidden md:rounded-none md:bg-transparent md:gap-0 md:divide-x md:divide-[#E5E8F0]">

            {/* Pilier 1 */}
            <div className="bg-white flex flex-row items-start text-left gap-3 px-4 py-4 sm:flex-col sm:items-center sm:text-center sm:gap-2 sm:px-3 md:flex-row md:items-start md:text-left md:gap-3 md:px-6 lg:px-8 md:py-2">
              <div className="w-10 h-10 rounded-xl bg-[#FFD500] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[#0A1628]" />
              </div>
              <div>
                <div className="font-black text-[#0A1628] text-xs md:text-sm leading-snug mb-0.5">{t("institutional.badge")}</div>
                <div className="text-[#6B7896] text-[10px] md:text-xs leading-relaxed">{t("institutional.legal")}</div>
              </div>
            </div>

            {/* Pilier 2 */}
            <div className="bg-white flex flex-row items-start text-left gap-3 px-4 py-4 sm:flex-col sm:items-center sm:text-center sm:gap-2 sm:px-3 md:flex-row md:items-start md:text-left md:gap-3 md:px-6 lg:px-8 md:py-2">
              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-black text-[#0A1628] text-xs md:text-sm leading-snug mb-0.5">{t("institutional.open")}</div>
                <div className="text-[#6B7896] text-[10px] md:text-xs leading-relaxed">{t("institutional.desc")}</div>
              </div>
            </div>

            {/* Pilier 3 */}
            <div className="bg-white flex flex-row items-start text-left gap-3 px-4 py-4 sm:flex-col sm:items-center sm:text-center sm:gap-2 sm:px-3 md:flex-row md:items-start md:text-left md:gap-3 md:px-6 lg:px-8 md:py-2">
              <div className="w-10 h-10 rounded-xl bg-[#F1F4FA] flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-[#0D1F3C]" />
              </div>
              <div>
                <div className="font-black text-[#0A1628] text-xs md:text-sm leading-snug mb-0.5">{t("institutional.countries_count")}</div>
                <div className="text-[#6B7896] text-[10px] md:text-xs leading-relaxed">{t("institutional.countries_desc")}</div>
              </div>
            </div>

            {/* Pilier 4 */}
            <div className="bg-white flex flex-row items-start text-left gap-3 px-4 py-4 sm:flex-col sm:items-center sm:text-center sm:gap-2 sm:px-3 md:flex-row md:items-start md:text-left md:gap-3 md:px-6 lg:px-8 md:py-2">
              <div className="w-10 h-10 rounded-xl bg-[#0D1F3C] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#FFD500]" />
              </div>
              <div>
                <div className="font-black text-[#0A1628] text-xs md:text-sm leading-snug mb-0.5">{t("institutional.advisor")}</div>
                <div className="text-[#6B7896] text-[10px] md:text-xs leading-relaxed">{t("institutional.advisor_desc")}</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── POURQUOI CE DISPOSITIF ── */}
      <section id="pourquoi" className="py-14 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <div className="inline-block bg-[#FFD500] text-[#0A1628] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 mb-7">{t("why.tag")}</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0A1628] mb-10 leading-[1.05] tracking-tight">
                {t("why.title")}
              </h2>
              <div className="space-y-5 text-[#4B5574] leading-relaxed">
                <p className="text-lg font-semibold text-[#1A2235] leading-relaxed border-l-4 border-[#FFD500] pl-5 py-1">{t("why.p1")}</p>
                <p className="text-base">{t("why.p2")}</p>
                <p className="text-base">{t("why.p3")}</p>
                <p className="text-base">{t("why.p4")}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: Award, titleKey: "why.card_legal_title", descKey: "why.card_legal_desc", accent: "#0D1F3C" },
                { icon: AlertTriangle, titleKey: "why.card_urgency_title", descKey: "why.card_urgency_desc", accent: "#FFD500" },
                { icon: Users, titleKey: "why.card_who_title", descKey: "why.card_who_desc", accent: "#1B6E3D" },
                { icon: TrendingUp, titleKey: "why.card_impact_title", descKey: "why.card_impact_desc", accent: "#265494" },
              ].map((item) => (
                <div
                  key={item.titleKey}
                  className="flex items-start gap-4 sm:gap-5 p-4 sm:p-6 bg-white border border-[#E5E8F0] rounded-xl hover:border-[#FFD500] hover:shadow-md transition-all group"
                  style={{ borderLeftWidth: '4px', borderLeftColor: item.accent }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F6FA] group-hover:bg-[#FFFBDB] flex items-center justify-center shrink-0 transition-colors">
                    <item.icon className="w-5 h-5 text-[#0D1F3C]" />
                  </div>
                  <div>
                    <div className="font-black text-[#0A1628] text-sm mb-1.5">{t(item.titleKey)}</div>
                    <div className="text-[#5B6580] text-sm leading-relaxed">{t(item.descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TYPES DE PROJETS ── */}
      <section id="projets" className="bg-[#0D1F3C] py-14 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-16">
            <div>
              <div className="inline-block bg-[#FFD500] text-[#0A1628] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 mb-6">{t("projects.tag")}</div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.05] tracking-tight">{t("projects.title")}</h2>
            </div>
            <p className="text-white/50 text-base leading-relaxed md:max-w-xs">{t("projects.sub")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TYPES_PROJETS_STATIC.map((tp, idx) => (
              <div key={tp.labelKey} className="bg-white/[0.05] border border-white/10 rounded-xl p-7 hover:bg-white/[0.09] hover:border-[#FFD500]/40 transition-all group cursor-default">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-[#FFD500]/25 font-black text-5xl leading-none select-none group-hover:text-[#FFD500]/40 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  {tp.badgeKey && (
                    <span className="bg-[#FFD500]/15 text-[#FFD500] text-[10px] font-black px-2.5 py-1 rounded-full border border-[#FFD500]/30 uppercase tracking-wide">{t(tp.badgeKey)}</span>
                  )}
                </div>
                <div className="w-11 h-11 bg-[#FFD500]/10 rounded-xl flex items-center justify-center text-[#FFD500] mb-5 group-hover:bg-[#FFD500]/20 transition-colors">
                  <tp.icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-white text-base mb-2 leading-snug">{t(tp.labelKey)}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{t(tp.descKey)}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/register" className="inline-flex items-center gap-2 bg-[#FFD500] hover:bg-[#FFC900] text-[#0A1628] font-black px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg">
              {t("projects.cta")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROCESSUS ── */}
      <section id="processus" className="py-14 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-20">
            <div>
              <div className="inline-block bg-[#FFD500] text-[#0A1628] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 mb-6">{t("process.tag")}</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0A1628] leading-[1.05] tracking-tight">{t("process.title")}</h2>
            </div>
            <p className="text-[#5B6580] text-base leading-relaxed md:max-w-xs">{t("process.sub")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-0 relative">
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-[#E5E8F0] z-0" />
            {PROCESS_STEPS_STATIC.map((step, i) => (
              <div key={step.n} className="relative flex flex-col items-center text-center px-4 md:px-6">
                <div className={`relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 font-black text-2xl tracking-tight transition-all ${step.highlight ? 'bg-[#FFD500] text-[#0A1628] shadow-lg shadow-[#FFD500]/30' : 'bg-[#F5F6FA] text-[#0D1F3C] border border-[#E5E8F0]'}`}>
                  {step.n}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${step.highlight ? 'bg-[#0D1F3C]' : 'bg-[#F5F6FA]'}`}>
                  <step.icon className={`w-5 h-5 ${step.highlight ? 'text-[#FFD500]' : 'text-[#0D1F3C]'}`} />
                </div>
                <h3 className="font-black text-[#0A1628] text-sm mb-2 leading-snug">{t(step.titleKey)}</h3>
                <p className="text-[#5B6580] text-xs leading-relaxed mb-3">{t(step.descKey)}</p>
                <div className="flex items-center justify-center gap-1 text-[#9AA4BC] text-[10px] font-medium">
                  <Clock className="w-3 h-3" /> {t(step.detailKey)}
                </div>
                {step.highlight && (
                  <div className="mt-3 bg-[#FFD500] text-[#0A1628] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                    {t("process.steps.s3_badge")}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-14">
            <Link href="/processus" className="inline-flex items-center gap-2 border-2 border-[#0D1F3C] text-[#0D1F3C] hover:bg-[#0D1F3C] hover:text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all">
              {t("process.cta")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── AVIS CLIENTS ── */}
      <section className="py-14 md:py-28 bg-[#F8F9FC] border-y border-[#E5E8F0] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-8 md:mb-14">
          <div className="flex items-end justify-between">
            <div>
              <div className="inline-block bg-[#FFD500] text-[#0A1628] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 mb-6">{t("reviews.tag")}</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0A1628] leading-[1.05] tracking-tight">{t("reviews.title")}</h2>
            </div>
            <Link href="/avis" className="hidden md:inline-flex items-center gap-2 text-[#0D1F3C] font-bold text-sm border-b-2 border-[#FFD500] pb-0.5 hover:border-[#0D1F3C] transition-colors">
              {t("reviews.see_all")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="reviews-track flex gap-4 w-max">
            {[...AVIS_META, ...AVIS_META].map((a, i) => (
              <div key={i} className="w-[280px] sm:w-[360px] shrink-0 bg-white border border-[#E5E8F0] rounded-xl p-5 sm:p-7 shadow-sm hover:shadow-md hover:border-[#FFD500] transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(a.note)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#FFD500] text-[#FFD500]" />)}
                  {[...Array(5 - a.note)].map((_, j) => <Star key={j} className="w-4 h-4 text-[#E5E8F0]" />)}
                </div>
                <p className="text-[#2D3A52] text-sm leading-relaxed mb-5 line-clamp-4">« {t(a.textKey)} »</p>
                <div className="flex items-center justify-between pt-4 border-t border-[#F1F4FA]">
                  <div>
                    <div className="font-black text-[#0A1628] text-sm">{a.name}</div>
                    <div className="text-[#9AA4BC] text-xs mt-0.5">{t(a.projectKey)} · {t(a.locationKey)}</div>
                  </div>
                  <div className="text-[#9AA4BC] text-xs">{t(a.dateKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-10">
          <Link href="/avis" className="inline-flex items-center gap-2 border-2 border-[#0D1F3C] text-[#0D1F3C] hover:bg-[#0D1F3C] hover:text-white px-7 py-3 rounded-xl font-bold text-sm transition-all md:hidden">
            {t("reviews.see_all")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── URGENCY ── */}
      <section className="bg-[#0D1F3C] py-12 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FFD500]/15 border border-[#FFD500]/30 rounded-full px-4 py-1.5 text-sm text-[#FFD500] font-bold mb-8">
                <Clock className="w-3.5 h-3.5" /> {t("urgency.tag")}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-[1.05] tracking-tight">{t("urgency.title")}</h2>
              <p className="text-white/55 text-base sm:text-xl leading-relaxed mb-10 font-light">{t("urgency.sub")}</p>
              <Link href="/register" className="inline-flex items-center gap-2 bg-[#FFD500] hover:bg-[#FFC900] text-[#0A1628] font-black px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl active:scale-95 text-base">
                {t("urgency.cta")} <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="mt-4 text-white/30 text-sm">{t("urgency.cta_sub")}</div>
            </div>
            <div className="space-y-4">
              {[
                { n: "01", titleKey: "urgency.r1_title", descKey: "urgency.r1_desc", icon: Euro },
                { n: "02", titleKey: "urgency.r2_title", descKey: "urgency.r2_desc", icon: Clock },
                { n: "03", titleKey: "urgency.r3_title", descKey: "urgency.r3_desc", icon: AlertTriangle },
              ].map((r) => (
                <div key={r.n} className="flex items-start gap-5 bg-white/[0.05] border border-white/10 rounded-xl px-6 py-5 hover:bg-white/[0.08] transition-all">
                  <div className="w-11 h-11 rounded-xl bg-[#FFD500]/15 flex items-center justify-center shrink-0">
                    <r.icon className="w-5 h-5 text-[#FFD500]" />
                  </div>
                  <div>
                    <div className="text-[#FFD500] font-black text-xs tracking-[0.15em] mb-1">{r.n}</div>
                    <h3 className="font-black text-white text-sm mb-1.5 leading-snug">{t(r.titleKey)}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{t(r.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-white py-14 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-3 gap-8 md:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="inline-block bg-[#FFD500] text-[#0A1628] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 mb-6">{t("faq.tag")}</div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0A1628] mb-5 leading-[1.05] tracking-tight">{t("faq.title")}</h2>
              <p className="text-[#5B6580] text-base leading-relaxed mb-8">{t("faq.sub")}</p>
              <Link href="/faq" className="inline-flex items-center gap-2 border-2 border-[#0D1F3C] text-[#0D1F3C] hover:bg-[#0D1F3C] hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition-all">
                {t("faq.see_all")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {faqItems.map((item, i) => (
                <div key={i} className="border border-[#E5E8F0] rounded-xl overflow-hidden bg-white hover:border-[#FFD500] transition-colors">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-7 py-5 flex justify-between items-center hover:bg-[#FFFDF0] transition-colors"
                  >
                    <span className="font-bold text-[#0A1628] text-sm pr-6 leading-snug">{item.q}</span>
                    <span className="text-[#FFD500] shrink-0 bg-[#0D1F3C] rounded-lg p-1">
                      {openFaq === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-7 pb-6 text-[#4B5574] text-sm leading-relaxed border-t border-[#F5F6FA] pt-5 bg-[#FFFDF5]">
                      {item.r}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ALERTE ANTI-ARNAQUE ── */}
      <section className="py-10 md:py-16 bg-[#FFFDF0] border-y-2 border-[#FFD500]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="bg-white border-2 border-[#FFD500]/30 rounded-2xl p-6 sm:p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-[#FFD500] flex items-center justify-center">
                  <Shield className="w-7 h-7 text-[#0A1628]" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <h3 className="text-[#0A1628] font-black text-xl tracking-tight">{t("antiscam.title")}</h3>
                </div>
                <p className="text-[#4B5574] text-base leading-relaxed mb-7">{t("antiscam.desc")}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { icon: "❌", titleKey: "antiscam.no_telegram", descKey: "antiscam.no_telegram_desc", positive: false },
                    { icon: "❌", titleKey: "antiscam.no_wire", descKey: "antiscam.no_wire_desc", positive: false },
                    { icon: "❌", titleKey: "antiscam.no_banking", descKey: "antiscam.no_banking_desc", positive: false },
                    { icon: "✅", titleKey: "antiscam.official", descKey: "antiscam.official_desc", positive: true },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${item.positive ? "bg-green-50 border-green-200" : "bg-red-50 border-red-100"}`}>
                      <span className="text-base shrink-0">{item.icon}</span>
                      <div>
                        <div className={`font-black text-sm ${item.positive ? "text-green-800" : "text-red-800"}`}>{t(item.titleKey)}</div>
                        <div className={`text-xs mt-0.5 leading-relaxed ${item.positive ? "text-green-700" : "text-red-600"}`}>{t(item.descKey)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-[#6B7896] text-xs">
                  <Mail className="w-3.5 h-3.5 text-[#FFD500] shrink-0" />
                  <span>{t("antiscam.report")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-14 md:py-28 bg-[#F8F9FC] border-b border-[#E5E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-[#0D1F3C]/15">
            <div className="bg-white p-6 sm:p-10 md:p-14">
              <div className="inline-flex items-center gap-2 bg-[#FFD500] text-[#0A1628] text-xs font-black px-3 py-1.5 rounded mb-8 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-[#0A1628] rounded-full animate-pulse" /> {t("urgency.badge")}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0A1628] mb-6 leading-[1.05] tracking-tight">{t("urgency.cta_title")}</h2>
              <p className="text-[#5B6580] text-lg leading-relaxed mb-8 font-normal">
                {t("urgency.cta_desc")}
              </p>
              <div className="space-y-3 text-sm text-[#5B6580]">
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-600 shrink-0" /> {t("urgency.cta_sub").split("•")[0]?.trim()}</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-600 shrink-0" /> {t("urgency.cta_sub").split("•")[1]?.trim()}</div>
                <div className="flex items-center gap-2.5"><Shield className="w-4 h-4 text-[#0D1F3C] shrink-0" /> {t("institutional.rgpd")}</div>
              </div>
            </div>
            <div className="bg-[#0D1F3C] p-6 sm:p-10 md:p-14 text-white flex flex-col justify-center">
              <div className="text-white/40 text-sm mb-8 leading-relaxed">{t("urgency.cta_desc")}</div>
              <div className="flex flex-col gap-4">
                <Link href="/register" className="w-full text-center bg-[#FFD500] hover:bg-[#FFC900] text-[#0A1628] font-black px-8 py-4 rounded-xl transition-all shadow-lg text-base">
                  {t("urgency.cta_register")}
                </Link>
                <Link href="/login" className="w-full text-center bg-white/8 hover:bg-white/14 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all text-base">
                  {t("urgency.cta_login")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080F1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-8 md:pt-16 md:pb-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8 md:mb-14">
            <div>
              <div className="mb-5">
                <CSLogo size="sm" variant="light" showText subtitle={t("landing.footer_official")} />
              </div>
              <p className="text-white/30 text-xs leading-relaxed mb-5">{t("landing.footer_tagline2")}</p>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-[#FFD500]" />
                <span className="text-white/25 text-xs">{t("landing.footer_hosted")}</span>
              </div>
            </div>
            <div>
              <div className="text-white/40 text-[10px] uppercase tracking-[0.15em] font-black mb-5">{t("footer.territories")}</div>
              {TERRITORIES.slice(0, 10).map((ter) => (
                <div key={ter.id} className="text-white/30 text-xs py-1.5 hover:text-white/55 transition-colors cursor-default">{ter.name}</div>
              ))}
            </div>
            <div>
              <div className="text-white/40 text-[10px] uppercase tracking-[0.15em] font-black mb-5">{t("footer.nav")}</div>
              {[
                { labelKey: "footer.nav_process", href: "/processus" },
                { labelKey: "footer.nav_projects", href: "#projets" },
                { labelKey: "footer.nav_faq", href: "/faq" },
                { labelKey: "footer.nav_reviews", href: "/avis" },
                { labelKey: "footer.nav_login", href: "/login" },
                { labelKey: "footer.nav_register", href: "/register" },
              ].map((l) => (
                <div key={l.labelKey} className="py-1.5">
                  <Link href={l.href} className="text-white/30 text-xs hover:text-white/55 transition-colors">{t(l.labelKey)}</Link>
                </div>
              ))}
            </div>
            <div>
              <div className="text-white/40 text-[10px] uppercase tracking-[0.15em] font-black mb-5">{t("footer.contact")}</div>
              <div className="space-y-3.5 text-white/30 text-xs">
                <div className="flex items-center gap-2.5"><Mail className="w-3 h-3 text-[#FFD500] shrink-0" /> {contactInfo.email}</div>
                <div className="flex items-center gap-2.5"><Phone className="w-3 h-3 text-[#FFD500] shrink-0" /> {contactInfo.telephone}</div>
                <div className="flex items-start gap-2.5"><MapPin className="w-3 h-3 text-[#FFD500] mt-0.5 shrink-0" /> <span>{contactInfo.adresse}</span></div>
                <div className="pt-1 text-white/18">{t("footer.hours")}</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.07] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20">
            <span className="text-center md:text-left">{t("footer.copyright")}</span>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2">
              {[t("footer.legal"), t("footer.privacy"), t("footer.cgu"), t("footer.accessibility")].map(l => (
                <span key={l} className="cursor-pointer hover:text-white/40 transition-colors whitespace-nowrap">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
