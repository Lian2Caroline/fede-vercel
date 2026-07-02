import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useNoCopy } from "@/hooks/use-no-copy";
import { Star, ArrowLeft, CheckCircle, Quote, Shield, Send, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/useSEO";
import { CSLogo } from "@/components/CSLogo";

const BASE = import.meta.env.VITE_API_URL ?? "";

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

interface AvisItem {
  name: string;
  territoire: string;
  projet: string;
  note: number;
  montant: string;
  dispositif: string;
  texte: string;
  date: string;
  verified: boolean;
}

const REPARTITION = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 16 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
];

const STATS_AVIS_VAL_KEYS = ["avis_page.stat_val_rating", "avis_page.stat_val_satisfied", "avis_page.stat_val_files", "avis_page.stat_max_val"];
const STATS_AVIS_KEYS = ["avis_page.stat_rating", "avis_page.stat_satisfied", "avis_page.stat_files", "avis_page.stat_max"];

export default function Avis() {
  useNoCopy();
  const { t } = useTranslation();
  useSEO({
    title: t("avis_page.stat_rating", "Avis clients") + " — FEDE",
    description: t("avis_page.stat_satisfied", "Plus de 3 500 porteurs de projets ont fait confiance à FEDE."),
    path: "/avis",
  });
  const { user } = useAuth();
  const [filterTerr, setFilterTerr] = useState<string | null>(null);
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

  const localReviews = t("avis_reviews", { returnObjects: true }) as AvisItem[];
  const safeLocalReviews = Array.isArray(localReviews) ? localReviews : [];

  const allTemoignages: AvisItem[] = [
    ...apiReviews.map((r: any) => ({
      name: r.name, territoire: r.territoire, projet: r.typeProjet, note: r.note,
      montant: r.montant || "", dispositif: r.dispositif || "", texte: r.texte,
      date: r.date, verified: r.verified,
    })),
    ...safeLocalReviews,
  ];

  const uniqueTerritoires = Array.from(new Set(allTemoignages.map(r => r.territoire)));
  const filterAll = t("avis_page.filter_all");

  const displayed = filterTerr === null
    ? allTemoignages
    : allTemoignages.filter(r => r.territoire === filterTerr);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (form.texte.trim().length < 20) {
      setFormError(t("avis_page.error_short"));
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
    } catch {
      setFormError(t("avis_page.error_general"));
    } finally {
      setSubmitting(false);
    }
  }

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
              <span className="hidden sm:inline">{t("avis_page.back")}</span>
            </Link>
            <Link href="/register" className="whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#0D1F3C] hover:bg-[#162B52] text-white font-semibold rounded-lg transition-all shadow-md">
              {t("avis_page.submit")}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] py-20 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FFD500]/20 border border-[#FFD500]/30 rounded-full px-4 py-1.5 text-sm text-[#FFD500] font-semibold mb-6">
            <Star className="w-4 h-4 fill-[#FFD500]" /> {t("avis_page.hero_tag")}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t("avis_page.hero_title")}</h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto">{t("avis_page.hero_sub")}</p>
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
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-[#FFD500] text-[#FFD500]" />)}
                  </div>
                  <div className="text-[#5B6580] text-sm">{t("avis_page.based_on")}</div>
                </div>
              </div>
              <div className="space-y-2">
                {REPARTITION.map(r => (
                  <div key={r.stars} className="flex items-center gap-3">
                    <div className="text-sm text-[#4B5574] w-12 text-right">{r.stars} {r.stars > 1 ? t("avis_page.stars") : t("avis_page.star")}</div>
                    <div className="flex-1 bg-[#F1F4FA] rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-[#FFD500] rounded-full" style={{ width: `${r.pct}%` }} />
                    </div>
                    <div className="text-sm text-[#6B7896] w-10">{r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STATS_AVIS_VAL_KEYS.map((valKey, idx) => (
                <div key={idx} className="bg-[#F8F9FC] border border-[#DDE2EC] rounded-xl p-5 text-center">
                  <div className="text-3xl font-extrabold text-[#0D1F3C] mb-1">{t(valKey)}</div>
                  <div className="text-[#6B7896] text-xs">{t(STATS_AVIS_KEYS[idx])}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TEMOIGNAGES */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={() => setFilterTerr(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterTerr === null ? 'bg-[#0D1F3C] text-white shadow-md' : 'bg-white border border-[#DDE2EC] text-[#4B5574] hover:border-[#0D1F3C]/30'}`}>
            {filterAll}
          </button>
          {uniqueTerritoires.map((terr) => (
            <button key={terr} onClick={() => setFilterTerr(terr)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterTerr === terr ? 'bg-[#0D1F3C] text-white shadow-md' : 'bg-white border border-[#DDE2EC] text-[#4B5574] hover:border-[#0D1F3C]/30'}`}>
              {terr}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {displayed.map((item, i) => (
            <div key={i} className="bg-white border border-[#DDE2EC] rounded-2xl p-7 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(item.note)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#FFD500] text-[#FFD500]" />)}
                  {[...Array(5 - item.note)].map((_, j) => <Star key={j} className="w-4 h-4 text-[#DDE2EC]" />)}
                </div>
                {item.verified && (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    <CheckCircle className="w-3 h-3" /> {t("avis_page.verified")}
                  </span>
                )}
              </div>
              <Quote className="w-6 h-6 text-[#DDE2EC] mb-3" />
              <p className="text-[#4B5574] text-sm leading-relaxed mb-5">{item.texte}</p>
              <div className="border-t border-[#F1F4FA] pt-4 flex items-end justify-between">
                <div>
                  <div className="font-bold text-[#0D1F3C] text-sm">{item.name}</div>
                  <div className="text-[#8B9BB4] text-xs mt-0.5">{item.projet} · {item.territoire}</div>
                  <div className="text-[#8B9BB4] text-xs">{item.dispositif}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#1B6E3D] font-extrabold text-base">{item.montant}</div>
                  <div className="text-[#8B9BB4] text-xs">{t("avis_page.obtained")}</div>
                  <div className="text-[#8B9BB4] text-xs mt-1">{item.date}</div>
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
            <h2 className="text-2xl font-extrabold text-[#0D1F3C] mb-2">{t("avis_page.share_title")}</h2>
            <p className="text-[#6B7896] text-sm">{t("avis_page.share_sub")}</p>
          </div>

          {!user ? (
            <div className="bg-[#F8F9FC] border border-[#DDE2EC] rounded-2xl p-8 text-center">
              <Lock className="w-10 h-10 text-[#DDE2EC] mx-auto mb-3" />
              <p className="text-[#6B7896] font-medium mb-4">{t("avis_page.login_prompt")}</p>
              <div className="flex gap-3 justify-center">
                <Link href="/login" className="px-5 py-2.5 bg-[#0D1F3C] text-white rounded-lg text-sm font-semibold hover:bg-[#162B52] transition-colors">
                  {t("avis_page.login_btn")}
                </Link>
                <Link href="/register" className="px-5 py-2.5 border border-[#DDE2EC] text-[#4B5574] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                  {t("avis_page.register_btn")}
                </Link>
              </div>
            </div>
          ) : submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-extrabold text-green-800 text-lg mb-2">{t("avis_page.thanks_title")}</h3>
              <p className="text-green-700 text-sm mb-4">{t("avis_page.thanks_sub")}</p>
              <button onClick={() => setSubmitted(false)} className="text-green-700 text-sm font-semibold hover:underline">
                {t("avis_page.another")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#F8F9FC] border border-[#DDE2EC] rounded-2xl p-7 space-y-5">
              <div>
                <label className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide mb-2 block">{t("avis_page.rating_label")}</label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setForm(f => ({ ...f, note: n }))}
                      className="p-1 transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 transition-colors ${form.note >= n ? "fill-[#FFD500] text-[#FFD500]" : "text-[#DDE2EC]"}`} />
                    </button>
                  ))}
                  <span className="text-sm text-[#6B7896] ml-2">{form.note}/5</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide mb-2 block">{t("avis_page.project_label")}</label>
                <input
                  value={form.typeProjet}
                  onChange={e => setForm(f => ({ ...f, typeProjet: e.target.value }))}
                  placeholder={t("avis_page.project_ph")}
                  className="w-full border border-[#DDE2EC] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D1F3C] uppercase tracking-wide mb-2 block">{t("avis_page.text_label")}</label>
                <textarea
                  value={form.texte}
                  onChange={e => setForm(f => ({ ...f, texte: e.target.value }))}
                  placeholder={t("avis_page.text_ph")}
                  rows={5}
                  className="w-full border border-[#DDE2EC] rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] bg-white"
                />
                <div className={`text-xs mt-1 ${form.texte.length < 20 ? "text-[#8B9BB4]" : "text-green-600"}`}>
                  {form.texte.length} {t("avis_page.chars")} {form.texte.length < 20 ? `(${t("avis_page.chars_min")})` : "✓"}
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{formError}</div>
              )}

              <div className="flex items-center gap-3">
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#0D1F3C]/50 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                  <Send className="w-4 h-4" /> {submitting ? t("avis_page.submitting") : t("avis_page.submit_btn")}
                </button>
                <div className="flex items-center gap-1.5 text-xs text-[#8B9BB4]">
                  <Shield className="w-3.5 h-3.5" /> {t("avis_page.verified_notice")}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1A3561] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-3">{t("avis_page.cta_title")}</h2>
          <p className="text-white/65 mb-6">{t("avis_page.cta_sub")}</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#FFD500] hover:bg-[#FFC900] text-[#0A1628] font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl">
            {t("avis_page.cta_btn")}
          </Link>
        </div>
      </div>

      <footer className="bg-[#080F1E] py-8 text-center text-white/20 text-xs">
        © 2025 FEDE — Article L1611-2 CGCT — <Link href="/" className="hover:text-white/40">{t("avis_page.back")}</Link>
      </footer>
    </div>
  );
}
