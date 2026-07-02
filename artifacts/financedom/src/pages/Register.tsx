import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, Shield, Check, ArrowLeft, ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useCountries } from "@/hooks/use-countries";
import { CSLogo } from "@/components/CSLogo";

const TYPE_KEYS = [
  "type_entrepreneur",
  "type_association",
  "type_collectivite",
  "type_entreprise",
  "type_groupement",
] as const;

interface Country { code: string; name: string; flag: string; }

function CountrySelect({ value, onChange, countries, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  countries: Country[];
  placeholder: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = countries.find(c => c.name === value);
  const filtered = query
    ? countries.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : countries;

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 300);
    }
    setOpen(v => !v);
    setQuery("");
  };

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 text-sm transition-all bg-white ${
          open
            ? "border-[#0D1F3C] ring-2 ring-[#0D1F3C]/15"
            : "border-[#DDE2EC] hover:border-[#0D1F3C]/40"
        } ${selected ? "text-[#1A2235]" : "text-[#A0AABF]"}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <><span className="text-base">{selected.flag}</span><span>{selected.name}</span></>
          ) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-[#A0AABF] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-full bg-white border border-[#DDE2EC] rounded-xl shadow-2xl overflow-hidden ${
            openUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <div className="p-2 border-b border-[#F1F4FA]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#A0AABF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t("register.country_search")}
                className="w-full pl-8 pr-3 py-2 text-sm bg-[#F8F9FC] border border-[#F1F4FA] rounded-lg focus:outline-none focus:border-[#0D1F3C]/30 focus:ring-1 focus:ring-[#0D1F3C]/10 text-[#1A2235] placeholder-[#A0AABF]"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-52 overscroll-contain">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#A0AABF] text-center">Aucun résultat</div>
            ) : filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelect(c.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  c.name === value
                    ? "bg-[#0D1F3C]/5 text-[#0D1F3C] font-semibold"
                    : "text-[#1A2235] hover:bg-[#F8F9FC]"
                }`}
              >
                <span className="text-base shrink-0">{c.flag}</span>
                <span>{c.name}</span>
                {c.name === value && <Check className="w-3.5 h-3.5 ml-auto text-[#0D1F3C] shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Register() {
  const { t } = useTranslation();
  const { data: countries = [] } = useCountries();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", tel: "", territoire: "", type: "", org: "", pwd: "", confirm: "", cgu: false });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const up = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.prenom || !form.nom || !form.email || !form.territoire || !form.type || !form.pwd) return;
    if (form.pwd !== form.confirm) return;
    if (!form.cgu) return;
    setLoading(true);
    try {
      await register({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        password: form.pwd,
        telephone: form.tel,
        territoire: form.territoire,
        typePorteur: form.type,
        organisation: form.org
      });
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [t("register.step1"), t("register.step2"), t("register.step3")];

  return (
    <div className="min-h-screen bg-[#F1F4FA] font-sans flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-2xl">

        {/* Top bar */}
        <div className="mb-3 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B7896] hover:text-[#0D1F3C] transition-colors font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("register.back")}
          </Link>
          <LanguageSelector variant="light" />
        </div>

        {/* Logo + title */}
        <div className="text-center mb-5 sm:mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4 cursor-pointer group">
            <CSLogo size="sm" variant="dark" showText subtitle={t("common.official_platform")} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0D1F3C] mb-1">{t("register.title")}</h1>
          <p className="text-[#6B7896] text-sm">{t("register.subtitle")}</p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center mb-5 sm:mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                step === i + 1 ? "bg-[#0D1F3C] text-white shadow-md" : step > i + 1 ? "bg-[#0D1F3C]/10 text-[#0D1F3C]" : "bg-white border border-[#DDE2EC] text-[#A0AABF]"
              }`}>
                <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-white text-[#0D1F3C]" : "bg-[#DDE2EC] text-[#A0AABF]"
                }`}>
                  {step > i + 1 ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : i + 1}
                </span>
                <span className="hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-5 sm:w-8 transition-all ${step > i + 1 ? "bg-[#0D1F3C]" : "bg-[#DDE2EC]"}`} />}
            </div>
          ))}
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-xl p-5 sm:p-8">

          {/* STEP 1 — Identité */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-[#0D1F3C] mb-3 sm:mb-4">{t("register.step1")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0D1F3C] mb-1.5 sm:mb-2">{t("register.firstname")} *</label>
                  <input value={form.prenom} onChange={e => up("prenom", e.target.value)} placeholder="Marie" className="w-full border border-[#DDE2EC] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0D1F3C] mb-1.5 sm:mb-2">{t("register.lastname")} *</label>
                  <input value={form.nom} onChange={e => up("nom", e.target.value)} placeholder="Beaumont" className="w-full border border-[#DDE2EC] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0D1F3C] mb-1.5 sm:mb-2">{t("register.email")} *</label>
                <input type="email" value={form.email} onChange={e => up("email", e.target.value)} placeholder="marie.beaumont@email.com" className="w-full border border-[#DDE2EC] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0D1F3C] mb-1.5 sm:mb-2">{t("register.phone")} <span className="text-[#A0AABF] font-normal text-xs">{t("register.phone_optional")}</span></label>
                <input type="tel" value={form.tel} onChange={e => up("tel", e.target.value)} placeholder="+33 6 00 00 00 00" className="w-full border border-[#DDE2EC] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
              </div>
              <button
                onClick={() => { if (form.prenom && form.nom && form.email) setStep(2); }}
                disabled={!form.prenom || !form.nom || !form.email}
                className="w-full bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#DDE2EC] disabled:text-[#A0AABF] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all text-sm mt-1 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {t("register.next")}
              </button>
            </div>
          )}

          {/* STEP 2 — Projet */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-[#0D1F3C] mb-3 sm:mb-4">{t("register.step2_title")}</h2>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0D1F3C] mb-1.5 sm:mb-2">{t("register.country")}</label>
                <CountrySelect
                  value={form.territoire}
                  onChange={v => up("territoire", v)}
                  countries={countries}
                  placeholder={t("register.country_placeholder")}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0D1F3C] mb-1.5 sm:mb-2">{t("register.type")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {TYPE_KEYS.map(key => (
                    <button key={key} onClick={() => up("type", key)} className={`text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${form.type === key ? "border-[#0D1F3C] bg-[#0D1F3C]/5 text-[#0D1F3C] shadow-sm" : "border-[#DDE2EC] text-[#4B5574] hover:border-[#0D1F3C]/30 hover:text-[#0D1F3C]"}`}>
                      {t(`register.${key}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0D1F3C] mb-1.5 sm:mb-2">{t("register.org")} <span className="text-[#A0AABF] font-normal text-xs">{t("register.org_optional")}</span></label>
                <input value={form.org} onChange={e => up("org", e.target.value)} placeholder="Nom de votre entreprise ou association" className="w-full border border-[#DDE2EC] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all" />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#DDE2EC] text-[#4B5574] font-semibold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm hover:bg-[#F1F4FA] transition-all">{t("register.back_step")}</button>
                <button
                  onClick={() => { if (form.territoire && form.type) setStep(3); }}
                  disabled={!form.territoire || !form.type}
                  className="flex-[2] bg-[#0D1F3C] hover:bg-[#162B52] disabled:bg-[#DDE2EC] disabled:text-[#A0AABF] text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  {t("register.next")}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Sécurité */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-[#0D1F3C] mb-3 sm:mb-4">{t("register.step3_title")}</h2>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0D1F3C] mb-1.5 sm:mb-2">{t("register.pwd")} *</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} value={form.pwd} onChange={e => up("pwd", e.target.value)} placeholder={t("register.pwd_placeholder")} className="w-full border border-[#DDE2EC] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C] transition-all pr-12" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AABF] hover:text-[#5B6580]">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0D1F3C] mb-1.5 sm:mb-2">{t("register.pwd_confirm")} *</label>
                <input type={show ? "text" : "password"} value={form.confirm} onChange={e => up("confirm", e.target.value)} placeholder={t("register.pwd_confirm_placeholder")} className={`w-full border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 transition-all ${form.confirm && form.pwd !== form.confirm ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-[#DDE2EC] focus:ring-[#0D1F3C]/15 focus:border-[#0D1F3C]"}`} />
                {form.confirm && form.pwd !== form.confirm && (
                  <p className="text-red-500 text-xs mt-1">{t("register.pwd_mismatch")}</p>
                )}
              </div>
              <div className="bg-[#F8F9FC] border border-[#DDE2EC] rounded-xl p-3 sm:p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.cgu} onChange={e => up("cgu", e.target.checked)} className="mt-0.5 accent-[#0D1F3C] w-4 h-4 shrink-0" />
                  <span className="text-xs sm:text-sm text-[#5B6580] leading-relaxed">{t("register.cgu")}</span>
                </label>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={() => setStep(2)} disabled={loading} className="flex-1 border border-[#DDE2EC] text-[#4B5574] font-semibold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm hover:bg-[#F1F4FA] disabled:opacity-50 transition-all">{t("register.back_step")}</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !form.pwd || form.pwd !== form.confirm || !form.cgu}
                  className="flex-[2] bg-[#FFD500] hover:bg-[#FFC900] disabled:bg-[#DDE2EC] disabled:text-[#A0AABF] text-[#0A1628] font-bold py-2.5 sm:py-3 rounded-xl transition-all text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  {loading ? t("register.creating") : t("register.create")}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs sm:text-sm text-[#6B7896] mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <span>{t("register.already")} <Link href="/login" className="text-[#0D1F3C] font-bold hover:underline">{t("register.signin")}</Link></span>
          <span className="flex items-center gap-1 text-[#A0AABF] text-xs"><Shield className="w-3 h-3" /> {t("register.free")}</span>
        </p>
      </div>
    </div>
  );
}
