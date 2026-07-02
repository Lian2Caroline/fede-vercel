import { Link } from "wouter";
import { useNoCopy } from "@/hooks/use-no-copy";
import { ArrowLeft, ArrowRight, FileText, Shield, Star, CheckCircle, Clock, AlertTriangle, Upload, Euro, Bell, Check, Users, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/useSEO";
import { CSLogo } from "@/components/CSLogo";

export default function ProcessusDetail() {
  useNoCopy();
  const { t } = useTranslation();
  useSEO({
    title: t("nav_process", "Processus") + " — FEDE",
    description: t("processus_content.step1_desc", "Un guide complet de chaque étape, de l'inscription jusqu'au versement de votre financement."),
    path: "/processus",
  });

  const ETAPES_DETAIL = [
    {
      n: "01",
      title: t("processus_content.step1_title"),
      color: "from-[#0D1F3C] to-[#1A3561]",
      icon: Users,
      duree: t("processus_content.step1_duree"),
      description: t("processus_content.step1_desc"),
      sousetapes: t("processus_content.step1_steps", { returnObjects: true }) as string[],
      bon_a_savoir: t("processus_content.step1_tip"),
      docs: t("processus_content.step1_docs", { returnObjects: true }) as string[],
    },
    {
      n: "02",
      title: t("processus_content.step2_title"),
      color: "from-[#1A3561] to-[#265494]",
      icon: FileText,
      duree: t("processus_content.step2_duree"),
      description: t("processus_content.step2_desc"),
      sousetapes: t("processus_content.step2_steps", { returnObjects: true }) as string[],
      bon_a_savoir: t("processus_content.step2_tip"),
      docs: t("processus_content.step2_docs", { returnObjects: true }) as string[],
    },
    {
      n: "03",
      title: t("processus_content.step3_title"),
      color: "from-[#265494] to-[#3B72B5]",
      icon: Upload,
      duree: t("processus_content.step3_duree"),
      description: t("processus_content.step3_desc"),
      sousetapes: t("processus_content.step3_steps", { returnObjects: true }) as string[],
      bon_a_savoir: t("processus_content.step3_tip"),
      docs: t("processus_content.step3_docs", { returnObjects: true }) as string[],
    },
    {
      n: "04",
      title: t("processus_content.step4_title"),
      color: "from-[#3B72B5] to-[#1B6E3D]",
      icon: Shield,
      duree: t("processus_content.step4_duree"),
      description: t("processus_content.step4_desc"),
      sousetapes: t("processus_content.step4_steps", { returnObjects: true }) as string[],
      bon_a_savoir: t("processus_content.step4_tip"),
      docs: t("processus_content.step4_docs", { returnObjects: true }) as string[],
      highlight: true,
      frais: true,
    },
    {
      n: "05",
      title: t("processus_content.step5_title"),
      color: "from-[#1B6E3D] to-[#0D5C32]",
      icon: Euro,
      duree: t("processus_content.step5_duree"),
      description: t("processus_content.step5_desc"),
      sousetapes: t("processus_content.step5_steps", { returnObjects: true }) as string[],
      bon_a_savoir: t("processus_content.step5_tip"),
      docs: t("processus_content.step5_docs", { returnObjects: true }) as string[],
      montant: t("processus_content.step5_montant"),
    },
    {
      n: "06",
      title: t("processus_content.step6_title"),
      color: "from-[#1B6E3D] to-[#145830]",
      icon: CheckCircle,
      duree: t("processus_content.step6_duree"),
      description: t("processus_content.step6_desc"),
      sousetapes: t("processus_content.step6_steps", { returnObjects: true }) as string[],
      bon_a_savoir: t("processus_content.step6_tip"),
      docs: t("processus_content.step6_docs", { returnObjects: true }) as string[],
    },
  ];

  const GARANTIES = [
    { icon: Shield, title: t("processus_content.g1_title"), desc: t("processus_content.g1_desc") },
    { icon: Bell, title: t("processus_content.g2_title"), desc: t("processus_content.g2_desc") },
    { icon: Clock, title: t("processus_content.g3_title"), desc: t("processus_content.g3_desc") },
    { icon: Phone, title: t("processus_content.g4_title"), desc: t("processus_content.g4_desc") },
  ];

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
              <span className="hidden sm:inline">{t("processus_detail.back")}</span>
            </Link>
            <Link href="/register" className="whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#0D1F3C] hover:bg-[#162B52] text-white font-semibold rounded-lg transition-all shadow-md">
              {t("processus_detail.start")}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] py-20 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FFD500]/20 border border-[#FFD500]/30 rounded-full px-4 py-1.5 text-sm text-[#FFD500] font-semibold mb-6">
            {t("processus_detail.hero_tag")}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t("processus_detail.hero_title")}</h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto">{t("processus_detail.hero_sub")}</p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/50 text-sm">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {t("processus_detail.duration")}</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> {t("processus_detail.online")}</span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> {t("processus_detail.rgpd")}</span>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {ETAPES_DETAIL.map((etape, i) => (
            <div key={i} className={`relative bg-white border rounded-2xl overflow-hidden shadow-sm ${etape.highlight ? 'border-[#FFD500]/40 shadow-md' : 'border-[#DDE2EC]'}`}>
              {etape.highlight && (
                <div className="bg-[#FFFBDB] border-b border-[#FFD500]/20 px-6 py-2 flex items-center gap-2 text-sm text-[#B8860B] font-semibold">
                  <AlertTriangle className="w-4 h-4" /> {t("processus_detail.key_step")}
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
                        <span className="bg-[#FFD500] text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full">{etape.montant}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7896] text-sm mb-4">
                      <Clock className="w-4 h-4" /> {etape.duree}
                    </div>
                    <p className="text-[#4B5574] leading-relaxed mb-6">{etape.description}</p>

                    <div className="mb-6">
                      <div className="text-[#0D1F3C] font-bold text-sm mb-3">{t("processus_detail.steps")}</div>
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
                          <FileText className="w-4 h-4" /> {t("processus_detail.docs")}
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
                        <div className="text-[#3B5AC2] font-bold text-xs uppercase tracking-wide mb-1.5">{t("processus_detail.tip")}</div>
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
            <h2 className="text-2xl font-extrabold text-[#0D1F3C] mb-2">{t("processus_detail.quality_title")}</h2>
            <p className="text-[#5B6580] text-sm">{t("processus_detail.quality_sub")}</p>
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
          <h2 className="text-2xl font-extrabold mb-3">{t("processus_detail.cta_title")}</h2>
          <p className="text-white/65 mb-6">{t("processus_detail.cta_sub")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 bg-[#FFD500] hover:bg-[#FFC900] text-[#0A1628] font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl">
              {t("processus_detail.cta_btn")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/faq" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-xl transition-all">
              {t("processus_detail.cta_faq")}
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-[#080F1E] py-8 text-center text-white/20 text-xs">
        © 2025 FEDE — Article L1611-2 CGCT — <Link href="/" className="hover:text-white/40">{t("processus_detail.footer_back")}</Link>
      </footer>
    </div>
  );
}
